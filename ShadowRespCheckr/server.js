const http = require('http');
const fs = require('fs');
const path = require('path');
const check = require('./api/check');
http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
  }
  if (req.url === '/api/check') return check(req, res);
  res.writeHead(404); res.end('Not found');
}).listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('ShadowRespCheck running'));
