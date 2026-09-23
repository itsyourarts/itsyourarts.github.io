/**
 * GODxSHADOW — Neon Instagram Downloader
 * Multi-engine resolver:
 *  1. FastDL's own /api/convert (best-effort, needs tokens)
 *  2. Direct page scrape (works when IG serves the IP)
 *  3. Instagram oEmbed (author + thumbnail, no-auth, always works)
 *  4. /p/<code>/media?size=l (full 1080px photo / video cover frame)
 * If video file is blocked → returns poster + FastDL bridge link.
 */
const express = require('express');
const path = require('path');
const vm = require('vm');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- constants ----------
const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const IG_RE = /(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/[A-Za-z0-9_.\-/?=&%#]+/i;

function extractShortcode(url) {
  let m = url.match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (m) return m[2];
  // share links: /share/reel/CODE, /share/CODE
  m = url.match(/\/share\/(?:(?:p|reel|reels|tv)\/)?([A-Za-z0-9_-]{5,})/);
  if (m) return m[1];
  return null;
}
function isProfileLink(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    const segs = u.pathname.split('/').filter(Boolean);
    if (segs.length !== 1) return false;
    const s = segs[0].toLowerCase();
    const reserved = ['p', 'reel', 'reels', 'tv', 'stories', 'explore', 'reels_tab', 'direct', 'accounts', 'share', 's', 'about', 'developer', 'download'];
    return !reserved.includes(s);
  } catch {
    return false;
  }
}
function detectKind(url) {
  if (/\/(reel|reels)\//i.test(url)) return 'reel';
  if (/\/tv\//i.test(url)) return 'tv';
  if (/\/stories\//i.test(url)) return 'story';
  if (/\/p\//i.test(url)) return 'post';
  return 'unknown';
}
function fastdlBridgeUrl(url) {
  // FastDL auto-reads ?url= and auto-starts search (applyQueryFromLocationAndSearch)
  return 'https://fastdl.app/en?url=' + encodeURIComponent(url);
}
// NOTE: Instagram blanks scontent image bytes for datacenter IPs (white JPEG),
// but the same CDN URL loads the REAL image in the user's own browser.
// So CDN images must be linked DIRECT (never via our /api/proxy).
function isIGCDN(u) {
  return /cdninstagram\.com/i.test(u || '');
}

// ---------- generic fetch ----------
async function fetchHtml(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': DESKTOP_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
    const text = await res.text();
    return { status: res.status, html: text };
  } finally {
    clearTimeout(t);
  }
}

function metaContent(html, prop) {
  const res = [
    new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${prop}["']`, 'i'),
  ];
  for (const re of res) {
    const m = html.match(re);
    if (m) return m[1].replace(/&amp;/g, '&');
  }
  return null;
}
function extractAllMeta(html, prop) {
  const out = [];
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, 'gi');
  let m;
  while ((m = re.exec(html)) !== null) {
    const c = m[0].match(/content=["']([^"']+)["']/i);
    if (c) out.push(c[1].replace(/&amp;/g, '&'));
  }
  return [...new Set(out)];
}

// ---------- ENGINE 1: direct scrape ----------
async function resolveInstagram(url) {
  const attempts = [url];
  const shortcode = extractShortcode(url);
  if (shortcode) attempts.push(`https://www.instagram.com/p/${shortcode}/embed/captioned/`);
  let lastStatus = 0;
  let combinedHtml = '';
  for (const attempt of attempts) {
    try {
      const { status, html } = await fetchHtml(attempt);
      lastStatus = status;
      if (html) combinedHtml += '\n' + html;
      if (!html || html.length < 2000) continue;
      const videos = extractAllMeta(html, 'og:video').concat(extractAllMeta(html, 'twitter:player:stream'));
      const images = extractAllMeta(html, 'og:image');
      const title = metaContent(html, 'og:title') || '';
      const desc = metaContent(html, 'og:description') || '';
      const thumb = images[0] || null;
      const jsonVideos = [];
      for (const vm of (html.match(/"video_url"\s*:\s*"([^"]+)"/g) || []).slice(0, 5)) {
        const u = vm.match(/"video_url"\s*:\s*"([^"]+)"/)[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
        if (u.startsWith('http')) jsonVideos.push(u);
      }
      const jsonImages = [];
      for (const im of (html.match(/"display_url"\s*:\s*"([^"]+)"/g) || []).slice(0, 10)) {
        const u = im.match(/"display_url"\s*:\s*"([^"]+)"/)[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
        if (u.startsWith('http')) jsonImages.push(u);
      }
      const allVideos = [...new Set([...videos, ...jsonVideos])].filter(Boolean);
      const allImages = [...new Set([...images, ...jsonImages])].filter(Boolean);
      if (allVideos.length || allImages.length) {
        const medias = [];
        allVideos.slice(0, 4).forEach((v, i) => {
          medias.push({ type: 'video', quality: i === 0 ? 'HD 720p' : `Source ${i + 1}`, ext: 'mp4', url: v });
        });
        if (allVideos.length === 0) {
          allImages.slice(0, 10).forEach((img, i) => {
            medias.push({ type: 'image', quality: allImages.length > 1 ? `Photo ${i + 1} · Original` : 'Original 1080px', ext: 'jpg', url: img });
          });
        }
        return {
          success: true, source: url, shortcode,
          author: title.replace(/ on Instagram.*$/i, '').replace(/^"|"$/g, '') || 'instagram',
          caption: desc || '', thumbnail: thumb || allImages[0] || null,
          medias, carousel: allImages.length > 1 && allVideos.length === 0,
        };
      }
    } catch { /* next */ }
  }
  if (/login_and_signup_page|not-logged-in|challenge\/|rate_limit/i.test(combinedHtml)) {
    return { success: false, error: 'RATE_LIMIT', status: lastStatus };
  }
  return { success: false, error: 'NOT_FOUND', status: lastStatus };
}

// ---------- ENGINE 2: FastDL's own API (best-effort) ----------
function extractMediaUrls(obj, depth = 0) {
  const out = [];
  if (!obj || depth > 6) return out;
  if (typeof obj === 'string') {
    if (/^https?:\/\/\S+\.(mp4|mov|jpg|jpeg|webp)(\?\S*)?$/i.test(obj)) out.push(obj);
    else if (obj.startsWith('http') && obj.includes('cdninstagram')) out.push(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    for (const v of obj) out.push(...extractMediaUrls(v, depth + 1));
    return [...new Set(out)];
  }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) out.push(...extractMediaUrls(obj[k], depth + 1));
    return [...new Set(out)];
  }
  return out;
}
async function tryFastDLConvert(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25000);
    const res = await fetch('https://fastdl.app/api/convert', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'User-Agent': DESKTOP_UA,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'https://fastdl.app',
        Referer: 'https://fastdl.app/en',
      },
      body: JSON.stringify({ target_url: url }),
    });
    clearTimeout(t);
    const txt = await res.text();
    let j;
    try { j = JSON.parse(txt); } catch { return null; }
    if (j && (j.success === true || j.result)) {
      const found = extractMediaUrls(j);
      if (found.length) return found;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------- ENGINE 3: Instagram oEmbed (no-auth) ----------
async function fetchOEmbed(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch('https://i.instagram.com/api/v1/oembed/?url=' + encodeURIComponent(url), {
      signal: ctrl.signal,
      headers: { 'User-Agent': DESKTOP_UA, Accept: 'application/json' },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const j = await res.json();
    if (!j || (!j.thumbnail_url && !j.author_name)) return null;
    return j;
  } catch {
    return null;
  }
}

// ---------- ENGINE 4: /media?size=l (full-res photo / cover frame) ----------
async function resolveMediaImage(shortcode, debug) {
  if (!shortcode) {
    if (debug) debug.mediaImage = 'skip:no-shortcode';
    return null;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 18000);
      const res = await fetch(`https://www.instagram.com/p/${shortcode}/media?size=l`, {
        signal: ctrl.signal,
        redirect: 'follow',
        headers: { 'User-Agent': DESKTOP_UA, Accept: 'image/*,*/*;q=0.8' },
      });
      clearTimeout(t);
      const ct = res.headers.get('content-type') || '';
      try { if (res.body) await res.body.cancel(); } catch { /* ignore */ }
      if (res.ok && ct.startsWith('image/') && res.url && res.url.includes('cdninstagram')) {
        if (debug) debug.mediaImage = 'ok';
        return res.url;
      }
      if (debug) debug.mediaImage = `fail:http${res.status}:${ct.slice(0, 30)}`;
    } catch (e) {
      if (debug) debug.mediaImage = 'fail:' + String((e && e.message) || e).slice(0, 60);
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1200));
    }
  }
  return null;
}

