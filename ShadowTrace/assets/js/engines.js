/**
 * ShadowTrace — Hybrid Execution Engine
 * Works BOTH:
 *   1) 100% Statically on GitHub Pages (Zero Backend — pure CORS Browser Engine)
 *   2) Full Deep Server Mode on Vercel / Node.js / Cloudflare Workers
 */

const DNS_TYPE_MAP = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  13: 'HINFO',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  35: 'NAPTR',
  257: 'CAA'
};

const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'twclid', 'li_fat_id',
  'aff', 'aff_id', 'affid', 'affiliate', 'affiliate_id', 'clickid', 'click_id',
  'subid', 'sub_id', 'sub1', 'sub2', 'ref', 'ref_id', 'tag', 'ascsubtag',
  'ranmid', 'raneaid', 'ransiteid', 'irclickid', 'irgwc', 'awc', 'sscid', 'cjevent'
]);

const AFFILIATE_PATTERNS = [
  { pattern: /(?:^|\.)amzn\.to$|amazon\.[a-z.]+/i, label: 'Amazon Associates' },
  { pattern: /(?:^|\.)hop\.clickbank\.net$/i, label: 'ClickBank Affiliate' },
  { pattern: /(?:^|\.)shareasale\.com$|shrsl\.com$/i, label: 'ShareASale' },
  { pattern: /(?:^|\.)anrdoezrs\.net$|dpbolvw\.net$|tkqlhce\.com$|jdoqocy\.com$|kqzyfj\.com$/i, label: 'CJ Affiliate' },
  { pattern: /(?:^|\.)ojrq\.net$|evyy\.net$|pxf\.io$|sjv\.io$|7eer\.net$/i, label: 'Impact Radius' },
  { pattern: /(?:^|\.)awin1\.com$/i, label: 'Awin Affiliate' },
  { pattern: /(?:^|\.)bit\.ly$|bitly\.com$|j\.mp$/i, label: 'Bitly Shortener' },
  { pattern: /(?:^|\.)tinyurl\.com$/i, label: 'TinyURL Shortener' },
  { pattern: /(?:^|\.)t\.co$/i, label: 'X / Twitter Shortener' },
  { pattern: /(?:^|\.)is\.gd$|v\.gd$/i, label: 'is.gd / v.gd Shortener' },
  { pattern: /(?:^|\.)cutt\.ly$|rebrand\.ly$|ow\.ly$|buff\.ly$|spoo\.me$/i, label: 'URL Shortener' }
];

let cachedServerStatus = null;

export async function detectServerEngine() {
  if (cachedServerStatus !== null) return cachedServerStatus;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2200);
    const resp = await fetch('./api/health', { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (resp.ok) {
      const data = await resp.json();
      cachedServerStatus = Boolean(data && data.ok);
      return cachedServerStatus;
    }
  } catch {
    // Running statically (e.g. GitHub Pages)
  }
  cachedServerStatus = false;
  return false;
}

export function normalizeInputUrl(raw) {
  let u = String(raw || '').trim();
  if (!u) throw new Error('Please enter a URL to trace.');
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(u)) {
    u = 'http://' + u;
  }
  const parsed = new URL(u);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs are supported.');
  }
  return parsed.toString();
}

export function analyzeUrlTracking(urlStr) {
  try {
    const u = new URL(urlStr);
    const params = [];
    for (const [key, value] of u.searchParams.entries()) {
      const k = key.toLowerCase();
      if (TRACKING_PARAMS.has(k) || k.startsWith('utm_') || k.startsWith('aff_') || k.startsWith('sub_')) {
        params.push({ key, value: value.slice(0, 80) });
      }
    }
    let network = null;
    for (const item of AFFILIATE_PATTERNS) {
      if (item.pattern.test(u.hostname)) {
        network = item.label;
        break;
      }
    }
    if (!network && u.searchParams.has('tag') && /amazon\./i.test(u.hostname)) {
      network = 'Amazon Associates';
    }
    const cleaned = new URL(urlStr);
    for (const p of params) cleaned.searchParams.delete(p.key);
    return {
      isAffiliateOrTracker: Boolean(network || params.length > 0),
      network,
      params,
      cleanUrl: cleaned.toString()
    };
  } catch {
    return { isAffiliateOrTracker: false, network: null, params: [], cleanUrl: urlStr };
  }
}

