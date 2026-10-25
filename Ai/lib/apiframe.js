/**
 * Seedance (Apiframe v2) Server Library
 * Docs: https://huggingface.co/AI-APIs/Seedance-API
 * Upstream REST API: https://api.apiframe.ai/v2
 */

const fs = require("fs");
const path = require("path");

const APIFRAME_BASE_URL = (
  process.env.APIFRAME_BASE_URL || "https://api.apiframe.ai/v2"
).replace(/\/+$/, "");

/* Load local .env automatically when running via `node server.js` */
(function loadDotEnv() {
  const candidates = [
    path.join(__dirname, "..", ".env"),
    path.join(process.cwd(), ".env"),
  ];
  for (const envPath of candidates) {
    try {
      if (!fs.existsSync(envPath)) continue;
      const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
      for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key && process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
      break;
    } catch (_) {
      /* ignore .env read errors */
    }
  }
})();

const SEEDANCE_MODELS = {
  "seedance-2.5": {
    id: "seedance-2.5",
    label: "Seedance 2.5",
    minDuration: 4,
    maxDuration: 30,
    resolutions: ["480p", "720p"],
    maxRefImages: 30,
    maxRefVideos: 10,
    maxRefAudio: 10,
    supportsCameraFixed: false,
    supportsWebSearch: false,
    endRequiresStart: true,
  },
  "seedance-2": {
    id: "seedance-2",
    label: "Seedance 2.0",
    minDuration: 4,
    maxDuration: 15,
    resolutions: ["480p", "720p", "1080p", "4k"],
    maxRefImages: 9,
    maxRefVideos: 3,
    maxRefAudio: 3,
    supportsCameraFixed: true,
    supportsWebSearch: true,
    endRequiresStart: false,
  },
  "seedance-2-fast": {
    id: "seedance-2-fast",
    label: "Seedance 2.0 Fast",
    minDuration: 4,
    maxDuration: 15,
    resolutions: ["480p", "720p"],
    maxRefImages: 9,
    maxRefVideos: 3,
    maxRefAudio: 3,
    supportsCameraFixed: true,
    supportsWebSearch: true,
    endRequiresStart: false,
  },
  "seedance-2-mini": {
    id: "seedance-2-mini",
    label: "Seedance 2.0 Mini",
    minDuration: 4,
    maxDuration: 15,
    resolutions: ["480p", "720p"],
    maxRefImages: 9,
    maxRefVideos: 3,
    maxRefAudio: 3,
    supportsCameraFixed: true,
    supportsWebSearch: true,
    endRequiresStart: false,
  },
};

const ALLOWED_ASPECT_RATIOS = new Set([
  "21:9",
  "16:9",
  "4:3",
  "1:1",
  "3:4",
  "9:16",
  "adaptive",
]);

function getApiKey() {
  const key = (
    process.env.APIFRAME_API_KEY ||
    process.env.SEEDANCE_API_KEY ||
    ""
  ).trim();
  return key || null;
}

function setCors(req, res) {
  const allowedRaw = (process.env.ALLOWED_ORIGINS || "*").trim();
  const origin = req.headers?.origin || "";

  if (allowedRaw === "*") {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    const allowedList = allowedRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (origin && allowedList.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    } else if (allowedList.length > 0) {
      res.setHeader("Access-Control-Allow-Origin", allowedList[0]);
    }
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, X-File-Name, X-Mime-Type"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

async function readJsonBody(req, maxBytes = 4 * 1024 * 1024) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }
  if (Buffer.isBuffer(req.body)) {
    return JSON.parse(req.body.toString("utf8") || "{}");
  }
  const buf = await readRawBuffer(req, maxBytes);
  const text = buf.toString("utf8").trim();
  if (!text) return {};
  return JSON.parse(text);
}

async function readRawBuffer(req, maxBytes = 52 * 1024 * 1024) {
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxBytes) {
      throw Object.assign(new Error("Uploaded file exceeds size limit."), {
        statusCode: 413,
      });
    }
    return req.body;
  }
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > maxBytes) {
      throw Object.assign(new Error("Uploaded file exceeds size limit."), {
        statusCode: 413,
      });
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function cleanMediaUrl(u) {
  if (typeof u !== "string") return "";
  const trimmed = u.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("asset://")
  ) {
    return trimmed;
  }
  throw Object.assign(
    new Error(
      `Invalid media URL "${trimmed.slice(0, 48)}". Must start with https:// or asset://.`
    ),
    { statusCode: 400 }
  );
}

function cleanUrlArray(arr, maxCount, fieldName) {
  if (!arr) return [];
  const list = Array.isArray(arr) ? arr : [arr];
  const cleaned = list.map(cleanMediaUrl).filter(Boolean);
  if (cleaned.length > maxCount) {
    throw Object.assign(
      new Error(`${fieldName} supports at most ${maxCount} items for this model.`),
      { statusCode: 400 }
    );
  }
  return cleaned;
}

