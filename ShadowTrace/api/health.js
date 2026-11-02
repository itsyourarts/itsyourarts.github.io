/**
 * ShadowTrace — Health & Capability Endpoint
 * Works on Vercel Serverless (/api/health) and local Node server (server.js)
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(
    JSON.stringify({
      ok: true,
      service: 'ShadowTrace Deep Trace Engine',
      version: '1.0.0',
      mode: 'serverless-node',
      capabilities: [
        'http-redirects',
        'meta-refresh-redirects',
        'javascript-redirects',
        'custom-user-agent',
        'socket-timings',
        'tls-inspection',
        'cookie-audit',
        'affiliate-tracker-detection'
      ],
      timestamp: new Date().toISOString()
    })
  );
};
