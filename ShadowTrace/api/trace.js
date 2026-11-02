/**
 * ShadowTrace — Deep URL Redirect Tracer Engine (Vercel Serverless + Node.js)
 * Zero external dependencies. Follows HTTP 3xx, HTML Meta-Refresh, and JS redirects
 * hop-by-hop while capturing socket timings, TLS certificates, cookies, headers,
 * security posture, and affiliate/tracking parameters.
 */

const http = require('http');
const https = require('https');
const dns = require('dns').promises;
const net = require('net');
const { performance } = require('perf_hooks');
const zlib = require('zlib');

const MAX_HOPS_LIMIT = 20;
const HOP_TIMEOUT_MS = 10000;
const MAX_BODY_PREVIEW_BYTES = 24576; // 24 KB max read for HTML title/meta/JS detection

const USER_AGENT_PRESETS = {
  shadowtrace: 'ShadowTrace/1.0 (+https://github.com/shadowtrace; Redirect Checker)',
  chrome_desktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  iphone_safari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  googlebot:
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  twitterbot: 'Twitterbot/1.0',
  curl: 'curl/8.7.1'
};

const TRACKING_PARAM_NAMES = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'twclid', 'li_fat_id',
  'aff', 'aff_id', 'affid', 'affiliate', 'affiliate_id', 'clickid', 'click_id',
  'subid', 'sub_id', 'sub1', 'sub2', 'ref', 'ref_id', 'tag', 'ascsubtag',
  'ranmid', 'raneaid', 'ransiteid', 'irclickid', 'irgwc', 'awc', 'sscid', 'cjevent'
]);

const KNOWN_AFFILIATE_DOMAINS = [
  { pattern: /(?:^|\.)amzn\.to$|amazon\.[a-z.]+/i, label: 'Amazon Associates' },
  { pattern: /(?:^|\.)hop\.clickbank\.net$/i, label: 'ClickBank Affiliate' },
  { pattern: /(?:^|\.)shareasale\.com$|shrsl\.com$/i, label: 'ShareASale' },
  { pattern: /(?:^|\.)anrdoezrs\.net$|dpbolvw\.net$|tkqlhce\.com$|jdoqocy\.com$|kqzyfj\.com$/i, label: 'CJ Affiliate' },
  { pattern: /(?:^|\.)ojrq\.net$|evyy\.net$|pxf\.io$|sjv\.io$|7eer\.net$/i, label: 'Impact Radius' },
  { pattern: /(?:^|\.)awin1\.com$/i, label: 'Awin Affiliate' },
  { pattern: /(?:^|\.)rakuten\.com$|linksynergy\.com$/i, label: 'Rakuten Advertising' },
  { pattern: /(?:^|\.)partnerize\.com$|prf\.hn$/i, label: 'Partnerize' },
  { pattern: /(?:^|\.)bit\.ly$|bitly\.com$|j\.mp$/i, label: 'Bitly Shortener' },
  { pattern: /(?:^|\.)tinyurl\.com$/i, label: 'TinyURL Shortener' },
  { pattern: /(?:^|\.)t\.co$/i, label: 'X / Twitter Shortener' },
  { pattern: /(?:^|\.)is\.gd$|v\.gd$/i, label: 'is.gd / v.gd Shortener' },
  { pattern: /(?:^|\.)cutt\.ly$|rebrand\.ly$|ow\.ly$|buff\.ly$|spoo\.me$/i, label: 'URL Shortener' }
];

/**
 * SSRF Protection: Reject private, loopback, link-local, multicast, or cloud metadata IPs
 */