function buildSeedancePayload(body) {
  const modelId = String(body?.model || "seedance-2.5").trim();
  const spec = SEEDANCE_MODELS[modelId];
  if (!spec) {
    throw Object.assign(
      new Error(
        `Unsupported Seedance model "${modelId}". Allowed: ${Object.keys(SEEDANCE_MODELS).join(", ")}`
      ),
      { statusCode: 400 }
    );
  }

  const prompt = String(body?.prompt || "").trim();
  if (!prompt) {
    throw Object.assign(new Error("Video prompt is required."), {
      statusCode: 400,
    });
  }
  if (prompt.length > 4000) {
    throw Object.assign(
      new Error("Prompt is too long (maximum 4,000 characters)."),
      { statusCode: 400 }
    );
  }

  const rawParams =
    body?.seedanceParams && typeof body.seedanceParams === "object"
      ? body.seedanceParams
      : body || {};

  let duration = parseInt(rawParams.duration ?? 8, 10);
  if (Number.isNaN(duration)) duration = 8;
  duration = Math.max(spec.minDuration, Math.min(spec.maxDuration, duration));

  let resolution = String(rawParams.resolution || "720p").trim();
  if (!spec.resolutions.includes(resolution)) {
    resolution = "720p";
  }

  let aspectRatio = String(rawParams.aspect_ratio || "16:9").trim();
  if (!ALLOWED_ASPECT_RATIOS.has(aspectRatio)) {
    aspectRatio = "16:9";
  }

  const generateAudio =
    rawParams.generate_audio === undefined
      ? true
      : Boolean(rawParams.generate_audio);

  const seedanceParams = {
    duration,
    resolution,
    aspect_ratio: aspectRatio,
    generate_audio: generateAudio,
  };

  if (rawParams.return_last_frame !== undefined) {
    seedanceParams.return_last_frame = Boolean(rawParams.return_last_frame);
  }

  if (
    rawParams.seed !== undefined &&
    rawParams.seed !== null &&
    String(rawParams.seed).trim() !== ""
  ) {
    const parsedSeed = parseInt(rawParams.seed, 10);
    if (!Number.isNaN(parsedSeed) && parsedSeed >= 0) {
      seedanceParams.seed = parsedSeed;
    }
  }

  if (spec.supportsCameraFixed && rawParams.camera_fixed !== undefined) {
    seedanceParams.camera_fixed = Boolean(rawParams.camera_fixed);
  }
  if (spec.supportsWebSearch && rawParams.web_search !== undefined) {
    seedanceParams.web_search = Boolean(rawParams.web_search);
  }

  const startImage = cleanMediaUrl(rawParams.start_image || "");
  const endImage = cleanMediaUrl(rawParams.end_image || "");

  const refImages = cleanUrlArray(
    rawParams.reference_image_urls,
    spec.maxRefImages,
    "reference_image_urls"
  );
  const refVideos = cleanUrlArray(
    rawParams.reference_video_urls,
    spec.maxRefVideos,
    "reference_video_urls"
  );
  const refAudio = cleanUrlArray(
    rawParams.reference_audio_urls,
    spec.maxRefAudio,
    "reference_audio_urls"
  );

  const hasFrameAnchors = Boolean(startImage || endImage);
  const hasReferences = Boolean(
    refImages.length || refVideos.length || refAudio.length
  );

  if (hasFrameAnchors && hasReferences) {
    throw Object.assign(
      new Error(
        "Start/End frame images and Reference media cannot be used in the same request (Apiframe Seedance rule)."
      ),
      { statusCode: 400 }
    );
  }

  if (endImage && !startImage && spec.endRequiresStart) {
    throw Object.assign(
      new Error("Seedance 2.5 requires a Start Image when End Image is set."),
      { statusCode: 400 }
    );
  }

  if (startImage) seedanceParams.start_image = startImage;
  if (endImage) seedanceParams.end_image = endImage;
  if (refImages.length) seedanceParams.reference_image_urls = refImages;
  if (refVideos.length) seedanceParams.reference_video_urls = refVideos;
  if (refAudio.length) seedanceParams.reference_audio_urls = refAudio;

  return {
    model: spec.id,
    prompt,
    seedanceParams,
  };
}

async function parseUpstreamResponse(resp) {
  const raw = await resp.text();
  let json = null;
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch (_) {
    json = null;
  }

  if (!resp.ok) {
    const errMsg =
      json?.error ||
      json?.message ||
      (Array.isArray(json?.errors) ? json.errors.join("; ") : "") ||
      `Apiframe API returned HTTP ${resp.status}`;
    throw Object.assign(new Error(String(errMsg)), {
      statusCode: resp.status >= 400 && resp.status < 600 ? resp.status : 502,
    });
  }

  return json || {};
}

function requireApiKey() {
  const key = getApiKey();
  if (!key) {
    throw Object.assign(
      new Error(
        "Server env APIFRAME_API_KEY is not configured yet. Add APIFRAME_API_KEY in Vercel Environment Variables (or Ai/.env)."
      ),
      { statusCode: 503 }
    );
  }
  return key;
}

