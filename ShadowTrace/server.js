/**
 * ShadowTrace — Zero-Dependency Local & Self-Hosted Server
 * Serves static GitHub Pages files + /api/* endpoints identically to Vercel.
 * Usage: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const healthHandler = require('./api/health');
const traceHandler = require('./api/trace');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

const BLOCKED_STATIC_PREFIXES = ['/api/', '/worker/', '/.git', '/server.js'];

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // CORS & Preview-friendly headers (no X-Frame-Options block)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (pathname === '/api/health' || pathname === '/api/health/') {
      return await healthHandler(req, res);
    }
    if (pathname === '/api/trace' || pathname === '/api/trace/') {
      return await traceHandler(req, res);
    }

    if (BLOCKED_STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: 'Not Found' }));
    }

    let relativePath = pathname === '/' ? '/index.html' : pathname;
    if (relativePath.endsWith('/')) {
      relativePath += 'index.html';
    }

    const safeFilePath = path.normalize(path.join(ROOT_DIR, relativePath));
    if (!safeFilePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Forbidden');
    }

    fs.stat(safeFilePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // SPA fallback to index.html for clean routes
        const fallback = path.join(ROOT_DIR, 'index.html');
        fs.readFile(fallback, (fbErr, data) => {
          if (fbErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('404 Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        });
        return;
      }

      const ext = path.extname(safeFilePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(safeFilePath).pipe(res);
    });
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: err.message || 'Internal Server Error' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`⚡ ShadowTrace running at http://${HOST}:${PORT}`);
});
