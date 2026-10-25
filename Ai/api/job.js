const {
  setCors,
  sendJson,
  getJobStatus,
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
    let jobId = req.query?.id || "";
    if (!jobId && req.url) {
      const u = new URL(req.url, "http://localhost");
      jobId = u.searchParams.get("id") || "";
    }
    const result = await getJobStatus(jobId);
    return sendJson(res, 200, result);
  } catch (err) {
    return sendJson(res, err.statusCode || 500, {
      ok: false,
      error: err.message || "Failed to fetch job status.",
    });
  }
};
