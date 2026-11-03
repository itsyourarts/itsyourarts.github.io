const http = require('http');
const https = require('https');
const dns = require('dns');
const net = require('net');

function publicIp(ip) {
  if (net.isIPv4(ip)) {
    const p = ip.split('.').map(Number);
    return !(p[0] === 0 || p[0] === 10 || p[0] === 127 || p[0] >= 224 ||
      (p[0] === 100 && p[1] >= 64 && p[1] <= 127) ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && (p[1] === 168 || p[1] === 0)) ||
      (p[0] === 198 && (p[1] === 18 || p[1] === 19)));
  }
  if (net.isIPv6(ip)) {
    const s = ip.toLowerCase();
    if (s.startsWith('::ffff:')) { const m = s.slice(7); return !!net.isIPv4(m) && publicIp(m); }
    return !(s === '::1' || s === '::' || s.startsWith('fc') || s.startsWith('fd') || /^fe[89ab]/.test(s));
  }
  return false;
}
function lookup(host, opts, cb) {
  dns.lookup(host, { all: true, verbatim: true }, (err, ips) => {
    if (err) return cb(err);
    const address = ips.find(x => publicIp(x.address));
    if (!address) return cb(Error('Private or local addresses are not allowed'));
    return opts && opts.all ? cb(null, [address]) : cb(null, address.address, address.family);
  });
}
function validate(raw) {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw Error('Only HTTP/HTTPS URLs are supported');
  const ip = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(ip) && !publicIp(ip)) throw Error('Private or local addresses are not allowed');
  url.hash = '';
  return url;
}
function reply(res, status, data) {
  if (!res.writableEnded && !res.destroyed) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
  }
}
function check(req, res, body) {
  let url;
  try { url = validate(typeof body === 'string' ? JSON.parse(body).url : body?.url); }
  catch (e) { return reply(res, 400, { error: e.message }); }
  const start = Date.now(), chain = [], visited = new Set();
  let current, done = false;
  const finish = data => {
    if (done) return;
    done = true;
    clearTimeout(overallTimeout);
    reply(res, 200, { ...data, time: Date.now() - start, chain, finalUrl: url.href });
  };
  const overallTimeout = setTimeout(() => { finish({ error: 'Overall request timed out' }); if (current) current.destroy(); }, 100000);
  const fetchUrl = () => {
    if (visited.has(url.href)) return finish({ error: 'Redirect loop detected' });
    visited.add(url.href);
    current = (url.protocol === 'https:' ? https : http).request(url, {
      method: 'GET', lookup,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShadowRespCheck/1.0)', 'Accept': '*/*' }
    }, r => {
      r.destroy();
      const location = r.headers.location;
      if ([301, 302, 303, 307, 308].includes(r.statusCode) && location) {
        chain.push({ url: url.href, status: r.statusCode, location });
        if (chain.length > 10) return finish({ error: 'Too many redirects (maximum 10)' });
        try { url = validate(new URL(location, url).href); }
        catch (e) { return finish({ error: 'Redirect blocked: ' + e.message }); }
        return fetchUrl();
      }
      finish({ status: r.statusCode, statusText: r.statusMessage, location: location || null });
    });
    current.setTimeout(12000, () => current.destroy(Error('Request timed out')));
    current.on('error', e => finish({ error: e.message }));
    current.end();
  };
  res.on('close', () => { if (!res.writableEnded) { done = true; clearTimeout(overallTimeout); if (current) current.destroy(); } });
  fetchUrl();
}
module.exports = function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed' });
  // Vercel parses JSON before invoking the function; plain Node.js does not.
  if (req.body !== undefined) return check(req, res, req.body);
  let body = '';
  req.on('data', chunk => { body += chunk; if (body.length > 10000) { reply(res, 413, { error: 'Request too large' }); req.destroy(); } });
  req.on('end', () => { if (!res.writableEnded) check(req, res, body); });
};
