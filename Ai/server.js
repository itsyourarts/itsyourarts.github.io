/**
 * ShadowxAi + Seedance 2.5 Video Studio Server
 * Zero external dependencies — works on Node 18+ / 20+ / Render / Railway / Local
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const healthHandler = require("./api/health");
const chatHandler = require("./api/chat");
const generateHandler = require("./api/generate");
const imageHandler = require("./api/image");
const jobHandler = require("./api/job");
const uploadHandler = require("./api/upload");
const downloadHandler = require("./api/download");
const { getApiKey } = require("./lib/apiframe");

const PORT = parseInt(process.env.PORT || "3000", 10);
const ROOT_DIR = __dirname;

const ROUTES = {
  "/api/health": healthHandler,
  "/api/chat": chatHandler,
  "/api/generate": generateHandler,
  "/api/image": imageHandler,
  "/api/job": jobHandler,
  "/api/upload": uploadHandler,
  "/api/download": downloadHandler,
};

const PUBLIC_FILES = {
  "/": "index.html",
  "/index.html": "index.html",
  "/Ai": "index.html",
  "/Ai/": "index.html",
  "/Ai/index.html": "index.html",
  "/i.html": "i.html",
  "/Ai/i.html": "i.html",
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    let pathname = parsedUrl.pathname;

    /* Support both `/api/...` and `/Ai/api/...` so subfolder proxies work too */
    if (pathname.startsWith("/Ai/api/")) {
      pathname = pathname.slice(3);
    }

    if (ROUTES[pathname]) {
      req.query = Object.fromEntries(parsedUrl.searchParams.entries());
      return await ROUTES[pathname](req, res);
    }

    if (pathname.startsWith("/api/")) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ ok: false, error: `API route ${pathname} not found` }));
    }

    const mapped = PUBLIC_FILES[pathname];
    const targetFile = mapped
      ? path.join(ROOT_DIR, mapped)
      : path.join(ROOT_DIR, "index.html");

    fs.readFile(targetFile, (err, content) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("Error loading ShadowxAi interface.");
      }
      const ext = path.extname(targetFile).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      });
      res.end(content);
    });
  } catch (err) {
    console.error("Server error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Internal Server Error" }));
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  const configured = Boolean(getApiKey());
  console.log(
    `⚡ ShadowxAi + Seedance Studio running on http://0.0.0.0:${PORT} (APIFRAME_API_KEY: ${
      configured ? "CONFIGURED" : "NOT SET YET"
    })`
  );
});