function isSafePublicIP(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const clean = ip.trim().toLowerCase();

  if (clean === 'localhost') return false;

  // Handle IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
  if (clean.startsWith('::ffff:')) {
    const mappedV4 = clean.slice(7);
    if (net.isIPv4(mappedV4)) return isSafePublicIP(mappedV4);
  }

  if (net.isIPv4(clean)) {
    const parts = clean.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0) return false; // 0.0.0.0/8
    if (a === 10) return false; // 10.0.0.0/8
    if (a === 100 && b >= 64 && b <= 127) return false; // 100.64.0.0/10 CGNAT
    if (a === 127) return false; // 127.0.0.0/8 Loopback
    if (a === 169 && b === 254) return false; // 169.254.0.0/16 Link-local / Cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return false; // 172.16.0.0/12 Private
    if (a === 192 && b === 168) return false; // 192.168.0.0/16 Private
    if (a === 192 && b === 0 && (parts[2] === 0 || parts[2] === 2)) return false;
    if (a === 198 && (b === 18 || b === 19)) return false; // Benchmarking
    if (a >= 224) return false; // Multicast & Reserved
    return true;
  }

  if (net.isIPv6(clean)) {
    if (clean === '::' || clean === '::1') return false;
    if (clean.startsWith('fc') || clean.startsWith('fd')) return false; // Unique local fc00::/7
    if (
      clean.startsWith('fe8') ||
      clean.startsWith('fe9') ||
      clean.startsWith('fea') ||
      clean.startsWith('feb')
    ) {
      return false; // Link-local fe80::/10
    }
    if (clean.startsWith('ff')) return false; // Multicast
    return true;
  }

  return false;
}

async function resolveAndValidateHost(hostname) {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal')
  ) {
    throw new Error(`Blocked internal hostname: ${hostname}`);
  }

  if (net.isIP(hostname)) {
    if (!isSafePublicIP(hostname)) {
      throw new Error(`Blocked private or reserved IP address: ${hostname}`);
    }
    return { ip: hostname, family: net.isIP(hostname), dnsMs: 0 };
  }

  const start = performance.now();
  const records = await dns.lookup(hostname, { all: true });
  const dnsMs = Number((performance.now() - start).toFixed(2));

  if (!records || records.length === 0) {
    throw new Error(`DNS resolution failed for ${hostname}`);
  }

  for (const rec of records) {
    if (!isSafePublicIP(rec.address)) {
      throw new Error(`Blocked target resolving to non-public IP (${rec.address})`);
    }
  }

  return {
    ip: records[0].address,
    family: records[0].family,
    allIps: records.map((r) => r.address),
    dnsMs
  };
}

function parseSetCookies(rawCookies = []) {
  const list = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
  return list.filter(Boolean).map((raw) => {
    const segments = String(raw).split(';').map((s) => s.trim());
    const first = segments[0] || '';
    const eqIdx = first.indexOf('=');
    const name = eqIdx > -1 ? first.slice(0, eqIdx) : first;
    const attrs = {
      name,
      domain: null,
      path: null,
      expires: null,
      httpOnly: false,
      secure: false,
      sameSite: null,
      raw: String(raw)
    };
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      const lower = seg.toLowerCase();
      if (lower === 'httponly') attrs.httpOnly = true;
      else if (lower === 'secure') attrs.secure = true;
      else if (lower.startsWith('domain=')) attrs.domain = seg.slice(7);
      else if (lower.startsWith('path=')) attrs.path = seg.slice(5);
      else if (lower.startsWith('expires=')) attrs.expires = seg.slice(8);
      else if (lower.startsWith('samesite=')) attrs.sameSite = seg.slice(9);
    }
    return attrs;
  });
}

function analyzeTracking(urlStr) {
  try {
    const u = new URL(urlStr);
    const detectedParams = [];
    for (const [key, value] of u.searchParams.entries()) {
      const k = key.toLowerCase();
      if (
        TRACKING_PARAM_NAMES.has(k) ||
        k.startsWith('utm_') ||
        k.startsWith('aff_') ||
        k.startsWith('sub_')
      ) {
        detectedParams.push({ key, value: value.slice(0, 80) });
      }
    }

    let network = null;
    for (const item of KNOWN_AFFILIATE_DOMAINS) {
      if (item.pattern.test(u.hostname)) {
        network = item.label;
        break;
      }
    }
    if (!network && u.searchParams.has('tag') && /amazon\./i.test(u.hostname)) {
      network = 'Amazon Associates';
    }

    // Build cleaned URL with tracking params stripped
    const cleaned = new URL(urlStr);
    for (const p of detectedParams) {
      cleaned.searchParams.delete(p.key);
    }

    return {
      isAffiliateOrTracker: Boolean(network || detectedParams.length > 0),
      network,
      params: detectedParams,
      cleanUrl: cleaned.toString()
    };
  } catch {
    return { isAffiliateOrTracker: false, network: null, params: [], cleanUrl: urlStr };
  }
}