// ---------- ENGINE 5: SnapSave one-click (video MP4, photos) ----------
// Snapsave sessions bypass IG login-wall + geoblock. Flow: POST action.php
// → packed JS → decode in vm sandbox → rapidcdn JWT → real CDN file URL.
const snapCache = new Map(); // shortcode -> { ts, medias }
function snapGet(code) {
  const e = snapCache.get(code);
  if (e && Date.now() - e.ts < 45 * 60 * 1000) return e.medias;
  if (e) snapCache.delete(code);
  return null;
}
function decodeSnapSave(txt) {
  if (!txt || typeof txt !== 'string' || txt.length < 200 || !txt.includes('eval(')) return '';
  const code = txt.replace(/\beval\(/, 'fakeEval('); // only the outer packer eval
  const box = {
    fakeEval: (s) => { box.__out = String(s).slice(0, 300000); return s; },
    __out: '',
  };
  try {
    vm.runInNewContext(code, box, { timeout: 3000 });
  } catch {
    /* malformed/blocked response */
  }
  return box.__out || '';
}
function extractRapidMedia(decoded) {
  const out = [];
  const re = /https:\/\/d\.rapidcdn\.app\/v2\?token=([A-Za-z0-9_.\-]+)/g;
  let m;
  while ((m = re.exec(decoded))) {
    try {
      const parts = m[1].split('.');
      if (parts.length < 2) continue;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (payload && typeof payload.url === 'string' && payload.url.startsWith('http')) {
        out.push({ url: payload.url, filename: payload.filename || '' });
      }
    } catch {
      /* skip bad token */
    }
  }
  const seen = new Set();
  return out.filter((o) => !seen.has(o.url) && seen.add(o.url));
}
async function trySnapSave(url, shortcode) {
  if (shortcode) {
    const hit = snapGet(shortcode);
    if (hit) return hit;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 45000);
    const body = new URLSearchParams({ url }).toString();
    const res = await fetch('https://snapsave.app/action.php?lang=en', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'User-Agent': DESKTOP_UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'https://snapsave.app',
        Referer: 'https://snapsave.app/',
        Accept: '*/*',
      },
      body,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const decoded = decodeSnapSave(await res.text());
    if (!decoded) return null;
    const found = extractRapidMedia(decoded);
    if (!found.length) return null;
    const medias = found.map((f) => {
      const isVid = /\.mp4(\?|$)/i.test(f.url) || /\/o1\/v\/t2\//.test(f.url);
      return {
        type: isVid ? 'video' : 'image',
        quality: isVid ? 'HD · MP4' : 'Original · HD',
        ext: isVid ? 'mp4' : 'jpg',
        url: f.url,
      };
    });
    if (shortcode && medias.length) {
      snapCache.set(shortcode, { ts: Date.now(), medias });
      if (snapCache.size > 200) snapCache.delete(snapCache.keys().next().value);
    }
    return medias.length ? medias : null;
  } catch {
    return null;
  }
}

