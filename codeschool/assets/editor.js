/* ============================================================
   GodxShadow — Live Editor engine
   tabs · line numbers · auto-run · console capture · download
   ============================================================ */

const CH = "gxs-" + Math.random().toString(36).slice(2);
const LS_DRAFT = "gxs.draft";

const DEFAULTS = {
  html:
`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GodxShadow</title>
</head>
<body>

  <div class="card">
    <h1>Neon <span id="spark">Editor</span></h1>
    <p>Left side code likho, right side result turant dikhega.</p>
    <button id="btn">Glow chalu karo</button>
  </div>

</body>
</html>`,
  css:
`body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #05060d;
  font-family: sans-serif;
}
.card {
  text-align: center;
  padding: 34px 40px;
  border-radius: 18px;
  background: #0d1020;
  border: 1px solid #22e8ff;
  box-shadow: 0 0 30px rgba(34,232,255,.35);
}
h1 { color: #22e8ff; text-shadow: 0 0 16px #22e8ff; }
#spark { color: #ff3ea5; text-shadow: 0 0 16px #ff3ea5; }
p { color: #8f9ac4; }
button {
  margin-top: 10px;
  padding: 11px 22px;
  border: 0;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  color: #04121a;
  background: linear-gradient(90deg,#22e8ff,#ff3ea5);
}`,
  js:
`const btn = document.getElementById("btn");
let on = false;

btn.addEventListener("click", () => {
  on = !on;
  document.body.style.background = on ? "#12041f" : "#05060d";
  btn.textContent = on ? "Glow band karo" : "Glow chalu karo";
  console.log("Glow state:", on);
});

console.log("GodxShadow editor ready ⚡");`
};

/* ---------------- state ---------------- */
let state = { html: DEFAULTS.html, css: DEFAULTS.css, js: DEFAULTS.js };
try {
  const saved = JSON.parse(localStorage.getItem(LS_DRAFT) || "null");
  if (saved && typeof saved === "object") {
    state.html = saved.html || "";
    state.css = saved.css || "";
    state.js = saved.js || "";
    if (!state.html && !state.css && !state.js) state = { ...DEFAULTS };
  }
} catch {}

let currentTab = "html";
let autoRun = true;
let debounceTimer = null;

/* ---------------- dom refs ---------------- */
const $ = s => document.querySelector(s);
const areas = {
  html: $("#ed-html"),
  css: $("#ed-css"),
  js: $("#ed-js")
};
const nums = {
  html: $("#ln-html"),
  css: $("#ln-css"),
  js: $("#ln-js")
};
const wraps = {
  html: $("#wrap-html"),
  css: $("#wrap-css"),
  js: $("#wrap-js")
};
const preview = $("#preview");
const conBody = $("#consoleBody");
const statusEl = $("#status");

/* ---------------- bridge injected into preview ---------------- */
function bridge() {
  const CH = "__CH__";
  const send = (type, args) => {
    try {
      parent.postMessage({
        __gxs: true,
        channel: CH,
        type: type,
        args: Array.prototype.slice.call(args || []).map(fmt)
      }, "*");
    } catch (e) {}
  };
  function fmt(v) {
    try {
      if (v === null) return "null";
      if (v === undefined) return "undefined";
      if (typeof v === "string") return v;
      if (typeof v === "function") return "ƒ " + (v.name || "anonymous") + "()";
      if (v instanceof Error) return v.name + ": " + v.message;
      if (typeof v === "object") return JSON.stringify(v, null, 2);
      return String(v);
    } catch (e) { return String(v); }
  }
  ["log", "info", "warn", "error"].forEach(k => {
    const orig = console[k] ? console[k].bind(console) : function () {};
    console[k] = function () { send(k, arguments); orig.apply(null, arguments); };
  });
  window.addEventListener("error", e => send("error", [e.message + " (line " + (e.lineno || "?") + ")"]));
  window.addEventListener("unhandledrejection", e => send("error", ["Unhandled rejection: " + e.reason]));
  document.addEventListener("DOMContentLoaded", () => send("info", ["page loaded"]));
  send("info", ["preview ready"]);
}