function detectClientSideRedirect(html, baseUrl) {
  if (!html || typeof html !== 'string') return null;

  // 1. HTML <meta http-equiv="refresh" content="0; url=...">
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metaTags) {
    if (/http-equiv\s*=\s*["']?refresh["']?/i.test(tag)) {
      const contentMatch = tag.match(/content\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const contentVal = contentMatch ? (contentMatch[1] || contentMatch[2] || contentMatch[3] || '') : '';
      const refreshMatch = contentVal.match(/^\s*(\d+)\s*;\s*url\s*=\s*['"]?([^'"]+?)['"]?\s*$/i);
      if (refreshMatch) {
        const delaySec = parseInt(refreshMatch[1], 10);
        const rawTarget = refreshMatch[2].trim();
        if (rawTarget && delaySec <= 15) {
          try {
            return {
              type: 'Meta Refresh',
              delaySec,
              nextUrl: new URL(rawTarget, baseUrl).toString()
            };
          } catch {
            // ignore malformed URL
          }
        }
      }
    }
  }

  // 2. Lightweight JavaScript redirect stubs (only on compact redirect pages < 14KB)
  if (html.length < 14000) {
    const scripts = [];
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = scriptRegex.exec(html)) !== null) {
      if (m[1]) scripts.push(m[1]);
    }
    const combinedScript = scripts.join('\n');
    const jsPatterns = [
      /(?:window\.|document\.|self\.|top\.)?location\.(?:replace|assign)\s*\(\s*(['"])(https?:\/\/[^'"]+|\/[^'"]*)\1\s*\)/i,
      /(?:window\.|document\.|self\.|top\.)?location(?:\.href)?\s*=\s*(['"])(https?:\/\/[^'"]+|\/[^'"]+)\1/i
    ];
    for (const pat of jsPatterns) {
      const hit = combinedScript.match(pat);
      if (hit && hit[2]) {
        try {
          const resolved = new URL(hit[2].trim(), baseUrl).toString();
          if (resolved !== baseUrl) {
            return {
              type: 'JavaScript Redirect',
              delaySec: 0,
              nextUrl: resolved
            };
          }
        } catch {
          // ignore
        }
      }
    }
  }

  return null;
}

function extractPageTitle(html) {
  if (!html) return null;
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return m[1].replace(/\s+/g, ' ').trim().slice(0, 180) || null;
}

function formatRawHeaders(statusLine, rawHeadersArray) {
  const lines = [statusLine];
  if (Array.isArray(rawHeadersArray)) {
    for (let i = 0; i < rawHeadersArray.length; i += 2) {
      lines.push(`${rawHeadersArray[i]}: ${rawHeadersArray[i + 1]}`);
    }
  }
  return lines.join('\r\n');
}

function decompressBuffer(buf, encoding) {
  try {
    const enc = (encoding || '').toLowerCase().trim();
    if (enc === 'gzip' || enc === 'x-gzip') return zlib.gunzipSync(buf);
    if (enc === 'deflate') return zlib.inflateSync(buf);
    if (enc === 'br' && typeof zlib.brotliDecompressSync === 'function') {
      return zlib.brotliDecompressSync(buf);
    }
  } catch {
    // partial buffer decompression fallback: try partial gunzip/brotli with finishFlush
    try {
      const enc = (encoding || '').toLowerCase().trim();
      if (enc === 'gzip' || enc === 'x-gzip') {
        return zlib.gunzipSync(buf, { finishFlush: zlib.constants.Z_SYNC_FLUSH });
      }
    } catch {
      return buf;
    }
  }
  return buf;
}