// ---------- master resolver ----------
async function handleDownload(url) {
  const shortcode = extractShortcode(url);
  const kind = detectKind(url);
  const videoExpected = kind === 'reel' || kind === 'tv' || kind === 'story';
  const bridge = fastdlBridgeUrl(url);
  const debug = { shortcode: shortcode || null, kind, oembed: 'skip', mediaImage: 'skip', scrape: 'skip', fastdl: 'skip', snapsave: 'skip' };

  // Profile link? (instagram.com/<username>) — isme koi post hi nahi hai
  if (!shortcode && kind === 'unknown' && isProfileLink(url)) {
    const uname = (url.split('?')[0].replace(/\/$/, '').split('/').filter(Boolean).pop() || 'user').replace(/[^A-Za-z0-9_.]/g, '');
    return {
      success: false, error: 'PROFILE_LINK', source: url, shortcode: null, kind: 'profile',
      engines: [], debug, fastdlUrl: bridge,
      message: `Ye @${uname} ki PROFILE ka link hai — isme download karne layak koi post nahi hai. Kisi post / reel par jao → ⋯ (3 dots) → "Copy link" karo, phir woh link yahan paste karo.`,
    };
  }

  const [oembed, scraped, fastdlMedia, mediaImage, snapMedias] = await Promise.all([
    fetchOEmbed(url).then((r) => { debug.oembed = r ? 'ok' : 'fail'; return r; }),
    resolveInstagram(url).catch(() => null).then((r) => { debug.scrape = r && r.success ? 'ok' : 'fail'; return r; }),
    tryFastDLConvert(url).then((r) => { debug.fastdl = r && r.length ? 'ok' : 'fail'; return r; }),
    resolveMediaImage(shortcode, debug),
    trySnapSave(url, shortcode).then((r) => { debug.snapsave = r && r.length ? 'ok' : 'fail'; return r; }),
  ]);

  const medias = [];
  const engines = [];
  if (oembed) engines.push('instagram-oembed');
  // SnapSave first: real MP4s (one-click) outrank everything
  if (snapMedias && snapMedias.length) {
    engines.push('snapsave');
    for (const m of snapMedias) medias.push(m);
  }
  if (scraped && scraped.success && scraped.medias && scraped.medias.length) {
    engines.push('direct');
    for (const m of scraped.medias) medias.push(m);
  }
  if (fastdlMedia && fastdlMedia.length) {
    engines.push('fastdl-api');
    fastdlMedia.forEach((u) => {
      const isVid = /\.mp4|\.mov/i.test(u);
      medias.push({ type: isVid ? 'video' : 'image', quality: isVid ? 'HD (via FastDL)' : 'Original (via FastDL)', ext: isVid ? 'mp4' : 'jpg', url: u });
    });
  }
  if (mediaImage && !medias.some((m) => m.type === 'image')) {
    engines.push('media-image');
    medias.push({
      type: 'image',
      quality: videoExpected ? 'Cover frame · HD 1080px' : 'Original · HD 1080px',
      ext: 'jpg', url: mediaImage, poster: videoExpected, direct: true,
    });
  }
  // scraped CDN images → also direct (proxy would fetch blank bytes server-side)
  for (const m of medias) {
    if (m.type === 'image' && isIGCDN(m.url)) m.direct = true;
  }
  // LAST-RESORT: oEmbed thumbnail bhi ek real downloadable image hai (640px).
  // Kuch na mile to ye hi de do — khaali "failed" se lakh guna behtar.
  if (!medias.length && oembed && oembed.thumbnail_url) {
    engines.push('oembed-thumb');
    medias.push({
      type: 'image',
      quality: videoExpected ? 'Video preview · 640px' : 'Preview · 640px',
      ext: 'jpg', url: oembed.thumbnail_url, poster: videoExpected, direct: true, preview: true,
    });
  }
  const seen = new Set();
  const final = medias.filter((m) => m.url && !seen.has(m.url) && seen.add(m.url));

  const author = (oembed && oembed.author_name) || (scraped && scraped.author) || 'instagram';
  const authorUrl = (oembed && oembed.author_url) || null;
  const caption = (scraped && scraped.caption) || (oembed && oembed.title) || '';
  const thumbnail = (oembed && oembed.thumbnail_url) || mediaImage || (scraped && scraped.thumbnail) || null;
  const hasVideo = final.some((m) => m.type === 'video');
  const onlyPreview = final.length > 0 && final.every((m) => m.preview);

  // FULL SUCCESS: we have files AND (not a video link OR got the video)
  if (final.length && (!videoExpected || hasVideo)) {
    return {
      success: true, source: url, shortcode, kind, author, authorUrl,
      caption, thumbnail, medias: final, engines, debug,
      carousel: !!(scraped && scraped.carousel),
    };
  }
  // PARTIAL: video link, only image(s) available → bridge to FastDL
  if (final.length && videoExpected && !hasVideo) {
    return {
      success: true, partial: true, source: url, shortcode, kind, author, authorUrl,
      caption, thumbnail, medias: final, engines, debug, videoExpected: true, fastdlUrl: bridge,
      message: onlyPreview
        ? 'Post mil gaya ✅ lekin HD cover block hai — 640px preview de diya hai. Poori MP4 ke liye neeche FastDL bridge use karo (link pehle se bhara + auto-search ke saath khulega).'
        : 'Cover photo mil gaya ✅ — lekin video file Instagram ne block ki hai. Poori MP4 ke liye neeche FastDL bridge use karo (link pehle se bhara khulega).',
    };
  }
  // TOTAL FAILURE (private / deleted / invalid / expired story)
  const foundPost = !!oembed;
  let message;
  if (kind === 'story') {
    message = 'Stories 24 ghante me expire ho jati hain aur Instagram unhe bots se strictly block karta hai. FastDL bridge se try karo — wahan story link directly fetch hota hai.';
  } else if (foundPost) {
    message = `Post mil gaya (@${author}) lekin saari media files Instagram ne block kar di hain. FastDL bridge se try karo — wahan captcha solve karke download milega.`;
  } else {
    message = 'Is link se media resolve nahi ho paya. Link public post / reel ka hona chahiye — private accounts support nahi hote. Ya FastDL bridge try karo.';
  }
  return {
    success: false,
    error: foundPost ? 'VIDEO_BLOCKED' : 'NOT_FOUND',
    source: url, shortcode, kind, engines, debug,
    author: (oembed && oembed.author_name) || null,
    authorUrl: (oembed && oembed.author_url) || null,
    thumbnail: (oembed && oembed.thumbnail_url) || null,
    fastdlUrl: bridge, message,
  };
}

