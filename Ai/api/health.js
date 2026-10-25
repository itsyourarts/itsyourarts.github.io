const {
  SEEDANCE_MODELS,
  getApiKey,
  setCors,
  sendJson,
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

  return sendJson(res, 200, {
    ok: true,
    service: "shadowxai-seedance-api",
    configured: Boolean(getApiKey()),
    models: Object.values(SEEDANCE_MODELS),
  });
};