async function resolveHostIpViaDoH(hostname) {
  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (Array.isArray(data.Answer)) {
      const aRec = data.Answer.find((r) => r.type === 1);
      if (aRec) return aRec.data;
    }
  } catch {
    // ignore
  }
  return null;
}

function parseCookieHeaderLine(raw) {
  const parts = String(raw).split(';').map((s) => s.trim());
  const first = parts[0] || '';
  const eq = first.indexOf('=');
  const name = eq > -1 ? first.slice(0, eq) : first;
  return {
    name,
    httpOnly: /;\s*httponly/i.test(raw),
    secure: /;\s*secure/i.test(raw),
    raw
  };
}

/**
 * Parse multi-hop raw HTTP header dump from HackerTarget into structured ShadowTrace hops
 */
function parseRawHttpChainBlocks(rawDump, initialUrl) {
  const lines = rawDump.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let current = null;

  for (const line of lines) {
    const statusMatch = line.match(/^HTTP\/([\d.]+)\s+(\d{3})(?:\s+(.*))?$/i);
    if (statusMatch) {
      if (current) blocks.push(current);
      current = {
        httpVersion: statusMatch[1],
        statusCode: Number(statusMatch[2]),
        statusText: (statusMatch[3] || '').trim(),
        rawLines: [line],
        headers: {},
        cookies: []
      };
    } else if (current && line.trim()) {
      current.rawLines.push(line);
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const k = line.slice(0, colonIdx).trim().toLowerCase();
        const v = line.slice(colonIdx + 1).trim();
        if (k === 'set-cookie') {
          current.cookies.push(parseCookieHeaderLine(v));
        }
        current.headers[k] = current.headers[k] ? `${current.headers[k]}; ${v}` : v;
      }
    }
  }
  if (current) blocks.push(current);

  const hops = [];
  let currentUrl = initialUrl;

  blocks.forEach((blk, idx) => {
    let nextUrl = null;
    let redirectType = null;
    if ([301, 302, 303, 307, 308].includes(blk.statusCode) && blk.headers['location']) {
      try {
        nextUrl = new URL(blk.headers['location'], currentUrl).toString();
      } catch {
        nextUrl = blk.headers['location'];
      }
      redirectType = `HTTP ${blk.statusCode}`;
    }

    const parsed = (() => {
      try {
        return new URL(currentUrl);
      } catch {
        return null;
      }
    })();

    hops.push({
      hop: idx + 1,
      url: currentUrl,
      statusCode: blk.statusCode,
      statusText: blk.statusText,
      httpVersion: blk.httpVersion,
      scheme: currentUrl.startsWith('https:') ? 'HTTPS' : 'HTTP',
      hostname: parsed ? parsed.hostname : null,
      ip: null,
      port: parsed ? (parsed.port ? Number(parsed.port) : currentUrl.startsWith('https:') ? 443 : 80) : null,
      redirectType,
      nextUrl,
      pageTitle: null,
      timings: { dnsMs: 0, connectMs: 0, tlsMs: 0, ttfbMs: 0, totalMs: 0 },
      tls: currentUrl.startsWith('https:') ? { protocol: 'HTTPS (TLS)', authorized: true } : null,
      cookies: blk.cookies,
      securityHeaders: {
        server: blk.headers['server'] || null,
        hsts: blk.headers['strict-transport-security'] || null,
        csp: blk.headers['content-security-policy'] ? 'Present' : null,
        xFrameOptions: blk.headers['x-frame-options'] || null,
        xContentTypeOptions: blk.headers['x-content-type-options'] || null,
        referrerPolicy: blk.headers['referrer-policy'] || null,
        cfRay: blk.headers['cf-ray'] || null,
        cacheControl: blk.headers['cache-control'] || null
      },
      tracking: analyzeUrlTracking(currentUrl),
      headers: blk.headers,
      rawRequestHeaders: parsed
        ? `GET ${parsed.pathname || '/'}${parsed.search || ''} HTTP/1.1\r\nHost: ${parsed.host}`
        : '',
      rawResponseHeaders: blk.rawLines.join('\r\n'),
      bodyPreview: ''
    });

    if (nextUrl) {
      currentUrl = nextUrl;
    }
  });

  return hops;
}