function buildDemoResult(url) {
  const shortcode = extractShortcode(url) || 'demo';
  return {
    success: true, demo: true, source: url, shortcode,
    author: 'godxshadow.demo',
    caption: 'Demo preview — paste a real public Instagram link and GodxShadow will resolve the original media.',
    thumbnail: 'https://picsum.photos/seed/' + encodeURIComponent(shortcode) + '/640/640',
    medias: [
      { type: 'video', quality: 'HD 720p', ext: 'mp4', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { type: 'image', quality: 'Original 1080px', ext: 'jpg', url: 'https://picsum.photos/seed/' + encodeURIComponent(shortcode) + '/1080/1080' },
    ],
  };
}

// ---------- API ----------
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'godxshadow', time: Date.now() }));

async function downloadHandler(req, res) {
  const url = ((req.query.url || (req.body && req.body.url)) || '').trim();
  if (!url) return res.status(400).json({ success: false, error: 'NO_URL', message: 'URL missing hai.' });
  if (url.includes('demo') || url.includes('godxshadow')) return res.json(buildDemoResult(url));
  if (!IG_RE.test(url)) {
    return res.status(400).json({
      success: false, error: 'INVALID_URL',
      message: 'Ye valid Instagram link nahi lag raha. instagram.com ka post / reel / tv link paste karo.',
    });
  }
  try {
    const result = await handleDownload(url);
    if (!result.success) return res.status(200).json(result); // 200 taaki frontend hamesha JSON + bridge dikhaye
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'Server error: ' + e.message });
  }
}
app.get('/api/download', downloadHandler);
app.post('/api/download', downloadHandler);

