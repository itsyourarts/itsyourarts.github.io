const { Readable } = require("stream");
const {
  setCors,
  sendJson,
  isAllowedApiframeCdn,
} = require("../lib/apiframe");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "GET") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const u = new URL(req.url || "/", "http://localhost");
    const targetUrl = req.query?.url || u.searchParams.get("url") || "";
    const rawName = req.query?.filename || u.searchParams.get("filename") || "seedance-video.mp4";
    const safeFilename =
      String(rawName).replace(/[^a-zA-Z0-9._-]/g, "_") || "seedance-video.mp4";

    if (!targetUrl || !isAllowedApiframeCdn(targetUrl)) {
      return sendJson(res, 400, {
        ok: false,
        error: "Only valid Apiframe CDN media URLs can be downloaded via this proxy.",
      });
    }

    const upstream = await fetch(targetUrl);
    if (!upstream.ok) {
      return sendJson(res, upstream.status, {
        ok: false,
        error: `CDN responded with HTTP ${upstream.status}`,
      });
    }

    const contentType =
      upstream.headers.get("content-type") || "video/mp4";
    const contentLength = upstream.headers.get("content-length");

    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename}"`
    );
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    if (upstream.body && Readable.fromWeb) {
      Readable.fromWeb(upstream.body).pipe(res);
    } else {
      const arrayBuf = await upstream.arrayBuffer();
      res.end(Buffer.from(arrayBuf));
    }
  } catch (err) {
    return sendJson(res, 500, {
      ok: false,
      error: err.message || "Download failed.",
    });
  }
};
