const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = pathname === '/' ? '/index.html' : pathname;
  const full = path.resolve(ROOT, '.' + file);
  if (!full.startsWith(ROOT + path.sep) && full !== path.join(ROOT, 'index.html')) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(full);
    const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin' });
    res.end(data);
  });
});
const wss = new WebSocketServer({ server, maxPayload: 1024 * 1024 });
const rooms = new Map();
const send = (ws, obj) => { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)); };
const code = () => Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
function leave(ws) {
  if (!ws.room) return;
  const room = rooms.get(ws.room);
  if (room) {
    const other = room.sender === ws ? room.receiver : room.sender;
    send(other, { type: 'peer-left' });
    if (room.sender === ws) {
      if (room.receiver) room.receiver.room = null;
      rooms.delete(ws.room);
    } else {
      room.receiver = null;
    }
  }
  ws.room = null;
}
wss.on('connection', ws => {
  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return send(ws, { type:'error', message:'Invalid signaling message.' }); }
    if (!msg || typeof msg.type !== 'string') return;
    if (msg.type === 'create') {
      leave(ws);
      let id = code(); while (rooms.has(id)) id = code();
      rooms.set(id, { sender: ws, receiver: null, created: Date.now() });
      ws.room = id; ws.role = 'sender'; send(ws, { type:'created', code:id }); return;
    }
    if (msg.type === 'join') {
      const id = String(msg.code || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
      const room = rooms.get(id);
      if (!room || room.sender.readyState !== WebSocket.OPEN) return send(ws, { type:'error', message:'Share not found. Check the code and ask the sender to keep their page open.' });
      if (room.receiver && room.receiver.readyState === WebSocket.OPEN) return send(ws, { type:'error', message:'This share already has a receiver connected.' });
      leave(ws); room.receiver = ws; ws.room = id; ws.role = 'receiver';
      send(ws, { type:'joined', code:id }); send(room.sender, { type:'peer-joined' }); return;
    }
    if (['offer','answer','candidate','reject'].includes(msg.type)) {
      const room = rooms.get(ws.room); if (!room) return send(ws, { type:'error', message:'Share session has ended.' });
      const other = room.sender === ws ? room.receiver : room.sender;
      if (!other || other.readyState !== WebSocket.OPEN) return;
      const out = { type:msg.type };
      if (msg.description) out.description = msg.description;
      if (msg.candidate) out.candidate = msg.candidate;
      if (msg.reason) out.reason = String(msg.reason).slice(0, 160);
      send(other, out); return;
    }
    if (msg.type === 'leave') leave(ws);
  });
  ws.on('close', () => leave(ws));
  ws.on('error', () => leave(ws));
});
// Expire abandoned rooms even if a client disconnect event is missed.
setInterval(() => { for (const [id, room] of rooms) if (Date.now() - room.created > 6 * 60 * 60 * 1000 || room.sender.readyState !== WebSocket.OPEN) { send(room.receiver, { type:'peer-left' }); rooms.delete(id); } }, 60_000).unref();
server.listen(PORT, '0.0.0.0', () => console.log(`ShadowShare listening on 0.0.0.0:${PORT}`));
