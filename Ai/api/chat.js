/**
 * ShadowxAi + Shadow Web Agent Backend Route (`POST /api/chat`)
 * Uses Groq `openai/gpt-oss-120b` engine via streaming SSE chunk reader:
 *  - Normal chat & coding: instructs model NOT to invoke Selenium tools -> ~0.6s response, unlimited turns!
 *  - Web/URL/Search tasks: invokes browser tools (with 15s cap) + live HTTP/DuckDuckGo fallback summarized by Groq!
 */

const { setCors, sendJson, readJsonBody } = require("../lib/apiframe");

const JULIA_SPACE_URL =
  "https://rootxhacker-julia-browser-agent.hf.space/gradio_api/call/execute_user_task";
const POLLINATIONS_OPENAI_URL = "https://text.pollinations.ai/openai";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function extractTargetUrl(text) {
  const explicit = String(text || "").match(/https?:\/\/[^\s"'<>]+/i);
  if (explicit) return explicit[0].replace(/[.,;!?)]+$/, "");

  const bareDomain = String(text || "").match(
    /\b((?:[a-z0-9-]+\.)+(?:com|org|net|io|in|ai|dev|co|gov|edu|app|me)(?:\/[^\s"'<>]*)?)\b/i
  );
  if (bareDomain) {
    return "https://" + bareDomain[1].replace(/[.,;!?)]+$/, "");
  }
  return null;
}

function isWebAutomationPrompt(text) {
  const s = String(text || "").toLowerCase();
  if (extractTargetUrl(s)) return true;
  return /\b(open website|open site|visit |go to |navigate to|list elements|scrape |search google|search web|latest news|live score|current price)\b/i.test(
    s
  );
}

function stripTags(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function cleanJuliaReply(raw, keepSteps = false) {
  let out = String(raw || "").trim();
  if (!keepSteps && !out.includes("🔧 **Executing**")) {
    out = out.replace(/^🤖\s*\*\*AI\*\*:\s*/i, "").trim();
  }
  return out;
}

async function callJuliaStream(instructionText, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const startResp = await fetch(JULIA_SPACE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({ data: [instructionText, []] }),
    });
    if (!startResp.ok) {
      throw new Error(`Julia Space HTTP ${startResp.status}`);
    }
    const { event_id: eventId } = await startResp.json();
    if (!eventId) {
      throw new Error("No event_id from Julia Space");
    }

    const streamResp = await fetch(`${JULIA_SPACE_URL}/${eventId}`, {
      headers: { Accept: "text/event-stream" },
      signal: ctrl.signal,
    });
    if (!streamResp.ok || !streamResp.body) {
      throw new Error(`Julia stream HTTP ${streamResp.status}`);
    }

    const reader = streamResp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      if (buffer.includes("event: error")) {
        try { await reader.cancel(); } catch (_) {}
        throw new Error("Julia Space upstream error");
      }

      const match = buffer.match(/event:\s*complete\s*data:\s*([^\n]+)/);
      if (match) {
        try { await reader.cancel(); } catch (_) {}
        const parsed = JSON.parse(match[1].trim());
        const history = parsed?.[0];
        if (Array.isArray(history) && history.length > 0) {
          const last = history[history.length - 1];
          if (Array.isArray(last) && last[1]) {
            return String(last[1]);
          }
        }
        throw new Error("Empty completion from Julia Space");
      }
    }
    throw new Error("Stream ended before completion");
  } finally {
    clearTimeout(timer);
  }
}

async function inspectLiveWebpage(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: ctrl.signal,
    });
    const html = await resp.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? stripTags(titleMatch[1]) : url;

    const elements = [];
    let idCounter = 1;

    const linkRe = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = linkRe.exec(html)) !== null && elements.length < 18) {
      const label = stripTags(m[2]).slice(0, 70);
      if (label) {
        elements.push(`[${idCounter++}] link: "${label}" -> ${m[1].slice(0, 90)}`);
      }
    }

    const btnRe = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
    while ((m = btnRe.exec(html)) !== null && elements.length < 26) {
      const label = stripTags(m[1]).slice(0, 60);
      if (label) elements.push(`[${idCounter++}] button: "${label}"`);
    }

    const inputRe = /<input\b([^>]*)>/gi;
    while ((m = inputRe.exec(html)) !== null && elements.length < 32) {
      const attrs = m[1];
      const typeM = attrs.match(/type=["']([^"']+)["']/i);
      const nameM =
        attrs.match(/placeholder=["']([^"']+)["']/i) ||
        attrs.match(/name=["']([^"']+)["']/i);
      const t = typeM ? typeM[1] : "text";
      if (t !== "hidden") {
        elements.push(`[${idCounter++}] input(${t}): ${nameM ? nameM[1] : "field"}`);
      }
    }

    return {
      ok: true,
      finalUrl: resp.url || url,
      status: resp.status,
      title,
      elements,
      bodyText: stripTags(html).slice(0, 3200),
    };
  } catch (err) {
    return { ok: false, url, error: err.message || "Could not open URL" };
  } finally {
    clearTimeout(timer);
  }
}

