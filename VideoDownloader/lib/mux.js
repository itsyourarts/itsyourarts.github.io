import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { assertPublicUrl, openPublic, PublicUrlError } from './network.js';
import { fetchManifest, parseHlsManifest, parseDashManifest, selectedHlsMaster, selectedDashManifest } from './streams.js';

const MAX_OUTPUT_BYTES = 2_000_000_000;
const MAX_CONVERSION_MS = 30 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function safeAbsoluteUri(value, base) {
  const parsed = new URL(value, base);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new PublicUrlError('This playlist contains an unsupported media URL.', 422);
  return parsed.toString();
}

export function absolutizeHlsMedia(contents, baseUrl) {
  return String(contents).split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('#')) {
      return line.replace(/URI="([^"]+)"/g, (_match, uri) => `URI="${safeAbsoluteUri(uri, baseUrl)}"`);
    }
    return safeAbsoluteUri(trimmed, baseUrl);
  }).join('\n');
}

async function prepareManifest(video) {
  const headers = video.requestHeaders || (video.referrer ? { Referer: video.referrer } : {});
  const manifest = await fetchManifest(video.url, headers);
  if (manifest.kind !== video.kind) throw new PublicUrlError('The stream format changed. Please scan the page again.', 422);
  if (video.kind === 'hls') {
    const parsed = parseHlsManifest(manifest.body, manifest.url);
    if (parsed.drm) throw new PublicUrlError('DRM-protected streams cannot be merged.', 422);
    if (parsed.type === 'master') {
      const selected = parsed.variants.find((variant) => variant.index === video.streamVariant.index);
      if (!selected) throw new PublicUrlError('That quality is no longer available. Please scan again.', 422);
      const child = await fetchManifest(selected.url, headers);
      const childInfo = parseHlsManifest(child.body, child.url);
      if (childInfo.drm) throw new PublicUrlError('DRM-protected streams cannot be merged.', 422);
      if (childInfo.type === 'media' && !childInfo.complete) {
        throw new PublicUrlError('Live streams cannot be saved as a complete MP4.', 422);
      }
      return { extension: 'm3u8', content: selectedHlsMaster(manifest.body, manifest.url, selected) };
    }
    if (!parsed.complete) throw new PublicUrlError('Live streams cannot be saved as a complete MP4.', 422);
    return { extension: 'm3u8', content: absolutizeHlsMedia(manifest.body, manifest.url) };
  }
  const parsed = parseDashManifest(manifest.body);
  if (parsed.drm) throw new PublicUrlError('DRM-protected streams cannot be merged.', 422);
  if (!parsed.complete) throw new PublicUrlError('Live streams cannot be saved as a complete MP4.', 422);
  const selected = parsed.variants.find((variant) => variant.adaptationIndex === video.streamVariant.adaptationIndex && variant.representationId === video.streamVariant.representationId);
  if (!selected) throw new PublicUrlError('That quality is no longer available. Please scan again.', 422);
  return { extension: 'mpd', content: selectedDashManifest(manifest.body, manifest.url, selected) };
}

// Every nested HLS/DASH connection is pinned to a validated public address.
// Only FFmpeg, on loopback, can access this temporary proxy. No video file is
// written to disk; the filtered playlist is served from memory.
export async function createSafeProxy(video, prepared) {
  const sockets = new Set();
  const safeHeaders = video.requestHeaders || (video.referrer ? { Referer: video.referrer } : {});
  const manifestPath = `/manifest.${prepared.extension}`;
  const proxy = http.createServer(async (req, res) => {
    // FFmpeg may address the in-memory playlist through this very proxy.
    // Accept that ONE local URL; nested media URLs still undergo public-IP validation.
    const localManifest = `http://127.0.0.1:${proxy.address()?.port}${manifestPath}`;
    if ((req.url === manifestPath || req.url === localManifest) && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': prepared.extension === 'mpd' ? 'application/dash+xml' : 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store',
      });
      res.end(prepared.content);
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method) || !/^https?:\/\//i.test(req.url || '')) {
      res.writeHead(403); res.end(); return;
    }
    try {
      const headers = { ...safeHeaders };
      if (req.headers.range && /^bytes=\d*-\d*$/i.test(req.headers.range)) headers.Range = req.headers.range;
      const { response } = await openPublic(req.url, { method: req.method, headers, timeoutMs: 15000 });
      const forwarded = {};
      for (const key of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control']) {
        if (response.headers[key]) forwarded[key] = response.headers[key];
      }
      res.writeHead(response.statusCode, forwarded);
      await pipeline(response, res);
    } catch {
      if (!res.headersSent) { res.writeHead(502); res.end('Unable to load media.'); }
      else res.destroy();
    }
  });
  proxy.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  proxy.on('connect', async (request, client, head) => {
    if (sockets.size > 64) { client.destroy(); return; }
    let upstream;
    try {
      const target = new URL(`https://${request.url}`);
      if (target.pathname !== '/' || target.search || target.hash) throw new Error('Invalid CONNECT authority');
      const port = Number(target.port || 443);
      const { address } = await assertPublicUrl(target.toString());
      upstream = net.connect({ host: address.address, port, family: address.family });
      upstream.setTimeout(45000, () => upstream.destroy());
      upstream.once('connect', () => {
        if (client.destroyed) { upstream.destroy(); return; }
        client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        if (head.length) upstream.write(head);
        client.pipe(upstream);
        upstream.pipe(client);
      });
      upstream.on('error', () => client.destroy());
      upstream.on('close', () => client.destroy());
      client.on('error', () => upstream.destroy());
      client.on('close', () => upstream.destroy());
    } catch {
      if (upstream) upstream.destroy();
      if (!client.destroyed) client.end('HTTP/1.1 403 Forbidden\r\n\r\n');
    }
  });
  await new Promise((resolve, reject) => {
    proxy.once('error', reject);
    proxy.listen(0, '127.0.0.1', resolve);
  });
  return {
    url: `http://127.0.0.1:${proxy.address().port}`,
    close() {
      for (const socket of sockets) socket.destroy();
      proxy.close();
    },
  };
}