/* ---------------- build + run ---------------- */
function buildDoc() {
  const html = state.html;
  const styleBlock = state.css.trim() ? "<style>\n" + state.css + "\n</style>" : "";
  const scriptBlock = state.js.trim() ? "<script>\n" + state.js + "\n<\/script>" : "";
  const bridgeSrc = "<script>(" + bridge.toString().replace(/__CH__/, CH) + ")();<\/script>";

  const headClose = html.search(/<\/head>/i);
  const bodyClose = html.search(/<\/body>/i);
  const bodyOpen = html.search(/<body[^>]*>/i);

  // 1) full document: styles in head, user script at end of body
  if (headClose > -1 && bodyClose > -1 && bodyClose > headClose) {
    let out = html.slice(0, headClose) + styleBlock + bridgeSrc + html.slice(headClose);
    const bc = out.search(/<\/body>/i);
    return out.slice(0, bc) + scriptBlock + out.slice(bc);
  }
  // 2) head only (no closing body): append script after body tag if any
  if (headClose > -1) {
    let out = html.slice(0, headClose) + styleBlock + bridgeSrc + html.slice(headClose);
    const bo = out.search(/<body[^>]*>/i);
    if (bo > -1) {
      const at = bo + out.slice(bo).indexOf(">") + 1;
      return out.slice(0, at) + scriptBlock + out.slice(at);
    }
    return out + scriptBlock;
  }
  // 3) no head: inject right after <body ...> if present
  if (bodyOpen > -1) {
    const at = bodyOpen + html.slice(bodyOpen).indexOf(">") + 1;
    return html.slice(0, at) + styleBlock + bridgeSrc + html.slice(at) + scriptBlock;
  }
  // 4) bare fragment — wrap it
  return "<!DOCTYPE html><html><head><meta charset='utf-8'>" + styleBlock + bridgeSrc +
         "</head><body>" + html + scriptBlock + "</body></html>";
}

let lastBlob = null;
function run() {
  const t0 = performance.now();
  const doc = buildDoc();
  const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  preview.src = url;
  if (lastBlob) setTimeout(() => URL.revokeObjectURL(lastBlob), 4000);
  lastBlob = url;
  setStatus("Ran in " + Math.round(performance.now() - t0) + " ms", false);
}

function scheduleRun() {
  if (!autoRun) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(run, 650);
}

function setStatus(text, isErr) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle("err", !!isErr);
}

/* ---------------- console panel ---------------- */
function addLog(type, text) {
  const div = document.createElement("div");
  div.className = "clog " + type;
  div.textContent = (type === "error" ? "✖ " : type === "warn" ? "⚠ " : type === "info" ? "ℹ " : "› ") + text;
  conBody.appendChild(div);
  while (conBody.children.length > 300) conBody.removeChild(conBody.firstChild);
  conBody.scrollTop = conBody.scrollHeight;
}

window.addEventListener("message", e => {
  const d = e.data;
  if (!d || d.__gxs !== true || d.channel !== CH) return;
  addLog(d.type, (d.args || []).join(" "));
});

/* ---------------- line numbers ---------------- */
function syncLines(kind) {
  const ta = areas[kind], ln = nums[kind];
  if (!ta || !ln) return;
  const lines = ta.value.split("\n").length;
  let out = "";
  for (let i = 1; i <= lines; i++) out += i + "\n";
  ln.textContent = out;
  ln.scrollTop = ta.scrollTop;
}

/* ---------------- tabs ---------------- */
function showTab(kind) {
  currentTab = kind;
  Object.keys(wraps).forEach(k => wraps[k].classList.toggle("on", k === kind));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.tab === kind));
  syncLines(kind);
}

/* ---------------- editor behaviour ---------------- */
Object.keys(areas).forEach(kind => {
  const ta = areas[kind];
  ta.value = state[kind];
  syncLines(kind);

  ta.addEventListener("input", () => {
    state[kind] = ta.value;
    syncLines(kind);
    saveDraft();
    scheduleRun();
  });
  ta.addEventListener("scroll", () => { nums[kind].scrollTop = ta.scrollTop; });
  ta.addEventListener("keydown", e => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + "  " + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 2;
      ta.dispatchEvent(new Event("input"));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveDraft(true);
    }
    // auto-close brackets / quotes
    const pairs = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" };
    if (pairs[e.key] && ta.selectionStart !== ta.selectionEnd) {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + e.key + ta.value.slice(s, en) + pairs[e.key] + ta.value.slice(en);
      ta.selectionStart = s + 1; ta.selectionEnd = en + 1;
      ta.dispatchEvent(new Event("input"));
    }
  });
});

document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => showTab(t.dataset.tab)));

/* ---------------- draft persistence ---------------- */
let saveFlash = null;
function saveDraft(flash) {
  try { localStorage.setItem(LS_DRAFT, JSON.stringify(state)); } catch {}
  if (flash) {
    setStatus("Saved to browser ✔", false);
    clearTimeout(saveFlash);
    saveFlash = setTimeout(() => setStatus("Auto-run on", false), 1600);
  }
}

/* ---------------- toolbar actions ---------------- */
function on(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); }

on("runBtn", () => { saveDraft(); run(); });

on("clearCon", () => { conBody.innerHTML = ""; });

