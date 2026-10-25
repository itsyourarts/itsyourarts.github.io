const {
  setCors,
  sendJson,
  readJsonBody,
  submitImageJob,
} = require("../lib/apiframe");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);
    const result = await submitImageJob(body);
    return sendJson(res, 202, result);
  } catch (err) {
    return sendJson(res, err.statusCode || 500, {
      ok: false,
      error: err.message || "Failed to start image generation.",
    });
  }
};
