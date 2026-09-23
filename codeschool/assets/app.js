/* ============================================================
   GodxShadow — app shell: nav, sidebar, router, highlighter, search
   ============================================================ */

const PROGRESS_KEY = "gxs.progress.v1";

/* ---------------- progress (localStorage) ---------------- */
const Progress = {
  read() { try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); } catch { return {}; } },
  write(p) { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {} },
  isDone(cs, id) { return !!this.read()[cs + "::" + id]; },
  toggle(cs, id) {
    const p = this.read(), k = cs + "::" + id;
    p[k] ? delete p[k] : p[k] = 1;
    this.write(p);
    return !!p[k];
  },
  count() { return Object.keys(this.read()).length; },
  total() { return allLessons().length; }
};

/* ---------------- tiny syntax highlighter ---------------- */
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function wrap(cls, text) { return '<span class="' + cls + '">' + esc(text) + "</span>"; }
/* rw = wrap already-escaped text (used inside highlight, pieces come from escaped source) */
function rw(cls, text) { return '<span class="' + cls + '">' + text + "</span>"; }

function highlight(code, lang) {
  const safe = esc(String(code));

  if (lang === "html" || lang === "xml") {
    const re = /(&lt;!--[\s\S]*?--&gt;)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(&lt;\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:@.\-[\]]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"']+))?)*)|(&gt;)/g;
    return safe.replace(re, (m, com, str, open, tag, attrs, close) => {
      if (com) return rw("tk-com", com);
      if (str) return rw("tk-str", str);
      if (open && tag) {
        let out = rw("tk-pun", open) + rw("tk-tag", tag);
        if (attrs) {
          out += attrs.replace(/([\w:@.\-[\]]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"']+)?/g, (mm, a, eq, v) =>
            rw("tk-attr", a) + (eq ? rw("tk-pun", eq) + (v ? rw("tk-str", v) : "") : ""));
        }
        return out;
      }
      if (close) return rw("tk-pun", close);
      return m;
    });
  }

  if (lang === "css") {
    return safe.replace(/(\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@[\w-]+)|(--[\w-]+)|([.#][\w-]+(?=[^{}]*\{)|\b(?:html|body|div|span|p|a|ul|li|h[1-6]|table|button|input|section|header|footer|main|nav|pre|code|img)\b(?=[^{}]*\{))|([\w-]+)(?=\s*:)|(-?\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr|pt)?)/g,
      (m, com, str, at, varr, sel, prop, num) => {
        if (com) return rw("tk-com", com);
        if (str) return rw("tk-str", str);
        if (at) return rw("tk-key", at);
        if (varr) return rw("tk-var", varr);
        if (sel) return rw("tk-sel", sel);
        if (prop) return rw("tk-prop", prop);
        if (num) return rw("tk-num", num);
        return m;
      });
  }

  if (lang === "js") {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof|in|of|delete|this|super|yield|static|null|undefined|true|false)\b|([A-Za-z_$][\w$]*)(?=\s*\()|(\b\d+\.?\d*\b)/g;
    return safe.replace(re, (m, com, str, kw, fn, num) => {
      if (com) return rw("tk-com", com);
      if (str) return rw("tk-str", str);
      if (kw) return rw("tk-key", kw);
      if (fn) return rw("tk-fn", fn);
      if (num) return rw("tk-num", num);
      return m;
    });
  }

  // generic (sql / python / cpp ...)
  const re = /(--[^\n]*|#[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|INNER|LEFT|RIGHT|OUTER|GROUP|ORDER|BY|HAVING|LIMIT|CREATE|TABLE|DATABASE|USE|SHOW|DESCRIBE|PRIMARY|KEY|NOT|NULL|AND|OR|AS|ON|UNIQUE|DEFAULT|AUTO_INCREMENT|def|import|from|print|return|if|elif|else|for|while|in|lambda|class|include|using|namespace|int|main|cout|endl|vector|string)\b|(\b\d+\.?\d*\b)/g;
  return safe.replace(re, (m, com, str, kw, num) => {
    if (com) return rw("tk-com", com);
    if (str) return rw("tk-str", str);
    if (kw) return rw("tk-key", kw);
    if (num) return rw("tk-num", num);
    return m;
  });
}

/* ---------------- code block renderer ---------------- */
let blockSeq = 0;
function codeBlock(code, lang, title, seedIndex, runnable) {
  blockSeq++;
  const id = "cb" + blockSeq;
  const label = (lang || "code").toUpperCase();
  const act = runnable
    ? '<button class="btn sm neon" data-run="1">Run ▶</button>'
    : '<button class="btn sm neon" data-edit="' + id + '">Try it ▸</button>';
  return (
    '<div class="codewrap" data-seed="' + (seedIndex || 0) + '">' +
      '<div class="codehead"><span class="lang">' + label + "</span>" +
        (title ? '<span class="fn">' + esc(title) + "</span>" : "") +
        '<div class="acts">' +
          '<button class="btn sm ghost" data-copy="' + id + '">Copy</button>' +
          act +
        "</div>" +
      "</div>" +
      '<pre class="code" id="' + id + '"><code>' + highlight(code, lang) + "</code></pre>" +
      '<textarea hidden id="' + id + '-raw">' + esc(code) + "</textarea>" +
    "</div>"
  );
}

/* ---------------- language-aware code runner (Python/C/C#/Java/... lessons) ---------------- */
const LANG_META = {
  python:  { file: "main.py",    label: "Python",     runnable: true },
  c:       { file: "main.c",     label: "C",          runnable: true },
  cpp:     { file: "main.cpp",   label: "C++",        runnable: true },
  csharp:  { file: "main.cs",    label: "C#",         runnable: true },
  java:    { file: "Main.java",  label: "Java",       runnable: true },
  php:     { file: "main.php",   label: "PHP",        runnable: true },
  js:      { file: "main.js",    label: "JavaScript", runnable: true },
  sql:     { file: "query.sql",  label: "SQL",        runnable: true },
  bash:    { file: "main.sh",    label: "Bash",       runnable: true },
  ts:      { file: "main.ts",    label: "TypeScript", runnable: false },
  dart:    { file: "main.dart",  label: "Dart",       runnable: false },
  go:      { file: "main.go",    label: "Go",         runnable: false },
  rust:    { file: "main.rs",    label: "Rust",       runnable: false },
  kotlin:  { file: "Main.kt",    label: "Kotlin",     runnable: false },
  swift:   { file: "main.swift", label: "Swift",      runnable: false }
};

/* Code-runner backend. Empty string = same origin (run server.py locally / on a full-stack host).
   On a static host (GitHub Pages) this page can't execute code by itself — set window.GXS_API
   in assets/config.js to a hosted runner URL, e.g. "https://godxshadow-api.onrender.com". */
var RUN_API = (typeof window !== "undefined" && window.GXS_API) || "";
/* GitHub Pages is static-only: no backend can live there, so say it plainly instead of
   showing a failed network request. Set window.GXS_API (assets/config.js) to fix this. */
var STATIC_HOST = !RUN_API && /\.github\.io$/.test(location.hostname);
var RUN_MISSING_MSG = '<div class="out-dim">This is a static deploy (GitHub Pages) — there is no server here to execute code.</div>' +
  '<div class="out-meta">Run the project locally with <code>python3 server.py</code>, or set <code>window.GXS_API</code> in assets/config.js to a hosted backend. See README → Deploy.</div>';

function runCode(lang, code, outEl, btn) {
  const meta = LANG_META[lang] || { label: lang, runnable: false };
  if (!meta.runnable) {
    outEl.innerHTML = '<span class="out-dim">ℹ️ ' + esc(meta.label) + " compiler is not installed in this preview, so the code is shown for learning. Live-run works here for: Python, C, C++, Java, C#, PHP, JavaScript, SQL and Bash.</span>";
    return;
  }
  btn.disabled = true;
  if (STATIC_HOST) {
    outEl.innerHTML = RUN_MISSING_MSG;
    btn.disabled = false;
    return;
  }
  outEl.innerHTML = '<span class="out-dim">running ' + esc(meta.label) + '…</span>';
  fetch(RUN_API + "/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lang: lang, code: code })
  })
    .then(r => { if (!r.ok) throw new Error("HTTP " + r.status + " (no runner at " + (RUN_API || location.origin) + "/run)"); return r.json(); })
    .then(res => {
      let h = "";
      if (res.stdout) h += '<div class="out-std">' + esc(res.stdout) + "</div>";
      if (res.stderr) h += '<div class="out-err">' + esc(res.stderr) + "</div>";
      if (!res.stdout && !res.stderr) h = '<div class="out-dim">(no output)</div>';
      h += '<div class="out-meta">' + (res.ok ? "✓ exit 0" : "✗ exit " + res.exit) + " · " + res.time + " ms</div>";
      outEl.innerHTML = h;
      outEl.scrollTop = outEl.scrollHeight;
    })
    .catch(e => {
      outEl.innerHTML = '<div class="out-err">runner unreachable: ' + esc(String(e && e.message || e)) + "</div>" + RUN_MISSING_MSG;
    })
    .finally(() => { btn.disabled = false; });
}

function mountCodePlayground(host, seed, title) {
  const meta = LANG_META[seed.lang] || { file: "main.txt", label: seed.lang || "code" };
  host.innerHTML =
      '<div class="pgw cpw">' +
        '<div class="pg-bar">' +
          '<span class="pg-dot" style="background:#ff5c7a"></span>' +
          '<span class="pg-dot" style="background:#ffc857"></span>' +
          '<span class="pg-dot" style="background:#38f2a5"></span>' +
          '<span class="pg-title">' + esc(title || "") + " — " + esc(meta.label) + " runner</span>" +
          '<span style="flex:1"></span>' +
          '<button class="btn sm neon cp-run">▶ Run ' + esc(meta.label) + "</button>" +
        "</div>" +
        '<div class="pg-body">' +
          '<div class="pg-left cp-left">' +
            '<div class="pg-tabs"><button class="pg-tab active">' + esc(meta.label) + '</button><span class="fn" style="margin-left:8px">' + esc(meta.file) + "</span></div>" +
            '<textarea class="pg-ed cp-code" spellcheck="false" aria-label="' + esc(meta.label) + ' code editor"></textarea>' +
          "</div>" +
          '<div class="pg-right cp-right">' +
            '<div class="pg-out-bar"><span>console output — runs on the server</span><span style="flex:1"></span><span class="pg-status"></span></div>' +
            '<pre class="cp-out" id="cpOut"><span class="out-dim">Press ▶ Run to execute the code…</span></pre>' +
          "</div>" +
        "</div>" +
      "</div>";
  const ed = host.querySelector(".cp-code");
  const out = host.querySelector("#cpOut");
  const btn = host.querySelector(".cp-run");
  ed.value = seed.code || "";
  const doRun = () => runCode(seed.lang, ed.value, out, btn);
  btn.addEventListener("click", doRun);
  // auto-run once so the lesson shows real output immediately
  setTimeout(doRun, 250);
  return { textarea: ed, out: out, run: doRun };
}

/* ---------------- extract code from lesson seed ---------------- */
let SEED_BANK = [];
let CODE_PG = null;
function blocksFromLesson(cs, lesson) {
  const s = lesson.seed || {};
  SEED_BANK = [{ html: s.html || "", css: s.css || "", js: s.js || "" }];
  let out = "";
  if (s.code) {
    // language-specific lesson: one editor matching the course language
    const meta = LANG_META[s.lang] || { file: "main.txt", label: s.lang || "code" };
    out = codeBlock(s.code, meta.label, meta.file, 0, meta.runnable);
  } else {
    if (s.html) out += codeBlock(s.html, "html", "index.html", 0);
    if (s.css) out += codeBlock(s.css, "css", "style.css", 0);
    if (s.js) out += codeBlock(s.js, "js", "script.js", 0);
    if (!out) out = codeBlock("<p>No sample for this lesson.</p>", "html", "index.html", 0);
  }
  return out;
}

/* ---------------- sidebar ---------------- */
function buildSidebar(activeCourse, activeLesson) {
  const el = document.getElementById("sidebar");
  if (!el) return;
  let h = '<div class="sb-title">Courses &amp; Tutorials</div>';
  Object.keys(COURSES).forEach(cs => {
    const c = COURSES[cs];
    const open = cs === activeCourse;
    h += '<div class="sb-group' + (open ? " open" : "") + '" data-group="' + cs + '">';
    h += '<button class="sb-course" data-toggle="' + cs + '">' +
         '<span class="dot" style="background:' + c.color + ';color:' + c.color + '"></span>' +
         c.name + '<span class="chev">▶</span></button>';
    h += '<div class="sb-links">';
    c.lessons.forEach(l => {
      const act = open && l.id === activeLesson ? " active" : "";
      const tick = Progress.isDone(cs, l.id) ? '<span class="tick">✔</span>' : "";
      h += '<a class="' + act + '" href="tutorials.html?c=' + cs + "&l=" + l.id + '">' + tick + l.title + "</a>";
    });
    h += "</div></div>";
  });
  h += '<div class="sb-title" style="margin-top:16px">Tools</div>' +
       '<div class="sb-links" style="display:block;border:0;margin:0;padding:0">' +
       '<a href="editor.html">⚡ Live HTML Editor</a>' +
       '<a href="examples.html">▤ Examples Gallery</a>' +
       '<a href="references.html">☰ HTML / CSS Reference</a>' +
       '<a href="quiz.html">✦ Neon Quiz</a>' +
       "</div>";
  el.innerHTML = h;

  el.querySelectorAll("[data-toggle]").forEach(btn => {
    btn.addEventListener("click", () => btn.parentElement.classList.toggle("open"));
  });
}

/* ---------------- header nav ---------------- */
function buildNav(active) {
  const el = document.getElementById("nav");
  if (!el) return;
  const items = [
    ["index.html", "Home", "home"],
    ["tutorials.html", "Tutorials", "tutorials"],
    ["editor.html", "Live Editor", "editor"],
    ["examples.html", "Examples", "examples"],
    ["references.html", "References", "references"],
    ["quiz.html", "Quiz", "quiz"]
  ];
  el.innerHTML = items.map(([href, label, key]) =>
    '<a href="' + href + '" class="' + (key === active ? "active " : "") + (key === "editor" ? "cta" : "") + '">' + label + "</a>"
  ).join("");
}

/* ---------------- global back button (every page) ---------------- */
/* ---------------- in-app history trail (for the Back button) ---------------- */
function gxsTrail() {
  try {
    const raw = sessionStorage.getItem("gxs-trail");
    if (raw) { const t = JSON.parse(raw); if (t && Array.isArray(t.trail) && typeof t.pos === "number") return t; }
  } catch (e) {}
  return { trail: [], pos: 0 };
}
function gxsRecord() {
  const cur = location.pathname + location.search;
  const t = gxsTrail();
  if (t.trail[t.pos - 1] === cur) return t;                    // same page reloaded
  if (t.pos >= 2 && t.trail[t.pos - 2] === cur) t.pos -= 1;    // went back in-app
  else if (t.trail[t.pos] === cur) t.pos += 1;                 // went forward in-app
  else { t.trail = t.trail.slice(0, t.pos).concat([cur]); t.pos = t.trail.length; }
  if (t.trail.length > 60 && t.pos === t.trail.length) { t.trail = t.trail.slice(-60); t.pos = t.trail.length; }
  try { sessionStorage.setItem("gxs-trail", JSON.stringify(t)); } catch (e) {}
  return t;
}

function injectBack() {
  const bar = document.querySelector(".topbar");
  if (!bar || document.getElementById("backBtn")) return;
  gxsRecord(); // remember this page in the in-app trail
  const btn = document.createElement("button");
  btn.id = "backBtn";
  btn.className = "backbtn";
  btn.type = "button";
  btn.textContent = "\u2190 Back";
  btn.title = "Back one step (stays inside the app)";
  btn.addEventListener("click", () => {
    const t = gxsRecord();
    // 1 step back INSIDE the app; if this is the first in-app page, go to Home instead of leaving the app
    if (t.pos > 1) window.history.back();
    else location.href = "index.html";
  });
  const brand = bar.querySelector(".brand");
  if (brand && brand.nextSibling) bar.insertBefore(btn, brand.nextSibling);
  else bar.appendChild(btn);
}

/* ---------------- global search ---------------- */
function buildSearch() {
  const box = document.getElementById("search");
  if (!box) return;
  const input = box.querySelector("input");
  const list = box.querySelector(".results");
  const all = allLessons();

  function close() { if (list) { list.style.display = "none"; list.innerHTML = ""; } }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) return close();
    const hits = all.filter(l =>
      (l.title + " " + l.courseName).toLowerCase().includes(q)
    ).slice(0, 8);
    if (!hits.length) {
      list.innerHTML = '<div class="nores">Kuch nahi mila 😕</div>';
    } else {
      list.innerHTML = hits.map(l =>
        '<a href="tutorials.html?c=' + l.course + "&l=" + l.id + '">' +
        '<span style="color:' + COURSES[l.course].color + '">●</span> ' + l.title +
        '<span class="cs">' + l.courseName + "</span></a>"
      ).join("");
    }
    list.style.display = "block";
  });
  input.addEventListener("blur", () => setTimeout(close, 180));
  input.addEventListener("focus", () => { if (input.value.trim()) input.dispatchEvent(new Event("input")); });

  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== input) { e.preventDefault(); input.focus(); }
    if (e.key === "Escape") close();
  });
}