on("resetBtn", () => {
  if (!confirm("Editor ko default code par reset karein?")) return;
  state = { ...DEFAULTS };
  Object.keys(areas).forEach(k => { areas[k].value = state[k]; syncLines(k); });
  saveDraft(true);
  run();
});

on("formatBtn", () => {
  state[currentTab] = naiveFormat(state[currentTab], currentTab);
  areas[currentTab].value = state[currentTab];
  syncLines(currentTab);
  saveDraft();
  scheduleRun();
  setStatus("Formatted " + currentTab, false);
});

on("copyBtn", async () => {
  try {
    await navigator.clipboard.writeText(fullFile());
    setStatus("Full file copied ✔", false);
    setTimeout(() => setStatus("Auto-run on", false), 1600);
  } catch {
    setStatus("Copy blocked by browser", true);
  }
});

on("downloadBtn", () => {
  const blob = new Blob([fullFile()], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "godxshadow-project.html";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  setStatus("Downloaded ✔", false);
});

on("newTabBtn", () => {
  const w = window.open("", "_blank");
  if (!w) { setStatus("Popup blocked", true); return; }
  w.document.open();
  w.document.write(fullFile());
  w.document.close();
});

on("autoBtn", () => {
  autoRun = !autoRun;
  const b = document.getElementById("autoBtn");
  b.textContent = autoRun ? "Auto-run: ON" : "Auto-run: OFF";
  b.classList.toggle("ghost", !autoRun);
  b.classList.toggle("neon", autoRun);
  setStatus(autoRun ? "Auto-run on" : "Auto-run off — press Run (Ctrl+Enter)", false);
  if (autoRun) run();
});

/* ---------------- helpers ---------------- */
function fullFile() {
  const css = state.css.trim() ? "  <style>\n" + state.css.split("\n").map(l => "  " + l).join("\n") + "\n  </style>\n" : "";
  const js = state.js.trim() ? "  <script>\n" + state.js.split("\n").map(l => "  " + l).join("\n") + "\n  <\/script>\n" : "";
  let html = state.html;
  const metaTag = /<meta[^>]*charset[^>]*>/i.test(html) ? "" : '<meta charset="utf-8">';
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, m => m + metaTag);
  }
  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, css + "</head>");
  } else {
    html = css + html;
  }
  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, js + "</body>");
  } else {
    html = html + js;
  }
  return html;
}

function naiveFormat(code, lang) {
  // lightweight prettifier — indentation only, never touches strings
  let out = "", indent = 0, i = 0;
  const pad = () => "  ".repeat(Math.max(indent, 0));
  if (lang === "js") {
    code = code.replace(/\s*\n\s*/g, "\n");
    code.split("\n").forEach(line => {
      const t = line.trim();
      if (!t) return;
      if (/^[}\])]/.test(t)) indent--;
      out += pad() + t + "\n";
      if (/[{([]$/.test(t) && !/^\/\//.test(t)) indent++;
    });
    return out.trimEnd() + "\n";
  }
  // html / css: split on tags & braces
  const src = code.replace(/>\s*</g, ">\n<").replace(/\s*\{\s*/g, " {\n").replace(/\s*\}\s*/g, "\n}\n");
  src.split("\n").forEach(line => {
    const t = line.trim();
    if (!t) return;
    if (/^<\/|^}/.test(t)) indent--;
    out += pad() + t + "\n";
    const opens = (t.match(/<(?!(\/|!|br|hr|img|input|meta|link|source))/g) || []).length;
    const closes = (t.match(/<\/|\/>/g) || []).length;
    if (/\{$/.test(t)) indent++;
    indent += opens - closes;
  });
  return out.replace(/\n{2,}/g, "\n").trimEnd() + "\n";
}

/* ---------------- pane resizer ---------------- */
(function resizer() {
  const bar = document.getElementById("resizer");
  const panes = document.querySelector(".panes");
  const code = document.querySelector(".pane-code");
  const out = document.querySelector(".pane-out");
  if (!bar || !panes) return;
  let dragging = false;
  bar.addEventListener("mousedown", e => { dragging = true; e.preventDefault(); document.body.style.cursor = "col-resize"; });
  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    const r = panes.getBoundingClientRect();
    let pct = ((e.clientX - r.left) / r.width) * 100;
    pct = Math.min(78, Math.max(22, pct));
    code.style.width = pct + "%";
    out.style.width = (100 - pct) + "%";
  });
  window.addEventListener("mouseup", () => { dragging = false; document.body.style.cursor = ""; });
})();

/* ---------------- keyboard hint / boot ---------------- */
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
});

showTab("html");
addLog("info", "Editor loaded. Ctrl+Enter = Run");
run();
