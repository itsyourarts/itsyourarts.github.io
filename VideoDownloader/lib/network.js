import dns from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import ipaddr from 'ipaddr.js';

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const MAX_URL_LENGTH = 2048;
const ALLOWED_PORTS = new Set(['', '80', '443', '8080', '8443']);

export class PublicUrlError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'PublicUrlError';
    this.status = status;
  }
}

export function normalizeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new PublicUrlError('Please enter a website or video URL.');
  }
  let input = value.trim();
  if (input.length > MAX_URL_LENGTH) {
    throw new PublicUrlError('This URL is too long.');
  }
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(input)) input = `https://${input}`;
  let url;
  try { url = new URL(input); }
  catch { throw new PublicUrlError('Please enter a valid website URL.'); }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new PublicUrlError('Only HTTP and HTTPS links are supported.');
  }
  if (url.username || url.password) {
    throw new PublicUrlError('Links containing usernames or passwords are not supported.');
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    throw new PublicUrlError('This URL uses a non-standard port.');
  }
  url.hash = '';
  return url.toString();
}

export function isPublicIp(ip) {
  try {
    const address = ipaddr.parse(ip);
    if (address.kind() === 'ipv6' && address.isIPv4MappedAddress()) {
      return address.toIPv4Address().range() === 'unicast';
    }
    return address.range() === 'unicast';
  } catch { return false; }
}

// Resolve before EVERY outbound request and pin the validated address in the socket's
// DNS lookup. This also applies after redirects; a redirect cannot access localhost.
export async function assertPublicUrl(input) {
  const normalized = normalizeUrl(input);
  const url = new URL(normalized);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (/^(localhost|.+\.localhost|.+\.local|.+\.internal)$/i.test(host)) {
    throw new PublicUrlError('Private or local network addresses are not allowed.');
  }
  let addresses;
  if (ipaddr.isValid(host)) {
    addresses = [{ address: host, family: host.includes(':') ? 6 : 4 }];
  } else {
    try { addresses = await dns.lookup(host, { all: true, verbatim: true }); }
    catch { throw new PublicUrlError('This website could not be found.', 422); }
  }
  if (!addresses.length || addresses.some(({ address }) => !isPublicIp(address))) {
    throw new PublicUrlError('Private or local network addresses are not allowed.');
  }
  return { url: normalized, address: addresses[0] };
}

function responseFor(url, address, { method, headers, timeoutMs }) {
  const transport = url.startsWith('https:') ? https : http;
  return new Promise((resolve, reject) => {
    const request = transport.request(url, {
      method,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        ...headers,
      },
      // Node's automatic family selection asks custom lookups for an array; turn it
      // off so the socket uses exactly this already-validated, pinned address.
      autoSelectFamily: false,
      lookup: (_hostname, _options, callback) => {
        callback(null, address.address, address.family);
      },
    }, resolve);
    request.setTimeout(timeoutMs, () => request.destroy(new Error('The website took too long to respond.')));
    request.once('error', reject);
    request.end();
  });
}

export async function openPublic(input, options = {}) {
  let current = normalizeUrl(input);
  const method = options.method || 'GET';
  const headers = options.headers || {};
  const timeoutMs = options.timeoutMs || 10000;
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const { address } = await assertPublicUrl(current);
    let response;
    try {
      response = await responseFor(current, address, { method, headers, timeoutMs });
    } catch (error) {
      throw new PublicUrlError(
        error.message.includes('too long') ? error.message : 'Could not connect to this website.',
        422,
      );
    }
    if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
      const location = response.headers.location;
      response.resume();
      if (redirects === 5) throw new PublicUrlError('This URL redirects too many times.', 422);
      try { current = normalizeUrl(new URL(location, current).toString()); }
      catch { throw new PublicUrlError('The website redirects to an invalid URL.', 422); }
      continue;
    }
    return { response, finalUrl: current };
  }
  throw new PublicUrlError('This URL redirects too many times.', 422);
}

export async function readLimited(response, maxBytes = 2_500_000) {
  const chunks = [];
  let total = 0;
  try {
    for await (const chunk of response) {
      total += chunk.length;
      if (total > maxBytes) {
        response.destroy();
        throw new PublicUrlError('This webpage is too large to scan.', 422);
      }
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    if (error instanceof PublicUrlError) throw error;
    throw new PublicUrlError('The website stopped responding while it was being scanned.', 422);
  }
}

export function isMp4Url(input) {
  try {
    const url = new URL(input);
    return /\.mp4$/i.test(url.pathname) ||
      [...url.searchParams.values()].some((value) => /\.mp4(?:$|[?#])/i.test(value));
  } catch { return false; }
}