/* ---------------- course overview (numbered chapter list) ---------------- */
function renderCourseOverview(c, cs) {
  const host = document.getElementById("lessonHost");
  if (!host) return;
  const done = c.lessons.filter(l => Progress.isDone(cs, l.id)).length;
  const pct = Math.round((done / c.lessons.length) * 100);
  const cur = c.lessons.find(l => !Progress.isDone(cs, l.id)) || c.lessons[0];
  const curNo = c.lessons.indexOf(cur) + 1;
  let h = '<div class="lesson coview">';
  h += '<div class="crumb">Tutorials <b>&rsaquo;</b> <a href="tutorials.html?c=' + cs + '">' + esc(c.name) + '</a> <b>&rsaquo;</b> All Chapters</div>';
  h += '<h1>' + esc(c.name) + '</h1>';
  h += '<p class="lead">' + esc(c.blurb) + '</p>';
  h += '<div class="co-stats">';
  h += '<span class="co-chip">' + c.lessons.length + ' chapters</span>';
  h += '<span class="co-chip ok">' + done + ' done</span>';
  h += '<div class="co-prog"><i style="width:' + pct + '%"></i></div>';
  h += '<span class="co-chip">' + pct + '%</span>';
  h += '</div>';
  h += '<div class="co-btns">';
  h += '<a class="btn neon" href="tutorials.html?c=' + cs + '&l=' + cur.id + '">&#9654; ' + (done ? "Continue" : "Start") + ' &mdash; Chapter ' + curNo + '</a>';
  h += '<a class="btn ghost" href="tutorials.html?c=' + cs + '&l=' + c.lessons[0].id + '">Chapter 1</a>';
  h += '</div>';
  h += '<ol class="chaps">';
  c.lessons.forEach((l, i) => {
    const d = Progress.isDone(cs, l.id) ? '<span class="ck" title="completed">&#10004;</span>' : '';
    h += '<li><a href="tutorials.html?c=' + cs + '&l=' + l.id + '"><span class="cn">' + (i + 1) + '</span><span class="ct">' + esc(l.title) + '</span>' + d + '</a></li>';
  });
  h += '</ol></div>';
  host.innerHTML = h;
}