// ---------- VIDEO UNLOCK ----------
// Instagram video files sirf real browser (user ka IP + login) ko deta hai.
// Isliye: fresh GraphQL data-URL template indown se lao (server-side allowed),
// user use apne browser me kholega → JSON copy → GodxShadow client-side parse.
// Template is deterministic per shortcode (verified) — hardcode it so unlock
// NEVER depends on third parties. indown refresh runs silently in background
// (their Cloudflare sometimes blocks servers) to track doc_id rotations.
const GQL_DOC_DEFAULT = '27128499623469141';
const GQL_RELAY_KEY = '__relay_internal__pv__PolarisAIGMMediaWebLabelEnabledrelayprovider';
let gqlDocId = GQL_DOC_DEFAULT;
let gqlLastRefresh = 0;
async function refreshGqlDocId() {
  if (Date.now() - gqlLastRefresh < 6 * 3600 * 1000) return;
  gqlLastRefresh = Date.now();
  try {
    const probe = 'DdnvDUNpYjA';
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(
      'https://indown.io/get-url?o=o&privateLink=' +
        encodeURIComponent('https://www.instagram.com/reel/' + probe + '/') +
        '&locale=en',
      {
        signal: ctrl.signal,
        headers: { 'User-Agent': DESKTOP_UA, Referer: 'https://indown.io/', Accept: 'application/json' },
      }
    );
    clearTimeout(t);
    const ct = res.headers.get('content-type') || '';
    if (!res.ok || !ct.includes('application/json')) return;
    const j = await res.json();
    const m = j && j.url && j.url.match(/doc_id=(\d+)/);
    if (m) gqlDocId = m[1];
  } catch {
    /* silent — hardcoded doc_id keeps working */
  }
}
function buildGqlUrl(code) {
  const vars = encodeURIComponent(JSON.stringify({ shortcode: code, [GQL_RELAY_KEY]: false }));
  return `https://www.instagram.com/graphql/query/?doc_id=${gqlDocId}&variables=${vars}`;
}
app.get('/api/unlock', async (req, res) => {
  const url = (req.query.url || '').trim();
  if (!url || !IG_RE.test(url)) {
    return res.status(400).json({ success: false, message: 'Valid Instagram post / reel link do.' });
  }
  const code = extractShortcode(url);
  if (!code) {
    return res.status(400).json({ success: false, message: 'Is link me shortcode nahi mila — post / reel / tv ka link use karo.' });
  }
  refreshGqlDocId().catch(() => {});
  res.json({ success: true, shortcode: code, gqlUrl: buildGqlUrl(code) });
});

