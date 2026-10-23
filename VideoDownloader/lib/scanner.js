import { load } from 'cheerio';
import { gunzipSync, inflateSync, brotliDecompressSync } from 'node:zlib';
import { chromium } from 'playwright';
import { getDomain } from 'tldts';
import { assertPublicUrl, isMp4Url, normalizeUrl, openPublic, PublicUrlError, readLimited } from './network.js';
import { inspectManifest, isLikelyFragmentUrl, mediaKind, qualityLabel } from './streams.js';

const MAX_CANDIDATES = 64;
const MAX_RESULTS = 20;
const BROWSER_REQUEST_LIMIT = 140;

function text(value, limit = 110) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function decodeEmbedded(value) {
  return String(value || '')
    .replace(/\\u002[fF]|\\x2[fF]/g, '/')
    .replace(/\\u0026|\\x26/g, '&')
    .replace(/\\\//g, '/')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&#x0*27;/gi, "'")
    .trim();
}

function cleanMediaUrl(raw, base) {
  if (!raw || typeof raw !== 'string') return null;
  let value = decodeEmbedded(raw).replace(/^[\s'"`]+|[\s'"`,;]+$/g, '');
  if (value.startsWith('url(')) value = value.slice(4).replace(/\)$/, '').replace(/^['"]|['"]$/g, '');
  if (/^(?:blob:|data:|javascript:|file:)/i.test(value) || value.length > 2048) return null;
  try {
    const parsed = new URL(value, base);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    parsed.hash = '';
    return parsed.toString();
  } catch { return null; }
}

function collectFromMarkup(html, base, fallbackTitle) {
  const $ = load(html);
  const candidates = new Map();
  const pageTitle = text($('meta[property="og:title"]').attr('content') || $('title').first().text() || fallbackTitle, 140);
  const description = text($('meta[name="description"]').attr('content') || '', 175);
  const imageUrl = cleanMediaUrl($('meta[property="og:image"]').attr('content'), base);
  // Image URLs are shown only when they are served by the scanned site's own host.
  const poster = imageUrl && new URL(imageUrl).hostname === new URL(base).hostname ? imageUrl : null;
  const iframes = [];

  const add = (raw, source, force = false) => {
    if (candidates.size >= MAX_CANDIDATES) return;
    const url = cleanMediaUrl(raw, base);
    if (!url || (!force && !mediaKind(url))) return;
    if (!candidates.has(url)) candidates.set(url, { url, source, referrer: base, pageTitle });
  };

  $('video[src], video source[src], audio source[src]').each((_i, el) => add($(el).attr('src'), 'Video player', true));
  $('video[data-src], source[data-src], [data-video], [data-mp4], [data-file]').each((_i, el) => {
    for (const attr of ['data-src', 'data-video', 'data-mp4', 'data-file']) add($(el).attr(attr), 'Video player', true);
  });
  $('meta[property="og:video"], meta[property="og:video:url"], meta[property="og:video:secure_url"], meta[name="twitter:player:stream"], meta[itemprop="contentUrl"]').each((_i, el) => add($(el).attr('content'), 'Page metadata', true));
  $('a[href], link[href]').each((_i, el) => add($(el).attr('href'), 'Page link'));
  $('iframe[src]').slice(0, 4).each((_i, el) => {
    const url = cleanMediaUrl($(el).attr('src'), base);
    if (url && url !== base && !iframes.includes(url)) iframes.push(url);
  });

  // URLs in JSON-LD and page JavaScript are often escaped as https:\/\/... .
  // Keep manifests as well as MP4 links; segments are filtered after inspection.
  const searchText = decodeEmbedded(html.slice(0, 2_500_000));
  const matches = searchText.matchAll(/((?:https?:\/\/|\/\/|\/|\.\/|\.\.\/)[^\s"'<>()[\]{}\\]{1,700}?\.(?:mp4|m3u8|mpd)(?:\?[^\s"'<>()[\]{}\\]{0,500})?)/gi);
  for (const match of matches) {
    add(match[1], 'Embedded page data');
    if (candidates.size >= MAX_CANDIDATES) break;
  }

  return { candidates: [...candidates.values()], pageTitle, description, poster, iframes };
}

function decompress(buffer, encoding) {
  try {
    if (encoding === 'gzip') return gunzipSync(buffer, { maxOutputLength: 3_000_000 });
    if (encoding === 'deflate') return inflateSync(buffer, { maxOutputLength: 3_000_000 });
    if (encoding === 'br') return brotliDecompressSync(buffer, { maxOutputLength: 3_000_000 });
  } catch { throw new PublicUrlError('Could not read this webpage.', 422); }
  return buffer;
}

async function fetchDocument(url) {
  const { response, finalUrl } = await openPublic(url, {
    headers: { Accept: 'text/html,application/xhtml+xml,video/mp4;q=0.9,*/*;q=0.8' },
    timeoutMs: 10_000,
  });
  if (response.statusCode < 200 || response.statusCode >= 300) {
    response.resume();
    throw new PublicUrlError(`This website returned HTTP ${response.statusCode}. Try a public URL.`, 422);
  }
  const contentType = String(response.headers['content-type'] || '').toLowerCase();
  const kind = mediaKind(finalUrl, contentType);
  if (kind && !/text\/html|application\/json/.test(contentType)) {
    const size = kind === 'mp4' ? Number(response.headers['content-length']) || null : null;
    response.destroy(); // Never buffer a video or its manifest on this path.
    const rawTitle = decodeURIComponent(new URL(finalUrl).pathname.split('/').pop() || 'Video');
    const pageTitle = kind === 'mp4' ? filenameFromUrl(finalUrl) : text(rawTitle.replace(/\.(?:m3u8|mpd)$/i, '').replace(/[-_]/g, ' '), 95) || 'Video stream';
    return {
      finalUrl, direct: { url: finalUrl, kind, referrer: '', source: kind === 'mp4' ? 'Direct MP4 link' : 'Direct stream playlist', pageTitle, size },
      info: { pageTitle, description: '', poster: null, iframes: [], candidates: [] },
    };
  }
  if (contentType && !/html|text\/plain|application\/json/.test(contentType)) {
    response.resume();
    throw new PublicUrlError('This URL is not a webpage, MP4, HLS, or DASH link.', 422);
  }
  const raw = await readLimited(response);
  const html = decompress(raw, String(response.headers['content-encoding'] || '').toLowerCase()).toString('utf8');
  return { finalUrl, direct: null, info: collectFromMarkup(html, finalUrl, new URL(finalUrl).hostname) };
}

function filenameFromUrl(url) {
  let filename = '';
  try { filename = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'video.mp4'); }
  catch { filename = 'video.mp4'; }
  filename = filename.replace(/[\u0000-\u001f<>:"/\\|?*]/g, '-').replace(/^\.+/, '').slice(0, 100);
  if (!filename || !/\.mp4$/i.test(filename)) filename = `${filename || 'video'}.mp4`;
  return filename;
}

function getSize(headers, statusCode) {
  const match = String(headers['content-range'] || '').match(/\/(\d+)$/);
  if (match) return Number(match[1]) || null;
  if (statusCode === 206) return null;
  return Number(headers['content-length']) || null;
}

function validMp4Response(response, url) {
  if (response.statusCode < 200 || response.statusCode >= 300) return false;
  const type = String(response.headers['content-type'] || '').toLowerCase();
  if (type.includes('video/mp4') || type.includes('application/mp4')) return true;
  if (type.includes('text/') || type.includes('json') || type.includes('mpegurl') || type.includes('webm') || type.includes('xml')) return false;
  return isMp4Url(url) && (!type || type.includes('octet-stream') || type.includes('binary'));
}

// A CDN can serve a real MP4 from an extensionless URL while accepting only
// requests that look like the browser's own media request. Preserve a small,
// non-sensitive allowlist of headers that Chromium actually sent. Never copy
// Cookie, Authorization, Host, Connection, User-Agent, or arbitrary page headers.
function pickBrowserMediaHeaders(input = {}) {
  const source = Object.fromEntries(Object.entries(input).map(([key, value]) => [key.toLowerCase(), value]));
  const output = {};
  for (const [key, name] of [
    ['referer', 'Referer'], ['origin', 'Origin'],
    ['sec-fetch-dest', 'Sec-Fetch-Dest'], ['sec-fetch-mode', 'Sec-Fetch-Mode'],
    ['sec-fetch-site', 'Sec-Fetch-Site'],
  ]) {
    const value = source[key];
    if (typeof value !== 'string' || !value || value.length > 2048 || /[\r\n]/.test(value)) continue;
    if (key === 'referer' || key === 'origin') {
      try { if (!['http:', 'https:'].includes(new URL(value).protocol)) continue; }
      catch { continue; }
    }
    if (key === 'sec-fetch-dest' && !['video', 'empty'].includes(value)) continue;
    if (key === 'sec-fetch-mode' && !['no-cors', 'cors'].includes(value)) continue;
    if (key === 'sec-fetch-site' && !['same-origin', 'same-site', 'cross-site', 'none'].includes(value)) continue;
    output[name] = value;
  }
  return output;
}

function mediaHeadersForRequest(request, observed, pageUrl) {
  const headers = pickBrowserMediaHeaders(observed);
  const resource = request.resourceType();
  if (!['media', 'fetch', 'xhr'].includes(resource)) return headers;

  // Interception can omit Sec-Fetch-* from allHeaders(), although Chromium
  // sends them on the wire. Only reconstruct a real video or XHR media request.
  headers['Sec-Fetch-Dest'] ||= resource === 'media' ? 'video' : 'empty';
  headers['Sec-Fetch-Mode'] ||= resource === 'media' && !headers.Origin ? 'no-cors' : 'cors';
  if (!headers['Sec-Fetch-Site']) {
    let frameUrl = pageUrl;
    try { frameUrl = request.frame()?.url() || pageUrl; } catch { /* navigation or detached frame */ }
    try {
      const source = new URL(frameUrl);
      const target = new URL(request.url());
      const sourceSite = getDomain(source.hostname, { allowPrivateDomains: true });
      const targetSite = getDomain(target.hostname, { allowPrivateDomains: true });
      if (source.origin === target.origin) {
        headers['Sec-Fetch-Site'] = 'same-origin';
      } else if (source.protocol === target.protocol && sourceSite && sourceSite === targetSite) {
        headers['Sec-Fetch-Site'] = 'same-site';
      } else {
        headers['Sec-Fetch-Site'] = 'cross-site';
      }
    } catch { headers['Sec-Fetch-Site'] = 'cross-site'; }
  }
  return headers;
}

async function probeCandidate(candidate) {
  const headers = candidate.requestHeaders || (candidate.referrer ? { Referer: candidate.referrer } : {});
  let response;
  let finalUrl;
  try {
    ({ response, finalUrl } = await openPublic(candidate.url, { method: 'HEAD', headers, timeoutMs: 7500 }));
    if (!validMp4Response(response, finalUrl)) {
      response.resume();
      ({ response, finalUrl } = await openPublic(candidate.url, {
        headers: { ...headers, Range: 'bytes=0-1' }, timeoutMs: 7500,
      }));
    }
    const valid = validMp4Response(response, finalUrl);
    const size = getSize(response.headers, response.statusCode) || candidate.size || null;
    response.destroy();
    if (!valid) return null;
    const filename = filenameFromUrl(finalUrl);
    const slug = filename.replace(/\.mp4$/i, '').replace(/[_-]+/g, ' ').trim();
    const title = slug.length > 4 && !/^[a-f\d]{16,}$/i.test(slug) ? text(slug, 90) : text(candidate.pageTitle || 'Untitled video', 90);
    // Browser videoWidth/videoHeight reflect the actual encoded MP4, unlike
    // an HTML width attribute or a sometimes-misleading filename.
    const measuredHeight = Number(candidate.height);
    const measuredWidth = Number(candidate.width);
    const height = Number.isInteger(measuredHeight) && measuredHeight > 0 && measuredHeight <= 8192
      ? measuredHeight : Number(finalUrl.match(/(?:^|[^\d])(2160|1440|1080|720|480|360)p(?:[^\d]|$)/i)?.[1]) || null;
    const width = Number.isInteger(measuredWidth) && measuredWidth > 0 && measuredWidth <= 8192 ? measuredWidth : null;
    const quality = height ? qualityLabel(height) : 'Source';
    return {
      kind: 'mp4',
      url: finalUrl,
      referrer: candidate.referrer || '',
      requestHeaders: candidate.requestHeaders || null,
      filename,
      title,
      size,
      source: candidate.source,
      quality,
      variants: [{ index: 0, url: finalUrl, quality, width, height }],
      domain: new URL(finalUrl).hostname.replace(/^www\./, ''),
    };
  } catch { return null; }
}

function deduplicateDirectVideos(videos) {
  const byFinalUrl = new Map();
  for (const video of videos) {
    const previous = byFinalUrl.get(video.url);
    if (!previous) { byFinalUrl.set(video.url, video); continue; }
    // HTTP and HTTPS player URLs may redirect to the exact same MP4. Keep
    // browser-request headers for playback, plus whichever copy has measured
    // source dimensions. Do not display the same file as two qualities/videos.
    const preferred = video.requestHeaders && !previous.requestHeaders ? video : previous;
    const measured = video.variants[0].height ? video.variants[0] : previous.variants[0];
    byFinalUrl.set(video.url, {
      ...preferred,
      size: preferred.size || previous.size || video.size,
      quality: measured.quality,
      variants: [{ ...preferred.variants[0], quality: measured.quality, width: measured.width || null, height: measured.height || null }],
    });
  }
  return [...byFinalUrl.values()];
}

function isBrowserMediaRequest(request) {
  return Boolean(mediaKind(request.url())) || request.resourceType() === 'media';
}

// An optional browser pass catches MP4s requested by client-side players. Every
// browser request is checked against the same public-host policy before it loads.
async function scanInBrowser(url, pageTitle) {
  if (process.env.ENABLE_BROWSER_SCAN === '0') return { candidates: [], screenshot: null, unavailable: true };
  let browser;
  const found = new Map();
  let screenshot = null;
  try {
    browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage', '--no-sandbox'] });
    const context = await browser.newContext({
      viewport: { width: 1100, height: 690 },
      deviceScaleFactor: 1,
      serviceWorkers: 'block',
      ignoreHTTPSErrors: false,
    });
    const page = await context.newPage();
    let requests = 0;
    const checkedHosts = new Map();
    await context.route('**/*', async (route) => {
      const requestUrl = route.request().url();
      requests += 1;
      if (requests > BROWSER_REQUEST_LIMIT || !/^https?:\/\//i.test(requestUrl)) {
        await route.abort().catch(() => {});
        return;
      }
      try {
        const host = new URL(requestUrl).host;
        if (!checkedHosts.has(host)) checkedHosts.set(host, await assertPublicUrl(requestUrl));
        await route.continue().catch(() => {});
      } catch { await route.abort().catch(() => {}); }
    });
    const pendingMediaHeaders = [];
    const add = (candidateUrl, source, referrer = url, requestHeaders = null, kind = null, dimensions = null) => {
      const cleaned = cleanMediaUrl(candidateUrl, url);
      if (!cleaned) return;
      const width = Number(dimensions?.width) || null;
      const height = Number(dimensions?.height) || null;
      const existing = found.get(cleaned);
      if (existing) {
        // The player provides actual encoded dimensions once metadata loads.
        // A later network response adds its verified format and safe headers.
        if (width > 0 && height > 0) Object.assign(existing, { width, height });
        if (requestHeaders) Object.assign(existing, { requestHeaders, source, referrer });
        if (kind) existing.kind = kind;
        return;
      }
      if (found.size < MAX_CANDIDATES) {
        found.set(cleaned, { url: cleaned, source, referrer, pageTitle, requestHeaders, kind: kind || mediaKind(cleaned), width, height });
      }
    };
    context.on('request', (request) => {
      // MP4 players often use extensionless /api/stream URLs. Capture the
      // request's own media headers immediately; the response may arrive late.
      if (!isBrowserMediaRequest(request)) return;
      let referrer = url;
      try { referrer = request.frame()?.url() || url; } catch { /* navigation requests can have no frame */ }
      pendingMediaHeaders.push(request.allHeaders()
        .then((headers) => add(request.url(), 'Browser network request', referrer, mediaHeadersForRequest(request, headers, url)))
        .catch(() => add(request.url(), 'Browser network request', referrer)));
    });
    context.on('response', (response) => {
      const type = String(response.headers()['content-type'] || '').toLowerCase();
      if (!mediaKind(response.url(), type)) return;
      let referrer = url;
      try { referrer = response.request().frame()?.url() || url; } catch { /* frame may have detached */ }
      pendingMediaHeaders.push(response.request().allHeaders()
        .then((headers) => add(response.url(), 'Browser media response', referrer, mediaHeadersForRequest(response.request(), headers, url), mediaKind(response.url(), type)))
        .catch(() => add(response.url(), 'Browser media response', referrer, null, mediaKind(response.url(), type))));
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 11_000 }).catch(() => {});
    // React/Vue players often mount after DOMContentLoaded. The old scanner
    // inspected an empty #root and closed before the video request started.
    await page.waitForSelector('video, source[src]', { state: 'attached', timeout: 4800 }).catch(() => {});
    // Starting a muted HTML5 video causes lazy-loaded public MP4 requests to
    // appear. Read its metadata again after loading: videoWidth/videoHeight
    // reveal the *actual* source resolution, even for an unlabelled .mp4.
    const gatherPlayerSources = async (frame, startPlayback) => {
      try {
        const sources = await frame.evaluate((start) => {
          const links = [];
          for (const element of document.querySelectorAll('video, video source')) {
            const video = element.tagName === 'VIDEO' ? element : element.parentElement;
            if (video?.tagName === 'VIDEO' && start) {
              video.muted = true;
              video.play().catch(() => {});
            }
            for (const value of [element.src, element.currentSrc, element.getAttribute('data-src')]) {
              if (value) links.push({ url: value, width: video?.videoWidth || null, height: video?.videoHeight || null });
            }
          }
          return links;
        }, startPlayback);
        sources.forEach((item) => add(item.url, 'Browser video player', frame.url() || url, null, null, item));
      } catch { /* cross-origin or detached frames are fine */ }
    };
    await Promise.all(page.frames().slice(0, 8).map((frame) => gatherPlayerSources(frame, true)));
    await page.waitForTimeout(2700);
    await Promise.all(page.frames().slice(0, 8).map((frame) => gatherPlayerSources(frame, false)));
    await Promise.allSettled(pendingMediaHeaders);
    // SPA titles often appear only after their video API responds.
    const renderedTitle = text(await page.title().catch(() => ''), 140);
    if (renderedTitle) {
      for (const candidate of found.values()) candidate.pageTitle = renderedTitle;
    }
    try {
      const capture = await page.screenshot({ type: 'jpeg', quality: 54, timeout: 2600 });
      if (capture.length < 350_000) screenshot = `data:image/jpeg;base64,${capture.toString('base64')}`;
    } catch { /* screenshot is decorative, not needed for detection */ }
    return { candidates: [...found.values()], screenshot, unavailable: false };
  } catch {
    return { candidates: [...found.values()], screenshot: null, unavailable: true };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

export async function scanPage(input, { deep = false } = {}) {
  const requestedUrl = normalizeUrl(input);
  await assertPublicUrl(requestedUrl);
  const { finalUrl, direct, info } = await fetchDocument(requestedUrl);
  const candidates = [...info.candidates];
  let screenshot = null;
  let usedBrowser = false;
  let browserUnavailable = false;

  // A small number of embedded pages are inspected when the main document has no MP4.
  if (!direct && candidates.length === 0 && info.iframes.length) {
    const embedded = await Promise.allSettled(info.iframes.slice(0, 2).map((frameUrl) => fetchDocument(frameUrl)));
    for (const result of embedded) {
      if (result.status !== 'fulfilled') continue;
      const frame = result.value;
      if (frame.direct) candidates.push(frame.direct);
      else candidates.push(...frame.info.candidates);
    }
  }

  // A markup URL can be an MP4 fragment or an extensionless player endpoint.
  // Neither is enough to skip the browser: it may reveal the master playlist
  // or the real media-request headers for the complete video.
  const hasCompleteMarkupCandidate = candidates.some((candidate) =>
    mediaKind(candidate.url) && !isLikelyFragmentUrl(candidate.url));
  // A single unlabelled MP4 in a <video> is a valid download, but the page
  // gives no quality metadata. Load its video metadata in Chromium to label
  // the actual resolution rather than presenting a misleading "Source".
  const hasUnlabelledMp4Player = candidates.some((candidate) =>
    candidate.source === 'Video player' && mediaKind(candidate.url) === 'mp4' &&
    !/(?:^|[^\d])(?:2160|1440|1080|720|480|360)p(?:[^\d]|$)/i.test(candidate.url));
  if (!direct && (!hasCompleteMarkupCandidate || hasUnlabelledMp4Player || deep)) {
    const browserResult = await scanInBrowser(finalUrl, info.pageTitle);
    candidates.push(...browserResult.candidates);
    screenshot = browserResult.screenshot;
    usedBrowser = !browserResult.unavailable;
    browserUnavailable = browserResult.unavailable;
  }
  if (direct) candidates.unshift(direct);

  const unique = [...new Map(candidates.map((candidate) => [candidate.url, candidate])).values()].slice(0, MAX_CANDIDATES);
  // Inspect playlists FIRST. An HLS/DASH manifest represents the entire video;
  // individual .ts/.m4s/.mp4 segment requests must not become separate results.
  const manifestCandidates = unique.filter((candidate) => ['hls', 'dash'].includes(candidate.kind || mediaKind(candidate.url))).slice(0, 10);
  const inspected = await Promise.all(manifestCandidates.map((candidate) => inspectManifest(candidate).catch(() => null)));
  const streams = inspected.filter(Boolean);
  const childUrls = new Set(streams.flatMap((stream) => stream.childUrls || []));
  const groupedStreams = streams.filter((stream) => !childUrls.has(stream.url));
  const mp4Candidates = unique.filter((candidate) => {
    const kind = candidate.kind || mediaKind(candidate.url);
    if (kind && kind !== 'mp4') return false;
    if (isLikelyFragmentUrl(candidate.url) || childUrls.has(candidate.url)) return false;
    if (groupedStreams.length && candidate.source.startsWith('Browser')) return false;
    return true;
  }).slice(0, Math.max(0, MAX_RESULTS - groupedStreams.length));
  const directVideos = deduplicateDirectVideos((await Promise.all(mp4Candidates.map(probeCandidate))).filter(Boolean));
  return {
    requestedUrl,
    pageUrl: finalUrl,
    pageTitle: info.pageTitle || new URL(finalUrl).hostname,
    description: info.description || '',
    poster: info.poster,
    screenshot,
    usedBrowser,
    browserUnavailable,
    videos: [...groupedStreams, ...directVideos].slice(0, MAX_RESULTS),
  };
}

export const __testing = { cleanMediaUrl, collectFromMarkup, filenameFromUrl, validMp4Response, pickBrowserMediaHeaders, mediaHeadersForRequest, isBrowserMediaRequest, deduplicateDirectVideos };