async function submitVideoJob(body) {
  const apiKey = requireApiKey();
  const payload = buildSeedancePayload(body);

  const resp = await fetch(`${APIFRAME_BASE_URL}/videos/generate`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseUpstreamResponse(resp);
  const jobId = data.jobId || data.id;
  if (!jobId) {
    throw Object.assign(
      new Error("Apiframe did not return a jobId."),
      { statusCode: 502 }
    );
  }

  return {
    ok: true,
    jobId,
    status: data.status || "QUEUED",
    model: payload.model,
    submittedParams: payload.seedanceParams,
  };
}

async function submitImageJob(body) {
  const apiKey = requireApiKey();
  const prompt = String(body?.prompt || "").trim();
  if (!prompt) {
    throw Object.assign(new Error("Image prompt is required."), {
      statusCode: 400,
    });
  }

  const aspectRatio = String(body?.aspect_ratio || "1:1").trim();
  const size = ["1K", "2K", "4K"].includes(body?.size) ? body.size : "2K";
  const imageInput = cleanUrlArray(body?.image_input, 10, "image_input");

  const seedreamParams = {
    size,
    aspect_ratio: imageInput.length ? aspectRatio || "match_input_image" : aspectRatio,
    enhance_prompt: true,
  };
  if (imageInput.length) {
    seedreamParams.image_input = imageInput;
  }

  const resp = await fetch(`${APIFRAME_BASE_URL}/images/generate`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: "seedream-4",
      prompt: prompt.slice(0, 2000),
      seedreamParams,
    }),
  });

  const data = await parseUpstreamResponse(resp);
  return {
    ok: true,
    jobId: data.jobId || data.id,
    status: data.status || "QUEUED",
    model: "seedream-4",
  };
}

async function getJobStatus(jobId) {
  const apiKey = requireApiKey();
  const cleanId = String(jobId || "").trim();
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(cleanId)) {
    throw Object.assign(new Error("Invalid or missing job ID."), {
      statusCode: 400,
    });
  }

  const resp = await fetch(
    `${APIFRAME_BASE_URL}/jobs/${encodeURIComponent(cleanId)}`,
    {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    }
  );

  const job = await parseUpstreamResponse(resp);
  const result = job.result || {};

  const videoUrl =
    result.videoUrl ||
    result.video_url ||
    job.videoUrl ||
    (Array.isArray(result.videos) && result.videos[0]) ||
    null;

  const lastFrameUrl =
    result.lastFrameUrl ||
    result.last_frame_url ||
    result.lastFrame ||
    null;

  const images = Array.isArray(result.images) ? result.images : [];

  return {
    ok: true,
    id: job.id || cleanId,
    status: job.status || "PROCESSING",
    model: job.model || null,
    progress: typeof job.progress === "number" ? job.progress : null,
    videoUrl,
    lastFrameUrl,
    images,
    result: job.result || null,
    error: job.error || null,
    creditCost: job.creditCost ?? null,
    createdAt: job.createdAt || null,
    completedAt: job.completedAt || null,
  };
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(
    /^data:([a-zA-Z0-9.+/-]+);base64,([\s\S]+)$/
  );
  if (!match) {
    throw Object.assign(new Error("Invalid data URL format."), {
      statusCode: 400,
    });
  }
  const contentType = match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  const extMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
  };
  const ext = extMap[contentType] || "bin";
  return { buffer, contentType, ext };
}

async function uploadMediaBuffer(buffer, filename = "upload.bin", contentType = "application/octet-stream") {
  const apiKey = requireApiKey();
  if (!buffer || !buffer.length) {
    throw Object.assign(new Error("Empty file uploaded."), {
      statusCode: 400,
    });
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: contentType });
  form.append("file", blob, filename);

  const resp = await fetch(`${APIFRAME_BASE_URL}/uploads`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
    body: form,
  });

  const data = await parseUpstreamResponse(resp);
  if (!data.url) {
    throw Object.assign(
      new Error("Upload succeeded but Apiframe returned no CDN URL."),
      { statusCode: 502 }
    );
  }

  return {
    ok: true,
    id: data.id || null,
    url: data.url,
    kind: data.kind || null,
    contentType: data.contentType || contentType,
    byteSize: data.byteSize || buffer.length,
    expiresAt: data.expiresAt || null,
  };
}

function isAllowedApiframeCdn(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    return (
      parsed.hostname === "apiframe.ai" ||
      parsed.hostname.endsWith(".apiframe.ai")
    );
  } catch (_) {
    return false;
  }
}

module.exports = {
  APIFRAME_BASE_URL,
  SEEDANCE_MODELS,
  getApiKey,
  setCors,
  sendJson,
  readJsonBody,
  readRawBuffer,
  buildSeedancePayload,
  submitVideoJob,
  submitImageJob,
  getJobStatus,
  parseDataUrl,
  uploadMediaBuffer,
  isAllowedApiframeCdn,
};
