import express from 'express';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { openPublic, PublicUrlError } from './lib/network.js';
import { scanPage } from './lib/scanner.js';
import { streamMergedVideo } from './lib/mux.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEO_TTL_MS = 25 * 60 * 1000;
const MAX_STREAM_BYTES = 2_000_000_000;
const MAX_ACTIVE_SCANS = 3;
const MAX_ACTIVE_CONVERSIONS = 2;
const FFMPEG_AVAILABLE = spawnSync('ffmpeg', ['-version'], { timeout: 4000, stdio: 'ignore' }).status === 0;
const scansByIp = new Map();
const videoTokens = new Map();
let activeScans = 0;
let activeConversions = 0;

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'");
  next();
});
app.use(express.json({ limit: '12kb' }));
// During frequent UI updates a one-hour browser cache served an older player,
// making newly added quality controls appear missing. Always serve fresh assets.
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'], maxAge: 0, etag: false, lastModified: false,
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store'),
}));

function checkScanRate(ip) {
  const now = Date.now();
  const recent = (scansByIp.get(ip) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 12) return false;
  recent.push(now);
  scansByIp.set(ip, recent);
  return true;
}

function keepToken(video) {
  const id = randomBytes(20).toString('base64url');
  videoTokens.set(id, { ...video, expiresAt: Date.now() + VIDEO_TTL_MS });
  if (videoTokens.size > 300) {
    for (const [key, value] of videoTokens) {
      if (value.expiresAt < Date.now() || videoTokens.size > 280) videoTokens.delete(key);
    }
  }
  return id;
}

function filenameForVariant(video, variant) {
  if (video.kind === 'mp4' && video.filename) return video.filename;
  const base = String(video.title || 'video')
    .replace(/[^\p{L}\p{N}._ -]+/gu, '-')
    .replace(/\s+/g, '_')
    .replace(/^[-._]+|[-._]+$/g, '')
    .slice(0, 78) || 'video';
  const quality = variant.quality && variant.quality !== 'Source'
    ? `_${variant.quality.replace(/[^A-Za-z0-9]/g, '')}` : '';
  return `${base}${quality}.mp4`;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, browserScanning: process.env.ENABLE_BROWSER_SCAN !== '0', ffmpegAvailable: FFMPEG_AVAILABLE }));

app.post('/api/scan', async (req, res, next) => {
  if (!checkScanRate(req.ip)) return res.status(429).json({ error: 'Too many scans. Please wait a minute and try again.' });
  if (activeScans >= MAX_ACTIVE_SCANS) return res.status(503).json({ error: 'The scanner is busy. Please try again shortly.' });
  activeScans += 1;
  try {
    const url = req.body?.url;
    const result = await scanPage(url, { deep: req.body?.deep === true });
    const videos = result.videos.map((video) => {
      const variants = video.variants.map((variant) => ({
        id: keepToken({ ...video, streamVariant: variant, filename: filenameForVariant(video, variant) }),
        quality: variant.quality,
        width: variant.width || null,
        height: variant.height || null,
        bandwidth: variant.bandwidth || null,
        size: variant.size || (video.kind === 'mp4' ? video.size : null) || null,
        sizeEstimated: Boolean(variant.sizeEstimated),
      }));
      const preferred = variants[variants.length - 1]; // Highest resolution actually supplied by the source.
      return {
        id: preferred.id,
        title: video.title,
        filename: filenameForVariant(video, video.variants[video.variants.length - 1]),
        size: video.size,
        source: video.source,
        quality: preferred.quality,
        variants,
        kind: video.kind,
        merged: video.kind !== 'mp4',
        domain: video.domain,
        url: video.url,
        type: 'MP4',
      };
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ...result, videos });
  } catch (error) { return next(error); }
  finally { activeScans -= 1; }
});

async function serveVideo(req, res, next, download = false) {
  const video = videoTokens.get(req.params.id);
  if (!video || video.expiresAt < Date.now()) {
    videoTokens.delete(req.params.id);
    return res.status(404).json({ error: 'This video link expired. Please scan the page again.' });
  }
  if (video.kind === 'hls' || video.kind === 'dash') {
    if (!FFMPEG_AVAILABLE) return res.status(503).json({ error: 'FFmpeg is not installed on the server. Install it to merge HLS/DASH streams.' });
    if (activeConversions >= MAX_ACTIVE_CONVERSIONS) return res.status(503).json({ error: 'Two videos are being merged right now. Please try again shortly.' });
    activeConversions += 1;
    try { await streamMergedVideo(video, req, res, { download }); }
    catch (error) { if (res.headersSent) res.destroy(error); else next(error); }
    finally { activeConversions -= 1; }
    return;
  }
  // Reuse only the safe media-request headers observed in Chromium. Some
  // public MP4 endpoints reject generic HTTP clients without Fetch Metadata.
  const headers = { ...(video.requestHeaders || (video.referrer ? { Referer: video.referrer } : {})) };
  if (req.headers.range && /^bytes=\d*-\d*$/i.test(req.headers.range)) {
    headers.Range = req.headers.range;
  }
  try {
    const { response, finalUrl } = await openPublic(video.url, { headers, timeoutMs: 15_000 });
    if (response.statusCode !== 200 && response.statusCode !== 206) {
      response.resume();
      return res.status(502).json({ error: `The video host returned HTTP ${response.statusCode}. The link may have expired.` });
    }
    const contentType = String(response.headers['content-type'] || '').toLowerCase();
    if (/text\/html|application\/json|mpegurl|video\/webm/.test(contentType) ||
        (!/video\/mp4|application\/mp4|octet-stream|binary/.test(contentType) && !/\.mp4(?:$|\?)/i.test(finalUrl))) {
      response.destroy();
      return res.status(502).json({ error: 'The source did not return an MP4 file.' });
    }
    const length = Number(response.headers['content-length']) || 0;
    if (length > MAX_STREAM_BYTES) {
      response.destroy();
      return res.status(413).json({ error: 'This MP4 exceeds the 2 GB safety limit.' });
    }
    res.status(response.statusCode);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Accept-Ranges', response.headers['accept-ranges'] || 'bytes');
    if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
    if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
    if (download) res.attachment(video.filename);
    else res.setHeader('Content-Disposition', 'inline');
    let sent = 0;
    const cap = new Transform({
      transform(chunk, _encoding, callback) {
        sent += chunk.length;
        if (sent > MAX_STREAM_BYTES) callback(new Error('Video exceeds download limit.'));
        else callback(null, chunk);
      },
    });
    await pipeline(response, cap, res);
  } catch (error) {
    if (res.headersSent) res.destroy(error);
    else next(error);
  }
}

app.get('/api/video/:id', (req, res, next) => serveVideo(req, res, next, false));
app.get('/api/download/:id', (req, res, next) => serveVideo(req, res, next, true));

app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'index.html'), { cacheControl: false, etag: false, lastModified: false });
});
app.use((error, _req, res, _next) => {
  const status = error instanceof PublicUrlError ? error.status : (error.status || 500);
  if (status >= 500) console.error('[server]', error.stack || error.message);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong. Please try again.' : error.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VideoFetch Studio running on http://0.0.0.0:${PORT}`);
  console.log(`Browser scan: ${process.env.ENABLE_BROWSER_SCAN === '0' ? 'disabled' : 'enabled when needed'}`);
});