async function searchDuckDuckGo(query, timeoutMs = 7000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const searchUrl =
      "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    const resp = await fetch(searchUrl, {
      headers: { "User-Agent": BROWSER_UA },
      signal: ctrl.signal,
    });
    const html = await resp.text();
    const snippets = [];
    const resultRe =
      /<a[^>]*class=["'][^"']*result__a[^"']*["'][^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class=["'][^"']*result__snippet[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = resultRe.exec(html)) !== null && snippets.length < 6) {
      snippets.push(`- ${stripTags(m[1])}: ${stripTags(m[2])}`);
    }
    return snippets.join("\n");
  } catch (_) {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

async function callVisionOrBackupLLM(userText, imageDataUrl, history, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const messages = [
      {
        role: "system",
        content: "You are ShadowxAi assistant (powered by Shadow Web Agent). Answer clearly and concisely.",
      },
    ];
    for (const m of history) {
      if (m && (m.role === "user" || m.role === "assistant") && m.content) {
        messages.push({ role: m.role, content: String(m.content) });
      }
    }
    if (imageDataUrl) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userText },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      });
    } else {
      messages.push({ role: "user", content: userText });
    }

    const resp = await fetch(POLLINATIONS_OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({ model: "openai", messages }),
    });
    if (!resp.ok) throw new Error(`Backup LLM HTTP ${resp.status}`);
    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Empty backup LLM reply");
    return String(reply).trim();
  } finally {
    clearTimeout(timer);
  }
}

