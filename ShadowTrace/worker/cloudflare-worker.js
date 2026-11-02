/**
 * ShadowTrace — Optional Free Cloudflare Worker Edge Tracer
 * Deploy this single file on Cloudflare Workers (Free Tier: 100,000 req/day)
 * if hosting ShadowTrace purely on GitHub Pages and you want unlimited
 * custom User-Agent + HTML Meta/JS deep redirect tracing from the edge!
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const reqUrl = new URL(request.url);
    if (reqUrl.pathname.endsWith('/health')) {
      return new Response(
        JSON.stringify({ ok: true, service: 'ShadowTrace Cloudflare Edge Worker', mode: 'edge' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    let params = {};
    if (request.method === 'POST') {
      params = await request.json().catch(() => ({}));
    } else {
      params = {
        url: reqUrl.searchParams.get('url'),
        customUserAgent: reqUrl.searchParams.get('customUserAgent'),
        maxHops: reqUrl.searchParams.get('maxHops')
      };
    }

    let currentUrl = String(params.url || '').trim();
    if (!currentUrl) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing url parameter' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
    if (!/^https?:\/\//i.test(currentUrl)) currentUrl = 'http://' + currentUrl;

    const userAgent =
      params.customUserAgent ||
      'ShadowTrace/1.0 (+https://github.com/shadowtrace; Edge Redirect Tracer)';
    const maxHops = Math.min(Math.max(Number(params.maxHops) || 15, 1), 20);

    const hops = [];
    const visited = new Set();
    let loopDetected = false;
    const t0 = Date.now();

    for (let step = 1; step <= maxHops; step++) {
      visited.add(currentUrl);
      const hopStart = Date.now();
      try {
        const resp = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          headers: { 'User-Agent': userAgent, Accept: 'text/html,*/*;q=0.8' }
        });

        const totalMs = Date.now() - hopStart;
        const headersObj = {};
        const rawLines = [`HTTP/1.1 ${resp.status} ${resp.statusText || ''}`];
        resp.headers.forEach((v, k) => {
          headersObj[k] = v;
          rawLines.push(`${k}: ${v}`);
        });

        let nextUrl = null;
        let redirectType = null;
        let bodyPreview = '';

        if ([301, 302, 303, 307, 308].includes(resp.status) && resp.headers.get('location')) {
          nextUrl = new URL(resp.headers.get('location'), currentUrl).toString();
          redirectType = `HTTP ${resp.status}`;
        } else if (resp.status >= 200 && resp.status < 300) {
          const ct = resp.headers.get('content-type') || '';
          if (ct.includes('text/html')) {
            bodyPreview = (await resp.text()).slice(0, 8000);
            const meta = bodyPreview.match(
              /<meta[^>]*http-equiv=["']?refresh["']?[^>]*content=["']?\s*\d+\s*;\s*url=([^"'>\s]+)/i
            );
            if (meta && meta[1]) {
              nextUrl = new URL(meta[1], currentUrl).toString();
              redirectType = 'Meta Refresh';
            }
          }
        }

        hops.push({
          hop: step,
          url: currentUrl,
          statusCode: resp.status,
          statusText: resp.statusText || '',
          scheme: currentUrl.startsWith('https:') ? 'HTTPS' : 'HTTP',
          ip: null,
          redirectType,
          nextUrl,
          timings: { dnsMs: 0, connectMs: 0, tlsMs: 0, ttfbMs: totalMs, totalMs },
          cookies: resp.headers.get('set-cookie')
            ? [{ name: resp.headers.get('set-cookie').split('=')[0], raw: resp.headers.get('set-cookie') }]
            : [],
          securityHeaders: {
            server: headersObj['server'] || null,
            hsts: headersObj['strict-transport-security'] || null,
            cfRay: headersObj['cf-ray'] || null
          },
          headers: headersObj,
          rawRequestHeaders: `GET ${new URL(currentUrl).pathname} HTTP/1.1\r\nHost: ${new URL(currentUrl).host}\r\nUser-Agent: ${userAgent}`,
          rawResponseHeaders: rawLines.join('\r\n'),
          bodyPreview: bodyPreview.slice(0, 1500)
        });

        if (!nextUrl) break;
        if (visited.has(nextUrl)) {
          loopDetected = true;
          break;
        }
        currentUrl = nextUrl;
      } catch (err) {
        hops.push({
          hop: step,
          url: currentUrl,
          statusCode: 0,
          statusText: 'Fetch Error',
          error: err.message,
          timings: { totalMs: Date.now() - hopStart },
          cookies: [],
          headers: {},
          rawResponseHeaders: `Error: ${err.message}`
        });
        break;
      }
    }

    const finalHop = hops[hops.length - 1] || null;
    return new Response(
      JSON.stringify({
        ok: true,
        engine: 'ShadowTrace Cloudflare Edge Worker',
        engineMode: 'worker',
        tracedAt: new Date().toISOString(),
        requestedUrl: params.url,
        finalUrl: finalHop ? finalHop.url : currentUrl,
        finalStatus: finalHop ? finalHop.statusCode : 0,
        redirectCount: hops.filter((h) => Boolean(h.nextUrl)).length,
        totalHops: hops.length,
        totalDurationMs: Date.now() - t0,
        userAgent,
        loopDetected,
        hops
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
};
