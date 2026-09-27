const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { Readable } = require("stream");
const { getDetails, getPlaylist, isTeraboxUrl, UA } = require("./api");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// in-memory session store: token -> { cookie, referer, files, exp }
const SESSIONS = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of SESSIONS) if (v.exp < now) SESSIONS.delete(k);
}, 60000).unref();

async function resolveHandler(req, res) {
  const src = req.method === "GET" ? req.query : req.body || {};
  const link = String(src.url || "").trim();
  const cookie = String(src.cookie || "").trim();
  if (!link) return res.status(400).json({ ok: false, error: "Please enter a link." });
  if (!isTeraboxUrl(link)) return res.status(400).json({ ok: false, error: "That does not look like a valid Terabox link." });
  try {
    const out = await getDetails(link, cookie);
    const token = crypto.randomBytes(9).toString("hex");
    SESSIONS.set(token, {
      cookie: out.cookie,
      referer: out.referer,
      ctx: out.ctx,
      files: out.files,
      exp: Date.now() + 2 * 3600 * 1000,
    });
    res.json({
      ok: true,
      token,
      needsCookie: out.needsCookie,
      files: out.files.map((f, i) => ({
        i, name: f.name, size: f.size, sizeText: f.sizeText, kind: f.kind,
        thumb: f.thumb ? `/thumb?t=${token}&i=${i}` : null,
        playable: f.kind === "video" || ((f.kind === "audio" || f.kind === "image") && !!f.url),
        hls: f.kind === "video",
        fs_id: f.fs_id,
        ready: !!f.url,
      })),
    });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
}
app.get("/api/resolve", resolveHandler);
app.post("/api/resolve", resolveHandler);

function pick(req) {
  const s = SESSIONS.get(String(req.query.t || ""));
  if (!s) return null;
  const f = s.files[Number(req.query.i)];
  if (!f) return null;
  return { s, f };
}

async function proxy(req, res, url, filename, inline) {
  const s = SESSIONS.get(String(req.query.t || ""));
  try {
    const upstream = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": UA,
        Referer: s?.referer || "https://www.terabox.com/",
        ...(s?.cookie ? { Cookie: s.cookie } : {}),
        ...(req.headers.range ? { Range: req.headers.range } : {}),
      },
    });
    if (upstream.status === 403) {
      const txt = await upstream.text();
      return res.status(403).type("text/plain").send(
        "Terabox blocked this download (login required). Add your TeraBox ndus cookie in the UI.\n" + txt.slice(0, 200)
      );
    }
    res.status(upstream.status);
    ["content-length", "content-type", "accept-ranges", "content-range"].forEach((h) => {
      const v = upstream.headers.get(h);
      if (v) res.setHeader(h, v);
    });
    if (!upstream.headers.get("content-type") && /\.mp4$/i.test(filename)) res.setHeader("content-type", "video/mp4");
    res.setHeader("Accept-Ranges", res.getHeader("accept-ranges") || "bytes");
    res.setHeader(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename="${String(filename).replace(/["\r\n]/g, "")}"`
    );
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (e) {
    res.status(502).type("text/plain").send("Stream failed: " + e.message);
  }
}

// download (attachment)
app.get("/dl", async (req, res) => {
  const p = pick(req);
  if (!p || !p.f.url) return res.status(404).send("Link expired — please resolve again.");
  await proxy(req, res, p.f.url, p.f.name, false);
});

// inline stream for the on-site player
app.get("/stream", async (req, res) => {
  const p = pick(req);
  if (!p || !p.f.url) return res.status(404).send("Link expired — please resolve again.");
  await proxy(req, res, p.f.url, p.f.name, true);
});

// thumbnail proxy (terabox thumbs need referer)
app.get("/thumb", async (req, res) => {
  const p = pick(req);
  if (!p || !p.f.thumb) return res.status(404).end();
  try {
    const u = await fetch(p.f.thumb, { headers: { "User-Agent": UA, Referer: p.s.referer } });
    res.status(u.status);
    const ct = u.headers.get("content-type");
    if (ct) res.setHeader("content-type", ct);
    Readable.fromWeb(u.body).pipe(res);
  } catch { res.status(502).end(); }
});

// ---- HLS (480p) — works without login ----
app.get("/hls.m3u8", async (req, res) => {
  const p = pick(req);
  if (!p) return res.status(404).send("expired");
  try {
    const pl = await getPlaylist(p.s.ctx, p.f.fs_id);
    const t = String(req.query.t), i = String(req.query.i);
    const out = pl.split("\n").map((l) =>
      l.startsWith("http") ? `/seg?t=${t}&i=${i}&u=${encodeURIComponent(l.trim())}` : l
    ).join("\n");
    res.type("application/vnd.apple.mpegurl").send(out);
  } catch (e) { res.status(502).type("text/plain").send(e.message); }
});

app.get("/seg", async (req, res) => {
  const s = SESSIONS.get(String(req.query.t || ""));
  const u = String(req.query.u || "");
  if (!s || !/^https:\/\//.test(u)) return res.status(400).end();
  try {
    const up = await fetch(u, { headers: { "User-Agent": UA, Referer: s.referer, Cookie: s.cookie } });
    res.status(up.status).type("video/mp2t");
    Readable.fromWeb(up.body).pipe(res);
  } catch (e) { res.status(502).end(); }
});

// 480p download: collect TS segments into one file (playlist slides, so we poll)
app.get("/hlsdl", async (req, res) => {
  const p = pick(req);
  if (!p) return res.status(404).send("expired");
  const name = p.f.name.replace(/\.[^.]+$/, "") + "_480p.ts";
  res.setHeader("Content-Type", "video/mp2t");
  res.setHeader("Content-Disposition", `attachment; filename="${name.replace(/["\r\n]/g, "")}"`);
  const H = { "User-Agent": UA, Referer: p.s.referer, Cookie: p.s.cookie };
  const seen = new Map();           // startByte -> url
  let total = 0, nextStart = 0, idle = 0;
  const deadline = Date.now() + 10 * 60 * 1000;
  try {
    while (Date.now() < deadline && idle < 8) {
      let pl;
      try { pl = await getPlaylist(p.s.ctx, p.f.fs_id); } catch { break; }
      let added = 0;
      for (const line of pl.split("\n")) {
        if (!line.startsWith("http")) continue;
        const u = line.trim();
        const m = /range=(\d+)-(\d+)/.exec(decodeURIComponent(u));
        const start = m ? Number(m[1]) : seen.size;
        const ts = /ts_size=(\d+)/.exec(u);
        if (ts) total = Number(ts[1]);
        if (!seen.has(start)) { seen.set(start, u); added++; }
      }
      // stream whatever segments are ready, in order
      const starts = [...seen.keys()].sort((a, b) => a - b);
      for (const st of starts) {
        if (st < nextStart) continue;
        const u = seen.get(st);
        const up = await fetch(u, { headers: H });
        if (!up.ok) continue;
        const buf = Buffer.from(await up.arrayBuffer());
        if (!res.write(buf)) await new Promise((r) => res.once("drain", r));
        const m = /range=(\d+)-(\d+)/.exec(decodeURIComponent(u));
        nextStart = m ? Number(m[2]) + 1 : nextStart + 1;
      }
      if (total && nextStart >= total - 1) break;
      idle = added ? 0 : idle + 1;
      await new Promise((r) => setTimeout(r, 2000));
    }
  } catch { /* client disconnect */ }
  res.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Terabox web downloader on :" + PORT));
