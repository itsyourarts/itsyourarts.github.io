const {
  setCors,
  sendJson,
  readRawBuffer,
  parseDataUrl,
  uploadMediaBuffer,
} = require("../lib/apiframe");

async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const contentTypeHeader = String(req.headers["content-type"] || "").toLowerCase();

    if (contentTypeHeader.includes("application/json")) {
      const rawBuf = await readRawBuffer(req, 36 * 1024 * 1024);
      const parsed = JSON.parse(rawBuf.toString("utf8") || "{}");
      if (!parsed.dataUrl) {
        return sendJson(res, 400, {
          ok: false,
          error: "Missing dataUrl in JSON upload request.",
        });
      }
      const { buffer, contentType, ext } = parseDataUrl(parsed.dataUrl);
      const safeName =
        String(parsed.filename || `upload.${ext}`).replace(/[^a-zA-Z0-9._-]/g, "_") ||
        `upload.${ext}`;
      const result = await uploadMediaBuffer(buffer, safeName, contentType);
      return sendJson(res, 201, result);
    }

    /* Raw binary stream upload (zero base64 overhead) */
    const rawBuffer = await readRawBuffer(req, 52 * 1024 * 1024);
    const mime =
      String(req.headers["x-mime-type"] || contentTypeHeader || "application/octet-stream")
        .split(";")[0]
        .trim() || "application/octet-stream";
    let filename = "upload.bin";
    if (req.headers["x-file-name"]) {
      try {
        filename = decodeURIComponent(String(req.headers["x-file-name"])).replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );
      } catch (_) {
        filename = "upload.bin";
      }
    }

    const result = await uploadMediaBuffer(rawBuffer, filename, mime);
    return sendJson(res, 201, result);
  } catch (err) {
    return sendJson(res, err.statusCode || 500, {
      ok: false,
      error: err.message || "Media upload failed.",
    });
  }
}

handler.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = handler;
