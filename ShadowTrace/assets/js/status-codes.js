/**
 * ShadowTrace — HTTP Status Codes Cheat Sheet & SEO Knowledge Base
 * Complete reference matching and expanding upon WhereGoes HTTP Status Codes guide.
 */

export const HTTP_STATUS_CODES = [
  // 1xx Informational
  {
    code: 100,
    category: '1xx',
    title: 'Continue',
    summary: 'The server has received the request headers and the client should proceed to send the request body.',
    seoImpact: 'Neutral — interim protocol handshake not indexed by search engines.',
    troubleshooting: 'Handled automatically by HTTP/1.1+ clients sending Expect: 100-continue.'
  },
  {
    code: 101,
    category: '1xx',
    title: 'Switching Protocols',
    summary: 'The requester has asked the server to switch protocols (for example, upgrading HTTP to WebSockets) and the server has agreed.',
    seoImpact: 'Neutral — used for real-time WebSocket upgrades.',
    troubleshooting: 'Verify Upgrade and Connection headers on reverse proxies like NGINX or Cloudflare.'
  },
  {
    code: 103,
    category: '1xx',
    title: 'Early Hints',
    summary: 'Used primarily with the Link header to let the browser start preloading stylesheets, fonts, or scripts before the final 200 response is ready.',
    seoImpact: 'Positive for Core Web Vitals (improves LCP speed).',
    troubleshooting: 'Supported by Cloudflare and modern CDNs over HTTP/2 and HTTP/3.'
  },

  // 2xx Success
  {
    code: 200,
    category: '2xx',
    title: 'OK',
    summary: 'The standard response for successful HTTP requests. For a redirect trace, 200 OK typically marks the final destination page.',
    seoImpact: 'Optimal — passes indexability signals cleanly when reached with minimal redirect hops.',
    troubleshooting: 'Beware of "Soft 404s" where a missing page returns 200 OK instead of 404, or client-side Meta/JS redirects hiding inside a 200 response.'
  },
  {
    code: 201,
    category: '2xx',
    title: 'Created',
    summary: 'The request has been fulfilled, resulting in the creation of a new resource.',
    seoImpact: 'Commonly used by REST APIs rather than public HTML pages.',
    troubleshooting: 'Check the Location header for the URI of the newly created resource.'
  },
  {
    code: 202,
    category: '2xx',
    title: 'Accepted',
    summary: 'The request has been accepted for asynchronous processing, but processing has not been completed yet.',
    seoImpact: 'Not intended for standard indexable content pages.',
    troubleshooting: 'Used for background jobs, webhooks, or queued API operations.'
  },
  {
    code: 204,
    category: '2xx',
    title: 'No Content',
    summary: 'The server successfully processed the request and is not returning any content in the body.',
    seoImpact: 'Search engines will not index a 204 response because it has no body.',
    troubleshooting: 'Often seen on tracking beacons, analytics pixels, and CORS preflight responses.'
  },
  {
    code: 206,
    category: '2xx',
    title: 'Partial Content',
    summary: 'The server is delivering only part of the resource due to a Range header sent by the client (used for video streaming and resumable downloads).',
    seoImpact: 'Normal for media assets and PDFs.',
    troubleshooting: 'Ensure Accept-Ranges and Content-Range headers are configured properly.'
  },

  // 3xx Redirection
  {
    code: 300,
    category: '3xx',
    title: 'Multiple Choices',
    summary: 'Indicates multiple options for the resource from which the client may choose (e.g., different language or format variants).',
    seoImpact: 'Rarely used; prefer explicit 301 redirects or hreflang annotations for SEO.',
    troubleshooting: 'Check if Location header specifies a preferred default target.'
  },
  {
    code: 301,
    category: '3xx',
    title: 'Moved Permanently',
    summary: 'All future requests for this URL should be directed to the given Location URI. This is the gold-standard permanent redirect.',
    seoImpact: 'High Importance — consolidates canonical URL and passes link equity (PageRank) to the destination URL. Keep redirect chains to 1 hop whenever possible.',
    troubleshooting: 'Browsers aggressively cache 301 redirects. When testing changes, clear browser cache or trace via ShadowTrace to see uncached server headers.'
  },
  {
    code: 302,
    category: '3xx',
    title: 'Found (Temporary Redirect)',
    summary: 'Tells clients and crawlers that the resource has temporarily moved to another URL, so future requests should continue using the original URL.',
    seoImpact: 'Crucial SEO check — using 302 instead of 301 during a permanent site migration can delay canonical consolidation in Google Search.',
    troubleshooting: 'Commonly used by affiliate networks, A/B tests, geo-routing, and URL shorteners.'
  },
  {
    code: 303,
    category: '3xx',
    title: 'See Other',
    summary: 'Directs the client to fetch the target resource at another URI specifically using a GET request (Post/Redirect/Get pattern).',
    seoImpact: 'Used after form submissions; should not be used for permanent URL migrations.',
    troubleshooting: 'Prevents duplicate form submissions when users refresh the browser.'
  },
  {
    code: 304,
    category: '3xx',
    title: 'Not Modified',
    summary: 'Indicates that the resource has not been modified since the version specified by If-Modified-Since or If-None-Match (ETag).',
    seoImpact: 'Positive — saves crawl budget and bandwidth for search engine bots.',
    troubleshooting: 'Verify ETag and Cache-Control headers if stale content is being served.'
  },
  {
    code: 307,
    category: '3xx',
    title: 'Temporary Redirect (Method Preserved)',
    summary: 'HTTP/1.1 strict successor to 302: temporarily redirects to another URL while guaranteeing the HTTP method (e.g., POST stays POST) is not changed. Also used internally by browsers for HSTS upgrades.',
    seoImpact: 'Treated as a temporary redirect by search engines (unless seen locally in browser DevTools due to HSTS preload).',
    troubleshooting: 'If ShadowTrace shows 301 on the server while Chrome DevTools shows 307 Internal Redirect, that means HSTS is upgrading HTTP to HTTPS client-side.'
  },
  {
    code: 308,
    category: '3xx',
    title: 'Permanent Redirect (Method Preserved)',
    summary: 'The strict permanent counterpart to 307: permanently redirects to the new Location while preserving the original HTTP request method and body.',
    seoImpact: 'Treated identically to 301 Moved Permanently by Google and modern search engines — passes full link equity.',
    troubleshooting: 'Frequently used by Vercel, Next.js, Cloudflare, and modern reverse proxies for HTTP-to-HTTPS or trailing-slash normalization.'
  },

  // 4xx Client Errors
  {
    code: 400,
    category: '4xx',
    title: 'Bad Request',
    summary: 'The server cannot or will not process the request due to malformed syntax, invalid query characters, or oversized headers/cookies.',
    seoImpact: 'Breaks crawling and causes de-indexing if returned on public URLs.',
    troubleshooting: 'Inspect special characters or unencoded spaces in redirect Location URLs.'
  },
  {
    code: 401,
    category: '4xx',
    title: 'Unauthorized',
    summary: 'Authentication is required and has failed or has not yet been provided (WWW-Authenticate header).',
    seoImpact: 'Blocks search engine crawlers completely.',
    troubleshooting: 'Check HTTP Basic Auth or staging environment password protection.'
  },
  {
    code: 403,
    category: '4xx',
    title: 'Forbidden',
    summary: 'The server understood the request but refuses to authorize it — often triggered by WAF/Cloudflare bot rules, IP blocks, or User-Agent filtering.',
    seoImpact: 'Critical if Googlebot receives 403 — pages will drop out of search results.',
    troubleshooting: 'Try switching the User-Agent in ShadowTrace Advanced Options (e.g., Chrome Desktop vs Bot) to test if a WAF is blocking automated crawlers.'
  },
  {
    code: 404,
    category: '4xx',
    title: 'Not Found',
    summary: 'The requested resource could not be found on the server. In a redirect chain, a 404 breaks the entire link path and loses traffic & affiliate commissions.',
    seoImpact: 'High Risk in Redirect Chains — any broken 404 at the end or middle of a redirect chain discards all backlink PageRank and user traffic.',
    troubleshooting: 'Update the broken redirect rule to point directly to a live 200 OK destination.'
  },
  {
    code: 405,
    category: '4xx',
    title: 'Method Not Allowed',
    summary: 'The request method (e.g., HEAD or POST) is known by the server but is not supported by the target resource.',
    seoImpact: 'Ensure GET and HEAD requests are allowed on public pages.',
    troubleshooting: 'Some servers block HEAD probes; ShadowTrace uses GET by default to mirror real browsers.'
  },
  {
    code: 410,
    category: '4xx',
    title: 'Gone',
    summary: 'Indicates that the resource requested was intentionally and permanently removed and will not return.',
    seoImpact: 'Signals Google to de-index the URL faster than a 404. Do NOT use if a replacement page exists (use 301 instead).',
    troubleshooting: 'Verify no valuable external backlinks point to a 410 URL — redirect high-authority legacy URLs with 301 instead.'
  },
  {
    code: 429,
    category: '4xx',
    title: 'Too Many Requests',
    summary: 'The client has sent too many requests in a given window of time (rate limiting).',
    seoImpact: 'Forces Googlebot to slow down crawling dramatically.',
    troubleshooting: 'Check Retry-After header and CDN rate-limiting thresholds.'
  },
  {
    code: 451,
    category: '4xx',
    title: 'Unavailable For Legal Reasons',
    summary: 'The user agent requested a resource that cannot legally be provided (e.g., GDPR geo-blocking or DMCA takedown).',
    seoImpact: 'Prevents indexing from regions where 451 is served.',
    troubleshooting: 'Check regional CDN/GeoIP compliance rules.'
  },

  // 5xx Server Errors
  {
    code: 500,
    category: '5xx',
    title: 'Internal Server Error',
    summary: 'A generic server error message returned when an unexpected condition or unhandled exception occurred on the origin server.',
    seoImpact: 'Severe — persistent 5xx errors cause rankings to drop and pages to be removed from search indices.',
    troubleshooting: 'Check application logs, .htaccess syntax errors, or broken rewrite rules.'
  },
  {
    code: 502,
    category: '5xx',
    title: 'Bad Gateway',
    summary: 'The server was acting as a gateway or proxy (e.g., NGINX, Cloudflare, ALB) and received an invalid response from the upstream server.',
    seoImpact: 'Severe if persistent; breaks redirect chains.',
    troubleshooting: 'Verify upstream Node/PHP/Python process health and socket timeouts.'
  },
  {
    code: 503,
    category: '5xx',
    title: 'Service Unavailable',
    summary: 'The server cannot handle the request right now because it is overloaded or down for scheduled maintenance.',
    seoImpact: 'Correct code for temporary maintenance (include Retry-After header), but prolonged 503s lead to de-indexing.',
    troubleshooting: 'Sometimes returned by anti-bot JS challenges (e.g., legacy DDoS interstitials).'
  },
  {
    code: 504,
    category: '5xx',
    title: 'Gateway Timeout',
    summary: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream origin server.',
    seoImpact: 'Breaks user visits and crawler budgets.',
    troubleshooting: 'Check slow database queries, firewall drops, or origin server overload.'
  }
];

export function getStatusCodeInfo(code) {
  const num = Number(code);
  const found = HTTP_STATUS_CODES.find((item) => item.code === num);
  if (found) return found;

  if (num === 0) {
    return {
      code: 0,
      category: 'err',
      title: 'No HTTP Response / Blocked',
      summary: 'No valid HTTP status code was received due to DNS failure, connection timeout, TLS error, or network block.',
      seoImpact: 'Unreachable URLs cannot be crawled or visited.',
      troubleshooting: 'Verify the domain exists via ShadowTrace DNS Lookup and is publicly reachable.'
    };
  }

  const family = `${Math.floor(num / 100)}xx`;
  return {
    code: num,
    category: family,
    title: `HTTP ${num}`,
    summary: `Server responded with HTTP status code ${num} (${family} class).`,
    seoImpact: 'Inspect response headers for caching and redirect behavior.',
    troubleshooting: 'Review raw HTTP headers in the hop inspector.'
  };
}
