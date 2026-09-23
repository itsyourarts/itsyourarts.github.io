/* GodxShadow — end-to-end checks in a real Chromium browser */
const { chromium } = require("playwright");

const BASE = process.env.BASE || "http://127.0.0.1:8000";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log("  PASS  " + name + (extra ? "  [" + extra + "]" : "")); }
  else { fail++; console.log("  FAIL  " + name + (extra ? "  [" + extra + "]" : "")); }
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console.error: " + m.text()); });

  /* ---------- 1. HOME ---------- */
  console.log("\n[1] index.html");
  await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  ok("title", (await page.title()).includes("GodxShadow"), await page.title());
  const navCount = await page.locator("#nav a").count();
  ok("nav built (6 links)", navCount === 6, "got " + navCount);
  const cards = await page.locator("#courseGrid .card").count();
  ok("course cards rendered", cards >= 8, "got " + cards);
  ok("lesson stat is a number > 0", Number(await page.locator("#statLessons").textContent()) > 0,
     await page.locator("#statLessons").textContent());
  const sbLinks = await page.locator("#sidebar .sb-links a").count();
  ok("sidebar lessons listed", sbLinks >= 20, "got " + sbLinks);

  /* search */
  await page.fill("#search input", "flexbox");
  await page.waitForTimeout(250);
  const searchHits = await page.locator("#search .results a").count();
  ok("search returns flexbox result", searchHits >= 1, "got " + searchHits);
  const firstSearchHref = await page.locator("#search .results a").first().getAttribute("href");
  ok("search link targets a lesson", /tutorials\.html\?c=css&l=flexbox/.test(firstSearchHref || ""), firstSearchHref);

  /* ---------- 2. TUTORIAL LESSON ---------- */
  console.log("\n[2] tutorials.html lesson render");
  await page.goto(BASE + "/tutorials.html?c=css&l=flexbox", { waitUntil: "networkidle" });
  ok("lesson h1 rendered", (await page.locator(".lesson h1").textContent()).includes("Flexbox"),
     await page.locator(".lesson h1").textContent());
  ok("highlighted code block present", await page.locator(".codewrap pre.code .tk-tag, .codewrap pre.code .tk-prop").count() > 0);
  const preText = await page.locator(".codewrap pre.code").first().innerText();
  ok("code renders real brackets (no double escape)", preText.includes("<div") && !preText.includes("&lt;"),
     JSON.stringify(preText.slice(0, 50)));
  ok("Try-it code blocks exist", (await page.locator(".codewrap").count()) >= 2,
     "blocks=" + await page.locator(".codewrap").count());
  ok("prev/next nav present", (await page.locator(".lesson-nav a").count()) === 2);

  /* mark as completed -> progress persists */
  await page.click("#markBtn");
  ok("mark button flips to Completed", (await page.locator("#markBtn").textContent()).includes("Completed"));
  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem("gxs.progress.v1") || "{}"));
  ok("progress written to localStorage", !!prog["css::flexbox"], JSON.stringify(prog));

  /* ---------- 3. "Try it" -> editor handoff ---------- */
  console.log("\n[3] Try it -> editor handoff");
  await page.click(".codewrap [data-edit]");
  await page.waitForURL("**/editor.html", { timeout: 8000 });
  ok("redirected to editor.html", page.url().endsWith("editor.html"), page.url());
  const handoff = await page.evaluate(() => JSON.parse(localStorage.getItem("gxs.draft") || "{}"));
  ok("handoff keeps HTML from lesson seed", /class="row"/.test(handoff.html || ""), JSON.stringify(handoff.html || "").slice(0, 40));
  ok("handoff keeps CSS from lesson seed", /display:\s*flex/.test(handoff.css || ""), JSON.stringify(handoff.css || "").slice(0, 40));

  /* ---------- 4. EDITOR ---------- */
  console.log("\n[4] editor.html");
  await page.waitForTimeout(1200);

  const previewFrame = () => page.frames().find(f => f.url().startsWith("blob:"));
  const frameHtml = async () => {
    const f = previewFrame();
    if (!f) return "";
    return await f.evaluate(() => "<!DOCTYPE html>" + document.documentElement.outerHTML).catch(() => "");
  };
  const frameText = async () => {
    const f = previewFrame();
    if (!f) return "";
    return await f.evaluate(() => (document.body ? document.body.innerText : "")).catch(() => "");
  };
  const FL = page.frameLocator("#preview");

  // bridge injected => preview document must contain our channel script
  let fh = await frameHtml();
  ok("preview iframe is a blob document", !!previewFrame() && fh.length > 100, "len=" + fh.length);
  ok("lesson CSS injected into preview <style>", /<style>[\s\S]*display:\s*flex[\s\S]*<\/style>/.test(fh));
  ok("bridge postMessage injected", fh.includes("postMessage"));
  ok("flexbox lesson has no JS seed, so no user script injected",
     !/getElementById/.test(fh) && (fh.match(/<script>/g) || []).length === 1);  // only the bridge

  // preview actually rendered the lesson markup
  const previewText = await frameText();
  ok("preview shows lesson content", /\b1\b[\s\S]*\b2\b/.test(previewText), JSON.stringify(previewText.slice(0, 40)));

  // console capture
  const conText = () => page.locator("#consoleBody").innerText();
  ok("console panel has entries", (await conText()).length > 0, JSON.stringify((await conText()).slice(0, 60)));

  // typing updates preview (auto-run)
  await page.click('.tab[data-tab="html"]');
  await page.evaluate(() => {
    const ta = document.getElementById("ed-html");
    ta.value = "<!DOCTYPE html><html><body><h1 id='zz'>NEON-TEST-MARKER</h1></body></html>";
    ta.dispatchEvent(new Event("input"));
  });
  await page.waitForTimeout(1500);
  ok("auto-run updates preview after typing", (await frameText()).includes("NEON-TEST-MARKER"),
     JSON.stringify(await frameText()));

  // user JS console.log captured end-to-end
  await page.click('.tab[data-tab="js"]');
  await page.evaluate(() => {
    const ta = document.getElementById("ed-js");
    ta.value = 'console.log("MARKER-LOG-42"); console.warn("MARKER-WARN"); console.error("MARKER-ERR");';
    ta.dispatchEvent(new Event("input"));
  });
  await page.waitForTimeout(1700);
  const conAfter = await conText();
  ok("console.log captured", conAfter.includes("MARKER-LOG-42"));
  ok("console.warn captured", conAfter.includes("MARKER-WARN"));
  ok("console.error captured", conAfter.includes("MARKER-ERR"));
  ok("error rows styled", await page.locator("#consoleBody .clog.error").count() >= 1);

  // Ctrl+Enter manual run
  await page.click("#clearCon");
  await page.evaluate(() => document.getElementById("ed-html").focus());
  await page.keyboard.press("Control+Enter");
  await page.waitForTimeout(1300);
  ok("Ctrl+Enter re-runs (console repopulates)", (await conText()).includes("MARKER-LOG-42"));

  // CSS tab injects styles
  await page.click('.tab[data-tab="css"]');
  await page.evaluate(() => {
    const ta = document.getElementById("ed-css");
    ta.value = "h1 { color: rgb(255, 62, 165); font-size: 40px; }";
    ta.dispatchEvent(new Event("input"));
  });
  await page.waitForTimeout(1500);
  const h1Color = await FL.locator("h1").evaluate(el => getComputedStyle(el).color).catch(() => "none");
  ok("CSS tab styles the preview", h1Color === "rgb(255, 62, 165)", h1Color);

  // runtime error surfacing
  await page.evaluate(() => {
    const ta = document.getElementById("ed-js");
    ta.value = "undefinedFn();";
    ta.dispatchEvent(new Event("input"));
  });
  await page.waitForTimeout(1500);
  ok("runtime error reported in console", (await conText()).includes("undefinedFn"),
     JSON.stringify((await conText()).slice(-140)));

  // line numbers
  await page.click('.tab[data-tab="html"]');
  await page.evaluate(() => {
    const ta = document.getElementById("ed-html");
    ta.value = "<h1>a</h1>\n<p>b</p>\n<p>c</p>";
    ta.dispatchEvent(new Event("input"));
  });
  const ln = await page.locator("#ln-html").textContent();
  ok("line numbers match line count", ln.trim().split("\n").length === 3, JSON.stringify(ln));

  // fullFile() download assembly
  const setEd = () => page.evaluate(() => {
    const set = (id, v) => { const t = document.getElementById(id); t.value = v; t.dispatchEvent(new Event("input")); };
    set("ed-html", "<!DOCTYPE html><html><head><title>t</title></head><body><p>x</p></body></html>");
    set("ed-css", "p{color:red}");
    set("ed-js", "console.log(1)");
  });
  await setEd();
  const file = await page.evaluate(() => fullFile());
  ok("fullFile injects <style> before </head>", /<style>[\s\S]*p\{color:red\}[\s\S]*<\/style>\s*<\/head>/.test(file));
  ok("fullFile injects <script> before </body>", /<script>[\s\S]*console\.log\(1\)[\s\S]*<\/script>\s*<\/body>/.test(file));

  // buildDoc across html shapes
  const shapes = await page.evaluate(() => {
    const setEl = (id, v) => { const t = document.getElementById(id); t.value = v; t.dispatchEvent(new Event("input")); };
    const set = v => setEl("ed-html", v);
    const out = {};
    setEl("ed-css", "p{color:red}");
    setEl("ed-js", "console.log(1)");
    set("<!DOCTYPE html><html><head></head><body><p>full</p></body></html>");
    out.full = buildDoc();
    set("<body><p>body-only</p></body>");
    out.bodyOnly = buildDoc();
    set("<p>fragment</p>");
    out.fragment = buildDoc();
    set("<html><head><title>x</title></head><body><p>head-only</p>");
    out.headOnly = buildDoc();
    return out;
  });
  const jsAfterContent = d => d.indexOf("console.log(1)") > d.indexOf("<p>") ;
  ok("buildDoc: full doc has head styles + body script",
     /<\/style>/.test(shapes.full) && /postMessage/.test(shapes.full) && jsAfterContent(shapes.full));
  ok("buildDoc: body-only gets styles+bridge+script", /<body[^>]*>[\s\S]*<script>/.test(shapes.bodyOnly) && jsAfterContent(shapes.bodyOnly));
  ok("buildDoc: bare fragment gets wrapped", shapes.fragment.startsWith("<!DOCTYPE html>") && jsAfterContent(shapes.fragment));
  ok("buildDoc: head-only doc still injects script", shapes.headOnly.includes("console.log(1)") && /postMessage/.test(shapes.headOnly));

  // download button produces a file
  const dl = await Promise.all([
    page.waitForEvent("download", { timeout: 8000 }).catch(() => null),
    page.click("#downloadBtn")
  ]).then(r => r[0]);
  ok("download button emits a file", !!dl, dl ? await dl.suggestedFilename() : "no download");

  // localStorage autosave
  const draft = await page.evaluate(() => localStorage.getItem("gxs.draft"));
  ok("autosave writes gxs.draft", !!draft && JSON.parse(draft).html.includes("head-only"));

  // default editor page (with <head>+<body>) must run the user JS in the preview
  await page.evaluate(() => localStorage.removeItem("gxs.draft"));
  await page.goto(BASE + "/editor.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const defCon = await page.locator("#consoleBody").innerText();
  ok("default editor JS runs inside preview", defCon.includes("GodxShadow editor ready"), JSON.stringify(defCon.slice(0, 80)));
  const defText = await frameText();
  ok("default preview renders heading", defText.includes("Neon") && defText.includes("Editor"), JSON.stringify(defText.slice(0, 40)));

  // interactive default: click the glow button inside the preview
  await FL.locator("#btn").click();
  await page.waitForTimeout(800);
  ok("preview button click logs to our console", (await page.locator("#consoleBody").innerText()).includes("Glow state: true"),
     JSON.stringify((await page.locator("#consoleBody").innerText()).slice(-60)));

  // format button keeps code runnable
  await page.click('.tab[data-tab="html"]');
  await page.click("#formatBtn");
  await page.waitForTimeout(1300);
  ok("format keeps preview alive", (await frameText()).includes("Neon"));

  /* ---------- 4b. lesson WITH js seed ---------- */
  console.log("\n[4b] js/js/dom lesson -> editor");
  await page.goto(BASE + "/tutorials.html?c=js&l=dom", { waitUntil: "networkidle" });
  await page.click(".codewrap [data-edit]");
  await page.waitForURL("**/editor.html", { timeout: 8000 });
  await page.waitForTimeout(1500);
  const domDraft = await page.evaluate(() => JSON.parse(localStorage.getItem("gxs.draft") || "{}"));
  ok("dom lesson hands off html+css+js",
     /Todo List/.test(domDraft.html || "") && domDraft.css.includes("background") && domDraft.js.includes("createElement"),
     "html=" + !!domDraft.html + " css=" + !!domDraft.css + " js=" + !!domDraft.js);
  const domFrame = page.frames().find(f => f.url().startsWith("blob:"));
  const domHtml = await domFrame.evaluate(() => "<!DOCTYPE html>" + document.documentElement.outerHTML);
  ok("user JS injected as <script>", /<script>[\s\S]*createElement[\s\S]*<\/script>/.test(domHtml));
  ok("user script placed after body content",
     domHtml.lastIndexOf("createElement") > domHtml.indexOf("Todo List"));
  // interactive: type a task in the preview and click Add -> console proves our bridge works
  await page.frameLocator("#preview").locator("#inp").fill("Neon seekho");
  await page.frameLocator("#preview").locator("#add").click();
  await page.waitForTimeout(700);
  ok("in-preview interaction logs through bridge",
     (await page.locator("#consoleBody").innerText()).includes("Added: Neon seekho"),
     JSON.stringify((await page.locator("#consoleBody").innerText()).slice(-60)));
  ok("in-preview DOM updated",
     (await page.frameLocator("#preview").locator("#todo li").first().textContent()) === "Neon seekho");

  /* ---------- 5. EXAMPLES ---------- */
  console.log("\n[5] examples.html");
  await page.goto(BASE + "/examples.html", { waitUntil: "networkidle" });
  const exCards = await page.locator("#exGrid .card").count();
  ok("example cards rendered", exCards >= 10, "got " + exCards);
  await page.click('[data-f="js"]');
  await page.waitForTimeout(200);
  const jsCards = await page.locator("#exGrid .card").count();
  ok("JS filter narrows list", jsCards < exCards && jsCards > 0, "js=" + jsCards + " all=" + exCards);
  await page.click("#exGrid .card [data-open]");
  await page.waitForURL("**/editor.html", { timeout: 8000 });
  await page.waitForTimeout(1300);
  const exFrame = page.frames().find(f => f.url().startsWith("blob:"));
  const exPreview = exFrame ? await exFrame.evaluate(() => (document.body ? document.body.innerText : "")).catch(() => "") : "";
  ok("example loaded into editor preview", exPreview.trim().length > 0, JSON.stringify(exPreview.slice(0, 40)));

  /* ---------- 6. REFERENCES ---------- */
  console.log("\n[6] references.html");
  await page.goto(BASE + "/references.html", { waitUntil: "networkidle" });
  const rows1 = await page.locator("#refTable tbody tr").count();
  ok("HTML reference rows rendered", rows1 > 20, "got " + rows1);
  await page.fill("#refSearch", "flex");
  await page.waitForTimeout(200);
  const rows2 = await page.locator("#refTable tbody tr").count();
  ok("reference search filters", rows2 < rows1 && rows2 >= 1, "filtered=" + rows2);
  await page.click("#rtCss");
  await page.waitForTimeout(200);
  const cssRows = await page.locator("#refTable tbody tr").count();
  ok("CSS tab switches dataset", cssRows > 15, "got " + cssRows);
  await page.click("#rtJs");
  ok("JS tab switches dataset", (await page.locator("#refTable tbody tr").count()) > 10);

  /* ---------- 7. QUIZ ---------- */
  console.log("\n[7] quiz.html");
  await page.goto(BASE + "/quiz.html", { waitUntil: "networkidle" });
  ok("10 question cards", (await page.locator(".qcard").count()) === 10, "got " + await page.locator(".qcard").count());
  // answer Q1 correctly (option A) and Q2 wrongly (option A)
  await page.click('.qcard:nth-child(1) .opt:nth-of-type(1)');
  ok("correct answer highlighted green", await page.locator('.qcard:nth-child(1) .opt.right').count() === 1);
  await page.click('.qcard:nth-child(2) .opt:nth-of-type(1)');
  ok("wrong answer marked + correct shown",
     (await page.locator('.qcard:nth-child(2) .opt.wrong').count()) === 1 &&
     (await page.locator('.qcard:nth-child(2) .opt.right').count()) === 1);
  ok("score shows 1 / 10", (await page.locator("#score").textContent()).trim() === "1 / 10",
     (await page.locator("#score").textContent()).trim());
  await page.click("#resetQ");
  ok("reset clears score", (await page.locator("#score").textContent()).trim() === "0 / 10");

  /* ---------- 8. every lesson page loads ---------- */
  console.log("\n[8] all lesson routes");
  const routes = await page.evaluate(() =>
    allLessons().map(l => "tutorials.html?c=" + l.course + "&l=" + l.id));
  let routeFail = [];
  for (const r of routes) {
    await page.goto(BASE + "/" + r, { waitUntil: "domcontentloaded" });
    const h1 = await page.locator(".lesson h1").textContent().catch(() => "");
    if (!h1 || !h1.trim()) routeFail.push(r);
  }
  ok("all " + routes.length + " lesson routes render an h1", routeFail.length === 0,
     routeFail.length ? routeFail.join(", ") : "0 failures");

  /* ---------- 8b. new courses & CSS extra chapters ---------- */
  console.log("\n[8b] new courses chapters (start->end)");
  for (const [c, l, expect] of [
    ["csharp", "intro", "C# Introduction"], ["csharp", "wrapup", "Summary"],
    ["csharp", "records", "Records"], ["csharp", "collections-linq", "LINQ"],
    ["csharp", "enums", "Enums"], ["css", "parallax-hero", "Parallax"],
    ["css", "neumorphism", "Neumorphism"], ["css", "aspect-media", "Aspect Ratio"],
    ["css", "tables-ui", "Table"], ["html", "a11y", "Accessibility"],
    ["html", "iframes-embed", "iFrames"], ["css", "cascade-layers", "Layers"],
    ["css", "color-functions", "color-mix"], ["python", "lambda", "Lambda"],
    ["java", "arraylist-hashmap", "HashMap"], ["c", "memory", "malloc"],
    ["sql", "joins-advanced", "JOIN"], ["js", "regex", "Regular Expressions"],
    ["java", "intro", "Java Introduction"], ["typescript", "generics", "Generics"],
    ["react", "state", "useState"], ["nodejs", "express", "Express"],
    ["git", "branching", "Branches"], ["cpp", "stl", "STL"], ["php", "mysql", "PHP + MySQL"],
    ["go", "concurrency", "Goroutines"], ["rust", "ownership", "Ownership"],
    ["kotlin", "nulls", "Null Safety"], ["swift", "swiftui", "SwiftUI"],
    ["angular", "signals", "Signals"], ["vue", "reactivity", "computed"],
    ["tailwind", "states", "Variants"], ["django", "admin", "Admin Panel"],
    ["docker", "compose", "Compose"], ["linux", "pipes", "Pipes"],
    ["numpy", "indexing", "Indexing"], ["pandas", "groupby", "groupby"],
    ["flask", "api", "JSON"], ["aspnet", "ef", "Entity Framework"],
    ["json", "apis", "fetch"], ["xml", "parse", "Parse"],
    ["flutter", "widgets", "Widget"], ["dsa", "hashing", "Hashing"],
  ]) {
    await page.goto(`${BASE}/tutorials.html?c=${c}&l=${l}`, { waitUntil: "networkidle" });
    const h1 = await page.locator(".lesson h1, .lesson h2").first().textContent().catch(() => "");
    const bodyTxt = await page.locator(".lesson").textContent().catch(() => "");
    ok(`route c=${c}&l=${l}`, bodyTxt.includes(expect), (h1 || "").trim().slice(0, 40));
  }

  /* css example chapters render live try-it blocks */
  await page.goto(BASE + "/tutorials.html?c=css&l=cards-ui", { waitUntil: "networkidle" });
  ok("cards-ui lesson: 3 live seeds (html+css+js blocks)",
     (await page.locator(".codewrap").count()) >= 2, "blocks=" + await page.locator(".codewrap").count());
  await page.goto(BASE + "/tutorials.html?c=css&l=loaders", { waitUntil: "networkidle" });
  const loaderPre = await page.locator(".codewrap pre.code").first().innerText();
  ok("loaders lesson escapes fine", !loaderPre.includes("&lt;") && loaderPre.includes("<div"), loaderPre.slice(0, 30));

  /* examples page css filter sees the 6 new css examples */
  await page.goto(BASE + "/examples.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.click('[data-f="css"]');
  await page.waitForTimeout(200);
  const cssCards = await page.locator("#exGrid .card").count();
  ok("css filter shows >=8 css examples", cssCards >= 8, "css=" + cssCards);

  /* all lessons count visible in home stat */
  await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  const statN = Number(await page.locator("#statLessons").textContent());
  ok("statLessons == 561", statN === 561, "got " + statN);
  const statC = Number(await page.locator("#statCourses").textContent());
  ok("statCourses == 35", statC === 35, "got " + statC);

  // --- inline playground: editor LEFT, preview RIGHT, on every lesson ---
  console.log("\n[8c] lesson inline playground + back button");
  await page.goto(BASE + "/tutorials.html?c=html&l=intro", { waitUntil: "networkidle" });
  const pgBtn = await page.$("#pgHost .pgw");
  ok("playground panel mounted on lesson page", !!pgBtn);
  const edHtml = await page.locator('#pgHost .pg-ed[data-t="html"]');
  ok("playground HTML editor has seed code", (await edHtml.inputValue()).length > 30);
  const frame = page.locator("#pgHost .pg-frame");
  ok("preview iframe exists on the right", (await frame.count()) === 1);
  await page.click("#pgHost .pg-run");
  await page.waitForTimeout(300);
  const srcdoc = await frame.getAttribute("srcdoc");
  ok("Run renders into preview (srcdoc live)", !!srcdoc && srcdoc.length > 60, "len=" + (srcdoc || "").length);
  const edBox = await page.locator("#pgHost .pg-left").boundingBox();
  const outBox = await page.locator("#pgHost .pg-right").boundingBox();
  ok("editor is LEFT of live preview", edBox.x + edBox.width <= outBox.x + 4, "edx=" + edBox.x + " outx=" + outBox.x);
  const bb = await page.$("#backBtn.backbtn");
  ok("global Back button present in topbar", !!bb);

  // editor page: code pane is left, output pane right
  await page.goto(BASE + "/editor.html", { waitUntil: "domcontentloaded" });
  const pc = await page.locator(".pane-code").boundingBox();
  const po = await page.locator(".pane-out").boundingBox();
  ok("editor page: code LEFT / live output RIGHT", pc.x + pc.width <= po.x + 4, "cx=" + Math.round(pc.x) + " ox=" + Math.round(po.x));
  ok("editor page also has Back button", (await page.$("#backBtn")) !== null);
  await page.goto(BASE + "/tutorials.html?c=html&l=intro", { waitUntil: "networkidle" });

  // html course is fully English-defined
  const lead = await page.locator("#lessonHost .lead").first().textContent();
  ok("HTML intro starts with English definition", /HyperText Markup Language/.test(lead), lead.slice(0, 40));
  const sideLinks = await page.locator("#sidebar .sb-links a").count();
  ok("sidebar lists all lessons", sideLinks >= 561, "got " + sideLinks);

  /* ---------- 9. progress persistence across reload ---------- */
  console.log("\n[9] persistence");
  await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  const progTxt = await page.locator("#homeProgTxt").textContent();
  ok("home progress reflects completed lesson", /1 \/ \d+/.test(progTxt.trim()), progTxt.trim());

  /* ---------- 10. mobile layout ---------- */
  console.log("\n[10] responsive");
  const mp = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await mp.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  ok("burger visible on mobile", await mp.locator("#burger").isVisible());
  await mp.click("#burger");
  ok("sidebar opens on burger click", await mp.locator("#sidebar").isVisible());

  console.log("\n[11] JS errors collected during run: " + errors.length);
  errors.slice(0, 10).forEach(e => console.log("   ! " + e));

  await browser.close();
  console.log("\n================ RESULT: " + pass + " passed, " + fail + " failed ================");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("HARNESS ERROR", e); process.exit(2); });