// FFmpeg remuxes the chosen video track and audio into ONE fragmented MP4.
// Fragmented MP4 is still a single .mp4 file, but can be sent immediately
// without buffering or storing the whole video on the server.
export async function streamMergedVideo(video, req, res, { download = false } = {}) {
  const prepared = await prepareManifest(video);
  const proxy = await createSafeProxy(video, prepared);
  let child;
  let timeout;
  try {
    const headers = { ...(video.requestHeaders || (video.referrer ? { Referer: video.referrer } : {})) };
    const headerLines = Object.entries(headers)
      .filter(([key, value]) => /^[A-Za-z-]+$/.test(key) && typeof value === 'string' && !/[\r\n]/.test(value))
      .map(([key, value]) => `${key}: ${value}\r\n`).join('');
    const args = [
      '-hide_banner', '-nostdin', '-loglevel', 'error',
      '-protocol_whitelist', 'http,https,tcp,tls,crypto,httpproxy',
      '-rw_timeout', '15000000', '-user_agent', BROWSER_UA,
      ...(prepared.extension === 'm3u8' ? ['-allowed_extensions', 'ALL'] : []),
      ...(headerLines ? ['-headers', headerLines] : []),
      '-i', `${proxy.url}/manifest.${prepared.extension}`,
      '-map', '0:v:0', '-map', '0:a:0?', '-sn', '-dn',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
      '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
      '-f', 'mp4', 'pipe:1',
    ];
    child = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        http_proxy: proxy.url, https_proxy: proxy.url,
        HTTP_PROXY: proxy.url, HTTPS_PROXY: proxy.url,
        // Never bypass the validating proxy, even for a malicious localhost segment.
        no_proxy: '', NO_PROXY: '',
      },
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk.toString()).slice(-10000); });
    timeout = setTimeout(() => child.kill('SIGTERM'), MAX_CONVERSION_MS);
    const initial = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new PublicUrlError('The stream host took too long to start.', 504)), 30000);
      child.stdout.once('data', (chunk) => {
        child.stdout.pause(); // Prevent losing bytes before the pipeline attaches.
        clearTimeout(timer);
        resolve(chunk);
      });
      child.once('error', (error) => { clearTimeout(timer); reject(error); });
      child.once('close', (code) => {
        clearTimeout(timer);
        reject(new PublicUrlError(code === 0 ? 'This stream contains no MP4 video.' : `Could not merge this stream. ${stderr.slice(-220) || 'The source may have expired.'}`, 422));
      });
    });
    if (res.destroyed) return;
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Accept-Ranges', 'none');
    if (download) res.attachment(video.filename);
    else res.setHeader('Content-Disposition', 'inline');
    let sent = initial.length;
    if (sent > MAX_OUTPUT_BYTES) throw new PublicUrlError('Video exceeds the 2 GB safety limit.', 413);
    const cap = new Transform({
      transform(chunk, _encoding, callback) {
        sent += chunk.length;
        if (sent > MAX_OUTPUT_BYTES) callback(new Error('Video exceeds the 2 GB safety limit.'));
        else callback(null, chunk);
      },
    });
    res.write(initial);
    const onClose = () => { if (!res.writableFinished) child.kill('SIGTERM'); };
    res.once('close', onClose);
    try {
      // Keep the response open until FFmpeg confirms it finished cleanly.
      await pipeline(child.stdout, cap, res, { end: false });
      const exit = child.exitCode === null ? await new Promise((resolve) => child.once('close', resolve)) : child.exitCode;
      if (exit !== 0) throw new Error(stderr.slice(-220) || 'Media conversion failed.');
      res.end();
    } finally { res.off('close', onClose); }
  } finally {
    clearTimeout(timeout);
    if (child && child.exitCode === null) child.kill('SIGTERM');
    proxy.close();
  }
}