/* ---------------- lesson page ---------------- */
function renderLesson() {
  const host = document.getElementById("lessonHost");
  if (!host) return;
  const params = new URLSearchParams(location.search);
  let cs = params.get("c") || "html";
  let id = params.get("l");
  const course = COURSES[cs];
  if (!course) { cs = "html"; }
  const c = COURSES[cs];
  if (!id || id === "index") { renderCourseOverview(c, cs); return; }
  let idx = c.lessons.findIndex(l => l.id === id);
  if (idx < 0) idx = 0;
  const lesson = c.lessons[idx];

  const done = Progress.isDone(cs, lesson.id);
  const prev = c.lessons[idx - 1];
  const next = c.lessons[idx + 1];
  const courseIdx = Object.keys(COURSES).indexOf(cs);
  const courseKeys = Object.keys(COURSES);
  const prevCourse = courseKeys[courseIdx - 1];
  const nextCourse = courseKeys[courseIdx + 1];

  const blocks = blocksFromLesson(cs, lesson);
  const bodyHtml = lesson.html.replace(/\{\{code:(\w+)\}\}/g, (m, kind) => {
    const seed = SEED_BANK[0] || {};
    const code = seed[kind];
    if (!code) return "";
    const title = kind === "html" ? "index.html" : kind === "css" ? "style.css" : "script.js";
    return codeBlock(code, kind, title, 0);
  });

  host.innerHTML =
    '<div class="lesson">' +
      '<div class="crumb">Tutorials <b>›</b> ' + '<a href="tutorials.html?c=' + cs + '">' + esc(c.name) + '</a> <b>›</b> ' + esc(lesson.title) + "</div>" +
      "<h1>" + esc(lesson.title) + "</h1>" +
      '<p style="color:var(--muted);margin-top:0">' + c.blurb + "</p>" +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 20px">' +
        '<button class="btn sm ' + (done ? "" : "neon") + '" id="markBtn">' + (done ? "✔ Completed" : "Mark as completed") + "</button>" +
        '<button class="btn sm ghost" id="editAll">⚡ Open in Live Editor</button>' +
        '<span class="chip">Progress ' + Progress.count() + " / " + Progress.total() + "</span>" +
      "</div>" +
      bodyHtml +
      '<h2>Try it Yourself</h2>' +
      '<p class="lead">Edit the code on the <b>left</b> — the preview on the <b>right</b> runs live as you type.</p>' +
      '<div id="pgHost"></div>' +
      blocks +
      '<div class="lesson-nav">' +
        (prev
          ? '<a class="btn ghost" href="tutorials.html?c=' + cs + "&l=" + prev.id + '">◀ ' + esc(prev.title) + "</a>"
          : (prevCourse ? '<a class="btn ghost" href="tutorials.html?c=' + prevCourse + '">◀ ' + COURSES[prevCourse].name + "</a>" : "<span></span>")) +
        (next
          ? '<a class="btn neon" href="tutorials.html?c=' + cs + "&l=" + next.id + '">' + esc(next.title) + " ▶</a>"
          : (nextCourse ? '<a class="btn neon" href="tutorials.html?c=' + nextCourse + '">' + COURSES[nextCourse].name + " ▶</a>" : "<span></span>")) +
      "</div>" +
    "</div>";

  document.title = lesson.title + " — GodxShadow";

  // wire buttons
  const mark = document.getElementById("markBtn");
  if (mark) mark.addEventListener("click", () => {
    const now = Progress.toggle(cs, lesson.id);
    mark.textContent = now ? "✔ Completed" : "Mark as completed";
    mark.className = "btn sm " + (now ? "" : "neon");
    buildSidebar(cs, lesson.id);
    const chip = document.querySelector(".chip");
    if (chip) chip.textContent = "Progress " + Progress.count() + " / " + Progress.total();
  });

  const editAll = document.getElementById("editAll");
  if (editAll && !(lesson.seed && lesson.seed.code)) editAll.addEventListener("click", () => {
    const s = lesson.seed || DEFAULT_SEED;
    try { localStorage.setItem("gxs.draft", JSON.stringify({ html: s.html || "", css: s.css || "", js: s.js || "" })); } catch {}
    location.href = "editor.html";
  });
  if (editAll && lesson.seed && lesson.seed.code) editAll.style.display = "none";

  // inline playground — web lessons: editor left / preview right; code lessons: language runner
  const pgHost = document.getElementById("pgHost");
  const lseed = lesson.seed || DEFAULT_SEED;
  if (pgHost && lseed.code) {
    CODE_PG = mountCodePlayground(pgHost, lseed, lesson.title);
  } else if (pgHost && window.GXPlayground) {
    CODE_PG = null;
    GXPlayground.mount(pgHost, lseed, { title: lesson.title });
  }

  // per-block actions
  host.querySelectorAll("[data-copy]").forEach(b => {
    b.addEventListener("click", async () => {
      const raw = document.getElementById(b.dataset.copy + "-raw");
      try { await navigator.clipboard.writeText(raw.value); } catch {}
      b.textContent = "Copied ✔";
      setTimeout(() => (b.textContent = "Copy"), 1400);
    });
  });
  host.querySelectorAll("[data-edit]").forEach(b => {
    b.addEventListener("click", () => {
      const raw = document.getElementById(b.dataset.edit + "-raw");
      const wrapEl = b.closest(".codewrap");
      // start from the FULL lesson seed so CSS/JS context is never lost
      const seed = Object.assign({ html: "", css: "", js: "" }, SEED_BANK[+wrapEl.dataset.seed] || {});
      const head = wrapEl.querySelector(".fn");
      const kind = head ? head.textContent : "";
      if (/css/i.test(kind)) seed.css = raw.value;
      else if (/\.js|script/i.test(kind)) seed.js = raw.value;
      else seed.html = raw.value;
      try { localStorage.setItem("gxs.draft", JSON.stringify(seed)); } catch {}
      location.href = "editor.html";
    });
  });
  host.querySelectorAll("[data-run]").forEach(b => {
    b.addEventListener("click", () => {
      const wrapEl = b.closest(".codewrap");
      const raw = wrapEl ? wrapEl.querySelector("textarea[hidden]") : null;
      if (CODE_PG && raw) {
        CODE_PG.textarea.value = raw.value;
        CODE_PG.run();
        const hostEl = document.getElementById("pgHost");
        if (hostEl) hostEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });

  buildSidebar(cs, lesson.id);
}

/* ---------------- home page ---------------- */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderHome() {
  const grid = document.getElementById("courseGrid");
  if (!grid) return;
  const total = Progress.total();
  const done = Progress.count();
  const pct = total ? Math.round((done / total) * 100) : 0;

  setText("statLessons", total);
  setText("statCourses", Object.keys(COURSES).length);
  const progEl = document.getElementById("homeProg");
  if (progEl) progEl.style.width = pct + "%";
  setText("homeProgTxt", done + " / " + total + " lessons done (" + pct + "%)");

  grid.innerHTML = Object.keys(COURSES).map(cs => {
    const c = COURSES[cs];
    const d = c.lessons.filter(l => Progress.isDone(cs, l.id)).length;
    return (
      '<a class="card" href="tutorials.html?c=' + cs + '" style="display:block">' +
        '<div class="ic" style="color:' + c.color + ';text-shadow:0 0 14px ' + c.color + '">' + c.icon + "</div>" +
        "<h3>" + c.name + "</h3><p>" + c.blurb + "</p>" +
        '<div style="margin-top:12px;display:flex;justify-content:space-between;font-size:.76rem;color:var(--muted)">' +
          "<span>" + c.lessons.length + " lessons</span><span>" + d + "/" + c.lessons.length + " done</span>" +
        "</div>" +
        '<div class="prog" style="margin-top:8px"><i style="width:' + Math.round((d / c.lessons.length) * 100) + '%"></i></div>' +
      "</a>"
    );
  }).join("");
}

/* ---------------- boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const active = page || "home";
  buildNav(active === "tutorial" ? "tutorials" : active);
  injectBack();
  buildSearch();

  const params = new URLSearchParams(location.search);
  if (page === "tutorial") renderLesson();
  else if (page === "tutorials-index") {
    const cs = params.get("c") || "html";
    buildSidebar(COURSES[cs] ? cs : "html", null);
  }
  if (page === "home") { buildSidebar(null, null); renderHome(); }
  if (page === "examples" || page === "references" || page === "quiz") buildSidebar(null, null);

  const burger = document.getElementById("burger");
  const sb = document.getElementById("sidebar");
  if (burger && sb) burger.addEventListener("click", () => sb.classList.toggle("show"));

  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
});