// Proxy media: file download (attachment) + inline <video> playback (inline=1).
// Forwards Range headers so seeking works; passes through 206 + content-range.
app.get('/api/proxy', async (req, res) => {
  const url = (req.query.url || '').trim();
  const filename = (req.query.filename || 'godxshadow-media').replace(/[^a-zA-Z0-9._-]/g, '_');
  const inline = req.query.inline === '1';
  if (!url || !/^https?:\/\//i.test(url)) return res.status(400).send('Bad url');
  try {
    const fwdHeaders = { 'User-Agent': DESKTOP_UA, Referer: 'https://www.instagram.com/' };
    if (req.headers.range) fwdHeaders.Range = req.headers.range;
    const upstream = await fetch(url, { headers: fwdHeaders });
    if (upstream.status !== 200 && upstream.status !== 206) {
      return res.status(502).send('Upstream fetch failed: ' + upstream.status);
    }
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${filename}"`);
    for (const h of ['content-length', 'content-range', 'etag', 'last-modified']) {
      const v = upstream.headers.get(h);
      if (v) res.setHeader(h, v);
    }
    res.setHeader('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.write(Buffer.from(value))) {
        await new Promise((r) => res.once('drain', r));
      }
    }
    res.end();
  } catch (e) {
    try { res.status(500).send('Proxy error: ' + e.message); } catch { /* closed */ }
  }
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'API endpoint nahi mila: ' + req.path });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ GODxSHADOW running on http://0.0.0.0:${PORT}`);
});