/**
 * Pure Browser Static Redirect Tracer (Works 100% on GitHub Pages without any backend!)
 */
export async function traceViaBrowserStaticEngine(rawUrl) {
  const initialUrl = normalizeInputUrl(rawUrl);
  const tStart = performance.now();

  let hops = [];
  let providerLabel = 'GitHub Pages Browser Engine (HTTP Header Chain + DoH)';

  // Primary CORS Engine: HackerTarget HTTP Headers Chain Inspector (Access-Control-Allow-Origin: *)
  try {
    const htResp = await fetch(
      `https://api.hackertarget.com/httpheaders/?q=${encodeURIComponent(initialUrl)}`
    );
    if (htResp.ok) {
      const text = await htResp.text();
      if (text && /^HTTP\//im.test(text) && !/API count exceeded|error check/i.test(text)) {
        hops = parseRawHttpChainBlocks(text, initialUrl);
      }
    }
  } catch {
    // Fallback below
  }

  // Fallback CORS Engine: Microlink URL Expander + Metadata Inspector (Access-Control-Allow-Origin: *)
  if (hops.length === 0) {
    providerLabel = 'GitHub Pages Browser Engine (Microlink Resolver + DoH)';
    const mlResp = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(initialUrl)}`
    );
    const mlJson = await mlResp.json();
    if (!mlResp.ok || !mlJson || !mlJson.data) {
      throw new Error(
        (mlJson && mlJson.message) ||
          'Static browser trace rate-limited or blocked. Deploy to Vercel or add a free Cloudflare Worker URL in Advanced Options for unlimited tracing.'
      );
    }

    const resolvedUrl = mlJson.data.url || initialUrl;
    const statusCode = mlJson.statusCode || 200;

    if (resolvedUrl !== initialUrl) {
      hops.push({
        hop: 1,
        url: initialUrl,
        statusCode: 301,
        statusText: 'Redirected (Resolved via Browser Engine)',
        httpVersion: '1.1',
        scheme: initialUrl.startsWith('https:') ? 'HTTPS' : 'HTTP',
        hostname: new URL(initialUrl).hostname,
        ip: null,
        port: initialUrl.startsWith('https:') ? 443 : 80,
        redirectType: 'HTTP Redirect',
        nextUrl: resolvedUrl,
        pageTitle: null,
        timings: { totalMs: 0 },
        tls: initialUrl.startsWith('https:') ? { protocol: 'HTTPS', authorized: true } : null,
        cookies: [],
        securityHeaders: {},
        tracking: analyzeUrlTracking(initialUrl),
        headers: { location: resolvedUrl },
        rawRequestHeaders: `GET ${new URL(initialUrl).pathname} HTTP/1.1\r\nHost: ${new URL(initialUrl).host}`,
        rawResponseHeaders: `HTTP/1.1 301 Redirect\r\nLocation: ${resolvedUrl}`,
        bodyPreview: ''
      });
    }

    hops.push({
      hop: hops.length + 1,
      url: resolvedUrl,
      statusCode,
      statusText: statusCode === 200 ? 'OK' : `HTTP ${statusCode}`,
      httpVersion: '2',
      scheme: resolvedUrl.startsWith('https:') ? 'HTTPS' : 'HTTP',
      hostname: new URL(resolvedUrl).hostname,
      ip: null,
      port: resolvedUrl.startsWith('https:') ? 443 : 80,
      redirectType: null,
      nextUrl: null,
      pageTitle: mlJson.data.title || null,
      timings: { totalMs: 0 },
      tls: resolvedUrl.startsWith('https:') ? { protocol: 'HTTPS', authorized: true } : null,
      cookies: [],
      securityHeaders: {
        server: (mlJson.headers && mlJson.headers.server) || null
      },
      tracking: analyzeUrlTracking(resolvedUrl),
      headers: mlJson.headers || {},
      rawRequestHeaders: `GET ${new URL(resolvedUrl).pathname} HTTP/1.1\r\nHost: ${new URL(resolvedUrl).host}`,
      rawResponseHeaders: `HTTP/2 ${statusCode} OK\r\nContent-Type: text/html`,
      bodyPreview: mlJson.data.description || ''
    });
  }

  // Enrich unique hostnames with Primary IP via Google DNS-over-HTTPS in parallel!
  const uniqueHosts = [...new Set(hops.map((h) => h.hostname).filter(Boolean))];
  const ipMap = {};
  await Promise.all(
    uniqueHosts.map(async (host) => {
      ipMap[host] = await resolveHostIpViaDoH(host);
    })
  );

  const totalDurationMs = Number((performance.now() - tStart).toFixed(1));
  const perHopEst = Number((totalDurationMs / Math.max(hops.length, 1)).toFixed(1));

  hops.forEach((h) => {
    h.ip = ipMap[h.hostname] || null;
    if (!h.timings || !h.timings.totalMs) {
      h.timings = { dnsMs: 0, connectMs: 0, tlsMs: 0, ttfbMs: perHopEst, totalMs: perHopEst };
    }
  });

  const finalHop = hops[hops.length - 1] || null;
  return {
    ok: true,
    engine: providerLabel,
    engineMode: 'browser-static',
    tracedAt: new Date().toISOString(),
    requestedUrl: initialUrl,
    finalUrl: finalHop ? finalHop.url : initialUrl,
    finalStatus: finalHop ? finalHop.statusCode : 0,
    redirectCount: hops.filter((h) => Boolean(h.nextUrl)).length,
    totalHops: hops.length,
    totalDurationMs,
    userAgent: 'Browser Static Tracer (GitHub Pages Zero-Backend Mode)',
    loopDetected: false,
    maxHopsReached: false,
    upgradedToHttps:
      initialUrl.startsWith('http:') &&
      Boolean(finalHop && finalHop.url && finalHop.url.startsWith('https:')),
    affiliateHopsCount: hops.filter((h) => h.tracking && h.tracking.isAffiliateOrTracker).length,
    cookiesTotal: hops.reduce((acc, h) => acc + (h.cookies ? h.cookies.length : 0), 0),
    hops
  };
}

/**
 * Unified Redirect Tracer Entry Point
 */
export async function traceUrl(rawUrl, options = {}) {
  const normalizedUrl = normalizeInputUrl(rawUrl);
  const mode = options.enginePreference || 'auto';

  // 1. Explicit Custom Cloudflare Worker URL
  if (mode === 'custom' && options.customWorkerUrl) {
    const resp = await fetch(options.customWorkerUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: normalizedUrl,
        uaPreset: options.uaPreset,
        customUserAgent: options.customUserAgent,
        maxHops: options.maxHops,
        followClientRedirects: options.followClientRedirects
      })
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) throw new Error(data.error || 'Custom Worker trace failed');
    return data;
  }

  // 2. Explicit Pure GitHub Pages Browser Mode
  if (mode === 'browser') {
    return await traceViaBrowserStaticEngine(normalizedUrl);
  }

  // 3. Auto or Server Mode: Try /api/trace first, seamlessly fall back to Browser Engine!
  const serverAvailable = await detectServerEngine();
  if (serverAvailable || mode === 'server') {
    try {
      const resp = await fetch('./api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedUrl,
          uaPreset: options.uaPreset || 'shadowtrace',
          customUserAgent: options.customUserAgent || '',
          maxHops: options.maxHops || 15,
          followClientRedirects: options.followClientRedirects !== false
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ok) return data;
        if (mode === 'server') throw new Error(data.error || 'Server trace failed');
      }
    } catch (err) {
      if (mode === 'server') throw err;
    }
  }

  return await traceViaBrowserStaticEngine(normalizedUrl);
}

/**
 * DNS Lookup Tool (100% Client-Side DoH — Cloudflare 1.1.1.1 & Google 8.8.8.8)
 */
export function extractCleanDomain(input) {
  let clean = String(input || '').trim();
  if (!clean) throw new Error('Please enter a domain name.');
  if (/^[a-zA-Z]+:\/\//.test(clean)) {
    clean = new URL(clean).hostname;
  } else {
    clean = clean.split('/')[0].split('?')[0].split(':')[0];
  }
  clean = clean.replace(/\.$/, '').toLowerCase();
  if (!clean || !clean.includes('.')) {
    throw new Error(`Invalid domain name: "${input}"`);
  }
  return clean;
}

async function querySingleDoH(domain, recordType, provider = 'cloudflare') {
  const url =
    provider === 'google'
      ? `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(recordType)}`
      : `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(recordType)}`;

  const headers = provider === 'cloudflare' ? { Accept: 'application/dns-json' } : {};
  const t0 = performance.now();
  const resp = await fetch(url, { headers });
  const elapsedMs = Number((performance.now() - t0).toFixed(1));
  if (!resp.ok) throw new Error(`DNS query failed with HTTP ${resp.status}`);
  const data = await resp.json();

  const records = (data.Answer || []).map((ans) => ({
    name: ans.name,
    type: DNS_TYPE_MAP[ans.type] || `TYPE${ans.type}`,
    typeId: ans.type,
    ttl: ans.TTL,
    data: ans.data
  }));

  const authority = (data.Authority || []).map((auth) => ({
    name: auth.name,
    type: DNS_TYPE_MAP[auth.type] || `TYPE${auth.type}`,
    ttl: auth.TTL,
    data: auth.data
  }));

  return {
    status: data.Status,
    dnssecValidated: Boolean(data.AD),
    truncated: Boolean(data.TC),
    elapsedMs,
    records,
    authority
  };
}

export async function performDnsLookup(rawDomain, recordType = 'A', provider = 'cloudflare') {
  const domain = extractCleanDomain(rawDomain);
  if (recordType === 'ALL') {
    const types = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'CAA', 'SOA'];
    const t0 = performance.now();
    const results = await Promise.all(
      types.map((t) => querySingleDoH(domain, t, provider).catch(() => ({ records: [], authority: [] })))
    );
    const mergedRecords = results.flatMap((r) => r.records || []);
    return {
      domain,
      recordType: 'ALL',
      provider,
      status: 0,
      dnssecValidated: results.some((r) => r.dnssecValidated),
      elapsedMs: Number((performance.now() - t0).toFixed(1)),
      records: mergedRecords,
      authority: []
    };
  }

  const single = await querySingleDoH(domain, recordType, provider);
  return {
    domain,
    recordType,
    provider,
    ...single
  };
}

let cachedRdapBootstrap = null;

async function resolveRdapBaseUrl(tld) {
  try {
    if (!cachedRdapBootstrap) {
      const resp = await fetch('https://data.iana.org/rdap/dns.json');
      if (resp.ok) {
        const json = await resp.json();
        cachedRdapBootstrap = json && Array.isArray(json.services) ? json.services : [];
      }
    }
    if (cachedRdapBootstrap) {
      for (const [tlds, urls] of cachedRdapBootstrap) {
        if (Array.isArray(tlds) && tlds.some((t) => t.toLowerCase() === tld.toLowerCase())) {
          const httpsUrl = urls.find((u) => u.startsWith('https://')) || urls[0];
          if (httpsUrl) return httpsUrl.endsWith('/') ? httpsUrl : httpsUrl + '/';
        }
      }
    }
  } catch {
    // fallback below
  }
  return 'https://rdap.org/';
}

/**
 * Domain WHOIS / RDAP & Expiry Checker (100% Client-Side Official IANA RDAP Bootstrap + DoH Enrichment)
 */
export async function performDomainCheck(rawInput) {
  const host = extractCleanDomain(rawInput);
  // Extract registrable domain (handles common 2-part TLDs like co.uk, co.in, com.au)
  const parts = host.split('.');
  let rootDomain = host;
  if (parts.length > 2) {
    const lastTwo = parts.slice(-2).join('.');
    const multiPartTlds = new Set([
      'co.uk', 'org.uk', 'co.in', 'net.in', 'org.in', 'ac.in', 'gov.in',
      'com.au', 'net.au', 'co.jp', 'com.br', 'co.nz', 'co.za'
    ]);
    rootDomain = multiPartTlds.has(lastTwo)
      ? parts.slice(-3).join('.')
      : parts.slice(-2).join('.');
  }

  const tld = rootDomain.split('.').pop();
  const t0 = performance.now();
  const rdapBase = await resolveRdapBaseUrl(tld);

  const [rdapRes, dnsNs, dnsA] = await Promise.all([
    fetch(`${rdapBase}domain/${encodeURIComponent(rootDomain)}`, {
      headers: { Accept: 'application/rdap+json, application/json' }
    })
      .then(async (r) => (r.ok ? r.json() : { _status: r.status }))
      .catch(() => null),
    querySingleDoH(rootDomain, 'NS', 'cloudflare').catch(() => ({ records: [] })),
    querySingleDoH(rootDomain, 'A', 'cloudflare').catch(() => ({ records: [] }))
  ]);

  const elapsedMs = Number((performance.now() - t0).toFixed(1));

  if (!rdapRes || rdapRes._status === 404) {
    // Check if DNS exists anyway (some country TLDs lack public RDAP)
    if (dnsNs.records && dnsNs.records.length > 0) {
      return {
        domain: rootDomain,
        registered: true,
        rdapSupported: false,
        elapsedMs,
        registrar: 'Registry WHOIS Restricted (TLD does not expose public RDAP)',
        ianaId: null,
        createdDate: null,
        updatedDate: null,
        expiryDate: null,
        daysRemaining: null,
        statusFlags: ['active (verified via DNS NS)'],
        dnssec: dnsNs.dnssecValidated ? 'Signed (DNSSEC Validated)' : 'Unsigned',
        nameservers: dnsNs.records.map((r) => r.data.replace(/\.$/, '')),
        ips: (dnsA.records || []).map((r) => r.data),
        rawRdap: { note: 'Public RDAP unavailable for this TLD; verified active via DNS NS records.' }
      };
    }

    return {
      domain: rootDomain,
      registered: false,
      rdapSupported: true,
      elapsedMs,
      statusFlags: ['Not Registered / Available']
    };
  }

  const events = Array.isArray(rdapRes.events) ? rdapRes.events : [];
  const findEvent = (action) => {
    const ev = events.find((e) => e.eventAction === action);
    return ev ? ev.eventDate : null;
  };

  const createdDate = findEvent('registration');
  const expiryDate = findEvent('expiration');
  const updatedDate = findEvent('last changed') || findEvent('last update of RDAP database');

  let daysRemaining = null;
  if (expiryDate) {
    const diffMs = new Date(expiryDate).getTime() - Date.now();
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  // Extract registrar from entities
  let registrar = 'Unknown Registrar';
  let ianaId = null;
  if (Array.isArray(rdapRes.entities)) {
    const regEntity = rdapRes.entities.find(
      (e) => Array.isArray(e.roles) && e.roles.includes('registrar')
    );
    if (regEntity) {
      if (Array.isArray(regEntity.publicIds) && regEntity.publicIds[0]) {
        ianaId = regEntity.publicIds[0].identifier || null;
      }
      const vcard = regEntity.vcardArray && regEntity.vcardArray[1];
      if (Array.isArray(vcard)) {
        const fnEntry = vcard.find((row) => row[0] === 'fn');
        if (fnEntry && fnEntry[3]) registrar = fnEntry[3];
      }
      if (registrar === 'Unknown Registrar' && regEntity.handle) {
        registrar = regEntity.handle;
      }
    }
  }

  const nameservers = Array.isArray(rdapRes.nameservers)
    ? rdapRes.nameservers.map((ns) => (ns.ldhName || '').toLowerCase()).filter(Boolean)
    : (dnsNs.records || []).map((r) => r.data.replace(/\.$/, '').toLowerCase());

  const dnssec =
    rdapRes.secureDNS && rdapRes.secureDNS.delegationSigned
      ? 'Signed (DNSSEC Enabled)'
      : 'Unsigned';

  return {
    domain: (rdapRes.ldhName || rootDomain).toLowerCase(),
    handle: rdapRes.handle || null,
    registered: true,
    rdapSupported: true,
    elapsedMs,
    registrar,
    ianaId,
    createdDate,
    updatedDate,
    expiryDate,
    daysRemaining,
    statusFlags: Array.isArray(rdapRes.status) ? rdapRes.status : ['active'],
    dnssec,
    nameservers,
    ips: (dnsA.records || []).map((r) => r.data),
    rawRdap: rdapRes
  };
}

/** Create links directly through the selected provider. */
export async function createShortUrl(rawLongUrl, provider = 'isgd', customAlias = '') {
  const longUrl = normalizeInputUrl(rawLongUrl);
  const alias = String(customAlias || '').trim();
  if (alias && !['isgd', 'vgd', 'spoome'].includes(provider)) throw new Error('Custom aliases are supported only by is.gd, v.gd and spoo.me.');
  if (alias && !/^[a-zA-Z0-9_-]+$/.test(alias)) throw new Error('Alias may only contain letters, numbers, underscores and hyphens.');
  const hosts = {isgd:'is.gd',vgd:'v.gd',spoome:'spoo.me',urlvanish:'urlvanish.com',shrink:'shrink.site',urlfy:'urlfy.org',lnkua:'lnk.ua',aisense:'307.fi',devtoolbox:'devtoolbox-api.devtoolbox-api.workers.dev'};
  const host = hosts[provider];
  if (!host) throw new Error('Unknown shortener service.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    let endpoint, options = {signal:controller.signal, credentials:'omit'}, result, data;
    if (provider === 'isgd' || provider === 'vgd') {
      endpoint = new URL(`https://${host}/create.php`); endpoint.searchParams.set('format','json'); endpoint.searchParams.set('url',longUrl); if(alias) endpoint.searchParams.set('shorturl',alias);
    } else if (provider === 'spoome') {
      endpoint = 'https://spoo.me/'; const body = new URLSearchParams({url:longUrl}); if(alias) body.set('alias',alias);
      options = {...options, method:'POST', headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'}, body};
    } else if (provider === 'urlvanish') {
      endpoint = new URL('https://urlvanish.com/api/shorten'); endpoint.searchParams.set('url',longUrl);
    } else if (provider === 'shrink') {
      endpoint = new URL('https://shrink.site/s'); endpoint.searchParams.set('url',longUrl);
    } else {
      const specs={urlfy:['https://urlfy.org/api/v1/shorten',{url:longUrl}],lnkua:['https://lnk.ua/api/v1/link/create',{link:longUrl}],aisense:['https://aisenseapi.com/services/v1/url_shortener',{longUrl}],devtoolbox:['https://devtoolbox-api.devtoolbox-api.workers.dev/shorten',{url:longUrl}]};
      endpoint=specs[provider][0]; options={...options,method:'POST',headers:{'Content-Type':'application/json',...(provider==='lnkua'?{Authorization:'Bearer public'}:{})},body:JSON.stringify(specs[provider][1])};
    }
    const response=await fetch(endpoint,options);
    const raw=await response.text();
    if(provider==='shrink') { result=raw.trim(); data={}; }
    else {
      try { data=JSON.parse(raw); } catch { throw new Error(`${host} returned an invalid response (HTTP ${response.status}).`); }
      result=data.shorturl || data.shortUrl || data.data?.shortUrl || data.short_url || data.result?.lnk;
    }
    if(!response.ok || !result) throw new Error(data.errormessage || data.error || data.message || data.UrlError || data.AliasError || data.result?.errors?.link?.[0] || data.result?.message || `${host} could not shorten the link (HTTP ${response.status}).`);
    if(provider==='spoome') result=result.replace(/^http:\/\//,'https://');
    const parsed=new URL(result);
    if(parsed.protocol!=='https:' || parsed.hostname!==host) throw new Error('Invalid short URL returned by provider.');
    return {shortUrl:parsed.href,provider:host,longUrl};
  } catch(err) {
    if(err.name==='AbortError') throw new Error(`${host} timed out. Try another provider.`);
    if(err instanceof TypeError) throw new Error(`${host} could not be reached. Check your connection or try another provider.`);
    throw err;
  } finally { clearTimeout(timer); }
}