function buildDirectChatInstruction(prompt, history, extraContext = "") {
  const histLines = history
    .slice(-8)
    .filter((m) => m && m.role && m.content)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${String(m.content).slice(0, 600)}`)
    .join("\n");

  return [
    "CRITICAL RULE: Do NOT call any browser tools or functions (do NOT call open_website, list_elements, click_element, get_page_info, scroll_down, or search_page). Reply directly in text only as ShadowxAi (powered by Shadow Web Agent). If asked your name or identity, say you are ShadowxAi.",
    histLines ? `\nRecent conversation:\n${histLines}` : "",
    extraContext ? `\nLive Web Data already fetched for you:\n${extraContext}` : "",
    `\nUser message:\n${prompt}`,
    "\nRespond helpfully, naturally, and in the same language/style as the user (if code is requested, wrap it in markdown triple backticks).",
  ]
    .filter(Boolean)
    .join("\n");
}

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
    const prompt = String(body?.prompt || "").trim();
    const engine = String(body?.engine || "agent").trim();
    const imageDataUrl = body?.image || null;
    const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];

    if (!prompt && !imageDataUrl) {
      return sendJson(res, 400, { ok: false, error: "Prompt is required." });
    }

    /* Case 1: Image Vision request */
    if (imageDataUrl) {
      try {
        const visionReply = await callVisionOrBackupLLM(
          prompt || "Analyze this image in detail.",
          imageDataUrl,
          history,
          16000
        );
        return sendJson(res, 200, { ok: true, source: "vision", reply: visionReply });
      } catch (_) {
        const fallbackInstruction = buildDirectChatInstruction(
          `${prompt || "User uploaded an image."} (Note: Vision endpoint is rate-limited right now; answer their text question helpfully and mention they can also click "🎬 Animate this Image in Seedance" for Image-to-Video!)`,
          history
        );
        const raw = await callJuliaStream(fallbackInstruction, 18000);
        return sendJson(res, 200, {
          ok: true,
          source: "julia-direct",
          reply: cleanJuliaReply(raw),
        });
      }
    }

    const wantsWeb = engine === "agent" && isWebAutomationPrompt(prompt);

    /* Case 2: Real Web / URL / Search Automation */
    if (wantsWeb) {
      const targetUrl = extractTargetUrl(prompt);
      const [juliaResult, liveSite, ddgResults] = await Promise.all([
        callJuliaStream(prompt, 14000).catch(() => null),
        targetUrl ? inspectLiveWebpage(targetUrl, 8000) : Promise.resolve(null),
        !targetUrl ? searchDuckDuckGo(prompt, 7000) : Promise.resolve(""),
      ]);

      if (
        juliaResult &&
        !juliaResult.startsWith("❌ **Error**") &&
        !juliaResult.includes("Error listing elements: 'total_clickable'")
      ) {
        return sendJson(res, 200, {
          ok: true,
          source: "julia-browser-agent",
          reply: cleanJuliaReply(juliaResult, true),
        });
      }

      let liveContext = "";
      if (liveSite && liveSite.ok) {
        liveContext = [
          `Opened URL: ${liveSite.finalUrl} (HTTP ${liveSite.status})`,
          `Page Title: ${liveSite.title}`,
          `Interactive Elements (${liveSite.elements.length}):`,
          liveSite.elements.join("\n") || "None",
          `Page Content Preview:\n${liveSite.bodyText}`,
        ].join("\n");
      } else if (ddgResults) {
        liveContext = `DuckDuckGo Live Search Results:\n${ddgResults}`;
      }

      const synthInstruction = buildDirectChatInstruction(
        `Present the web automation execution clearly (e.g. 🔧 Executed, ✅ Live Findings, and final answer) for: ${prompt}`,
        history,
        liveContext
      );
      const synthesized = await callJuliaStream(synthInstruction, 18000);
      return sendJson(res, 200, {
        ok: true,
        source: "julia-turbo-web",
        reply: cleanJuliaReply(synthesized),
      });
    }

    /* Case 3: Normal Chat, Coding, Math, Q&A (Fast ~0.6s Groq gpt-oss-120b via Julia no-tools!) */
    const directInstruction = buildDirectChatInstruction(prompt, history);
    try {
      const rawReply = await callJuliaStream(directInstruction, 18000);
      if (rawReply.startsWith("❌ **Error**")) {
        throw new Error(rawReply);
      }
      return sendJson(res, 200, {
        ok: true,
        source: "julia-groq-fast",
        reply: cleanJuliaReply(rawReply),
      });
    } catch (firstErr) {
      /* Retry once after 600ms, then try backup LLM */
      await new Promise((r) => setTimeout(r, 600));
      try {
        const retryReply = await callJuliaStream(directInstruction, 18000);
        return sendJson(res, 200, {
          ok: true,
          source: "julia-groq-retry",
          reply: cleanJuliaReply(retryReply),
        });
      } catch (_) {
        const backup = await callVisionOrBackupLLM(prompt, null, history, 15000);
        return sendJson(res, 200, { ok: true, source: "backup-llm", reply: backup });
      }
    }
  } catch (err) {
    return sendJson(res, 502, {
      ok: false,
      error: err.message || "Chat engine temporarily unavailable.",
    });
  }
};