async function fetchSingleHop(urlStr, options) {
  const parsed = new URL(urlStr);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol "${parsed.protocol}" — only HTTP and HTTPS are allowed.`);
  }

  const isHttps = parsed.protocol === 'https:';
  const dnsInfo = await resolveAndValidateHost(parsed.hostname);
  const client = isHttps ? https : http;
  const port = parsed.port ? Number(parsed.port) : isHttps ? 443 : 80;

  return new Promise((resolve) => {
    const tStart = performance.now();
    let tConnect = null;
    let tTls = null;
    let tFirstByte = null;

    const requestHeaders = {
      Host: parsed.host,
      'User-Agent': options.userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'close'
    };

    const reqOpts = {
      protocol: parsed.protocol,
      hostname: dnsInfo.ip, // Connect directly to validated IP to prevent DNS rebinding!
      port,
      family: dnsInfo.family,
      path: (parsed.pathname || '/') + (parsed.search || ''),
      method: options.method || 'GET',
      headers: requestHeaders,
      servername: net.isIP(parsed.hostname) ? undefined : parsed.hostname,
      rejectUnauthorized: false, // Allow inspecting expired/self-signed certs while reporting authorized=false!
      timeout: HOP_TIMEOUT_MS
    };

    const rawRequestBlock = [
      `${reqOpts.method} ${reqOpts.path} HTTP/1.1`,
      ...Object.entries(requestHeaders).map(([k, v]) => `${k}: ${v}`)
    ].join('\r\n');

    let settled = false;
    const finish = (result) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    const req = client.request(reqOpts, (res) => {
      tFirstByte = performance.now();

      let tlsDetails = null;
      if (isHttps && res.socket && typeof res.socket.getPeerCertificate === 'function') {
        try {
          const cert = res.socket.getPeerCertificate();
          tlsDetails = {
            protocol: res.socket.getProtocol ? res.socket.getProtocol() : null,
            authorized: Boolean(res.socket.authorized),
            authorizationError: res.socket.authorizationError || null,
            issuer: cert && cert.issuer ? cert.issuer.O || cert.issuer.CN || null : null,
            subject: cert && cert.subject ? cert.subject.CN || null : null,
            validFrom: cert ? cert.valid_from || null : null,
            validTo: cert ? cert.valid_to || null : null
          };
        } catch {
          tlsDetails = null;
        }
      }

      const chunks = [];
      let bytesRead = 0;

      res.on('data', (chunk) => {
        if (bytesRead < MAX_BODY_PREVIEW_BYTES) {
          const slice = chunk.slice(0, MAX_BODY_PREVIEW_BYTES - bytesRead);
          chunks.push(slice);
          bytesRead += slice.length;
        } else {
          res.destroy();
        }
      });

      const finalizeResponse = () => {
        const tEnd = performance.now();
        const rawBuf = Buffer.concat(chunks);
        const decodedBuf = decompressBuffer(rawBuf, res.headers['content-encoding']);
        const contentType = res.headers['content-type'] || '';
        const isTextLike =
          /text\/|json|xml|javascript|html/i.test(contentType) || contentType === '';
        const bodyText = isTextLike ? decodedBuf.toString('utf-8').slice(0, 16000) : '';

        const statusLine = `HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage || ''}`.trim();
        const rawResponseHeaders = formatRawHeaders(statusLine, res.rawHeaders);

        const connectMs = tConnect ? Number((tConnect - tStart).toFixed(2)) : 0;
        const tlsMs = isHttps && tTls && tConnect ? Number((tTls - tConnect).toFixed(2)) : 0;
        const ttfbMs = tFirstByte ? Number((tFirstByte - tStart).toFixed(2)) : 0;
        const totalMs = Number((tEnd - tStart + dnsInfo.dnsMs).toFixed(2));

        const cookies = parseSetCookies(res.headers['set-cookie'] || []);
        const headersObj = {};
        for (const [k, v] of Object.entries(res.headers)) {
          headersObj[k] = Array.isArray(v) ? v.join('; ') : v;
        }

        const statusCode = res.statusCode || 0;
        let redirectType = null;
        let nextUrl = null;

        if ([301, 302, 303, 307, 308].includes(statusCode) && res.headers.location) {
          const loc = Array.isArray(res.headers.location)
            ? res.headers.location[0]
            : res.headers.location;
          try {
            nextUrl = new URL(loc, urlStr).toString();
            redirectType = `HTTP ${statusCode}`;
          } catch {
            nextUrl = loc;
            redirectType = `HTTP ${statusCode}`;
          }
        } else if (
          options.followClientRedirects !== false &&
          statusCode >= 200 &&
          statusCode < 300 &&
          /text\/html/i.test(contentType)
        ) {
          const clientRedir = detectClientSideRedirect(bodyText, urlStr);
          if (clientRedir) {
            redirectType = clientRedir.type;
            nextUrl = clientRedir.nextUrl;
          }
        }

        finish({
          url: urlStr,
          statusCode,
          statusText: res.statusMessage || '',
          httpVersion: res.httpVersion || '1.1',
          scheme: isHttps ? 'HTTPS' : 'HTTP',
          ip: dnsInfo.ip,
          port,
          redirectType,
          nextUrl,
          pageTitle: extractPageTitle(bodyText),
          timings: {
            dnsMs: dnsInfo.dnsMs,
            connectMs,
            tlsMs,
            ttfbMs,
            totalMs
          },
          tls: tlsDetails,
          cookies,
          securityHeaders: {
            server: headersObj['server'] || null,
            hsts: headersObj['strict-transport-security'] || null,
            csp: headersObj['content-security-policy'] ? 'Present' : null,
            xFrameOptions: headersObj['x-frame-options'] || null,
            xContentTypeOptions: headersObj['x-content-type-options'] || null,
            referrerPolicy: headersObj['referrer-policy'] || null,
            cfRay: headersObj['cf-ray'] || null,
            cacheControl: headersObj['cache-control'] || null
          },
          tracking: analyzeTracking(urlStr),
          headers: headersObj,
          rawRequestHeaders: rawRequestBlock,
          rawResponseHeaders,
          bodyPreview: bodyText.slice(0, 2000)
        });
      };

      res.on('end', finalizeResponse);
      res.on('close', finalizeResponse);
      res.on('error', finalizeResponse);
    });

    req.on('socket', (socket) => {
      socket.on('connect', () => {
        tConnect = performance.now();
      });
      socket.on('secureConnect', () => {
        tTls = performance.now();
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error(`Connection timed out after ${HOP_TIMEOUT_MS}ms`));
    });

    req.on('error', (err) => {
      const tEnd = performance.now();
      finish({
        url: urlStr,
        statusCode: 0,
        statusText: 'Connection Error',
        error: err.message || 'Request failed',
        scheme: isHttps ? 'HTTPS' : 'HTTP',
        ip: dnsInfo.ip,
        port,
        redirectType: null,
        nextUrl: null,
        timings: {
          dnsMs: dnsInfo.dnsMs,
          connectMs: 0,
          tlsMs: 0,
          ttfbMs: 0,
          totalMs: Number((tEnd - tStart + dnsInfo.dnsMs).toFixed(2))
        },
        tls: null,
        cookies: [],
        securityHeaders: {},
        tracking: analyzeTracking(urlStr),
        headers: {},
        rawRequestHeaders: rawRequestBlock,
        rawResponseHeaders: `Error: ${err.message}`,
        bodyPreview: ''
      });
    });

    req.end();
  });
}

async function traceUrlChain(rawInputUrl, opts = {}) {
  let currentUrl = String(rawInputUrl || '').trim();
  if (!currentUrl) {
    throw new Error('Please provide a URL to trace.');
  }
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(currentUrl)) {
    currentUrl = 'http://' + currentUrl;
  }

  let parsedInitial;
  try {
    parsedInitial = new URL(currentUrl);
  } catch {
    throw new Error(`Invalid URL format: "${rawInputUrl}"`);
  }
  if (parsedInitial.protocol !== 'http:' && parsedInitial.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs are supported.');
  }

  const uaKey = opts.uaPreset || 'shadowtrace';
  const userAgent =
    opts.customUserAgent && String(opts.customUserAgent).trim()
      ? String(opts.customUserAgent).trim().slice(0, 300)
      : USER_AGENT_PRESETS[uaKey] || USER_AGENT_PRESETS.shadowtrace;

  const maxHops = Math.min(Math.max(Number(opts.maxHops) || 15, 1), MAX_HOPS_LIMIT);
  const followClientRedirects = opts.followClientRedirects !== false;

  const hops = [];
  const visited = new Set();
  let loopDetected = false;
  let maxHopsReached = false;
  const overallStart = performance.now();

  for (let step = 1; step <= maxHops; step++) {
    visited.add(currentUrl);
    let hopResult;
    try {
      hopResult = await fetchSingleHop(currentUrl, {
        userAgent,
        followClientRedirects,
        method: opts.method === 'HEAD' ? 'HEAD' : 'GET'
      });
    } catch (err) {
      hopResult = {
        url: currentUrl,
        statusCode: 0,
        statusText: 'Blocked / Failed',
        error: err.message,
        scheme: currentUrl.startsWith('https:') ? 'HTTPS' : 'HTTP',
        ip: null,
        port: null,
        redirectType: null,
        nextUrl: null,
        timings: { dnsMs: 0, connectMs: 0, tlsMs: 0, ttfbMs: 0, totalMs: 0 },
        tls: null,
        cookies: [],
        securityHeaders: {},
        tracking: analyzeTracking(currentUrl),
        headers: {},
        rawRequestHeaders: '',
        rawResponseHeaders: `Error: ${err.message}`,
        bodyPreview: ''
      };
    }

    hopResult.hop = step;
    hops.push(hopResult);

    if (!hopResult.nextUrl) {
      break;
    }

    if (visited.has(hopResult.nextUrl)) {
      loopDetected = true;
      break;
    }

    if (step === maxHops) {
      maxHopsReached = true;
      break;
    }

    currentUrl = hopResult.nextUrl;
  }

  const totalDurationMs = Number((performance.now() - overallStart).toFixed(2));
  const finalHop = hops[hops.length - 1] || null;
  const redirectCount = hops.filter((h) => Boolean(h.nextUrl)).length;

  return {
    ok: true,
    engine: 'ShadowTrace Deep Node Engine',
    engineMode: 'server',
    tracedAt: new Date().toISOString(),
    requestedUrl: parsedInitial.toString(),
    finalUrl: finalHop ? finalHop.url : parsedInitial.toString(),
    finalStatus: finalHop ? finalHop.statusCode : 0,
    redirectCount,
    totalHops: hops.length,
    totalDurationMs,
    userAgent,
    loopDetected,
    maxHopsReached,
    upgradedToHttps:
      parsedInitial.protocol === 'http:' &&
      Boolean(finalHop && finalHop.url && finalHop.url.startsWith('https:')),
    affiliateHopsCount: hops.filter((h) => h.tracking && h.tracking.isAffiliateOrTracker).length,
    cookiesTotal: hops.reduce((acc, h) => acc + (h.cookies ? h.cookies.length : 0), 0),
    hops
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        return resolve(JSON.parse(req.body));
      } catch (e) {
        return reject(new Error('Invalid JSON payload'));
      }
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 32768) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    let params = {};
    if (req.method === 'GET') {
      const u = new URL(req.url, 'http://localhost');
      params = {
        url: u.searchParams.get('url'),
        uaPreset: u.searchParams.get('uaPreset'),
        customUserAgent: u.searchParams.get('customUserAgent'),
        maxHops: u.searchParams.get('maxHops'),
        followClientRedirects: u.searchParams.get('followClientRedirects') !== 'false',
        method: u.searchParams.get('method') || 'GET'
      };
    } else if (req.method === 'POST') {
      params = await readJsonBody(req);
    } else {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    }

    const result = await traceUrlChain(params.url, params);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        ok: false,
        error: err.message || 'Unable to trace URL'
      })
    );
  }
};

module.exports.traceUrlChain = traceUrlChain;
