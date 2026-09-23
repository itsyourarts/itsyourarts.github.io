/* GodxShadow inline playground — editor LEFT, live run RIGHT.
   Mounted inside every lesson page so learners can test code right where they read it. */
(function () {
  "use strict";

  function buildDoc(html, css, js) {
    const styleBlock = (css || "").trim() ? "<style>\n" + css + "\n</style>" : "";
    const scriptBlock = (js || "").trim() ? "<scr" + "ipt>\ntry{\n" + js.replace(/<\/script/gi, "<\\/script") + "\n}catch(e){document.body.insertAdjacentHTML('beforeend','<pre style=&quot;color:#ff5c7a;font:13px monospace;background:#1a0e14;padding:8px;border-radius:6px&quot;>JS Error: '+String(e).replace(/</g,'&lt;')+'</pre>');}\n</scr" + "ipt>" : "";
    const headClose = html.search(/<\/head>/i);
    const bodyClose = html.search(/<\/body>/i);
    if (headClose > -1 && bodyClose > -1 && bodyClose > headClose) {
      let out = html.slice(0, headClose) + styleBlock + html.slice(headClose);
      const bc = out.search(/<\/body>/i);
      return out.slice(0, bc) + scriptBlock + out.slice(bc);
    }
    return "<!DOCTYPE html><html><head><meta charset='utf-8'>" + styleBlock +
           "</head><body>" + html + scriptBlock + "</body></html>";
  }

  let mountCount = 0;

  function mount(host, seed, opts) {
    if (!host) return;
    opts = opts || {};
    const s = Object.assign({ html: "", css: "", js: "" }, seed || {});
    const uid = "pg" + (++mountCount);

    host.innerHTML =
      '<div class="pgw" id="' + uid + '">' +
        '<div class="pg-bar">' +
          '<span class="pg-dot" style="background:#ff5c7a"></span>' +
          '<span class="pg-dot" style="background:#ffc857"></span>' +
          '<span class="pg-dot" style="background:#38f2a5"></span>' +
          '<span class="pg-title">' + (opts.title ? escapeHtml(opts.title) + " — " : "") + 'live playground</span>' +
          '<span style="flex:1"></span>' +
          '<button class="btn sm ghost pg-open" title="Open this code in the full editor (with console)">Open in Live Editor ⚡</button>' +
          '<button class="btn sm neon pg-run">▶ Run</button>' +
        '</div>' +
        '<div class="pg-body">' +
          '<div class="pg-left">' +
            '<div class="pg-tabs">' +
              '<button class="pg-tab active" data-t="html">HTML</button>' +
              '<button class="pg-tab" data-t="css">CSS</button>' +
              '<button class="pg-tab" data-t="js">JS</button>' +
            '</div>' +
            '<textarea class="pg-ed" data-t="html" spellcheck="false" aria-label="HTML editor"></textarea>' +
            '<textarea class="pg-ed" data-t="css" spellcheck="false" aria-label="CSS editor" hidden></textarea>' +
            '<textarea class="pg-ed" data-t="js" spellcheck="false" aria-label="JS editor" hidden></textarea>' +
          '</div>' +
          '<div class="pg-right">' +
            '<div class="pg-out-bar"><span>preview — run to refresh</span><span style="flex:1"></span><span class="pg-status"></span></div>' +
            '<iframe class="pg-frame" title="Lesson playground preview" sandbox="allow-scripts allow-modals allow-forms"></iframe>' +
          '</div>' +
        '</div>' +
      '</div>';

    const tabs = host.querySelectorAll(".pg-tab");
    const eds = {};
    ["html", "css", "js"].forEach(t => {
      eds[t] = host.querySelector('.pg-ed[data-t="' + t + '"]');
      eds[t].value = s[t] || "";
    });
    const frame = host.querySelector(".pg-frame");
    const statusEl = host.querySelector(".pg-status");
    let timer = null;

    function run(manual) {
      const t0 = performance.now();
      frame.srcdoc = buildDoc(eds.html.value, eds.css.value, eds.js.value);
      if (manual) statusEl.textContent = "ran in " + Math.round(performance.now() - t0) + " ms";
    }

    tabs.forEach(tb => tb.addEventListener("click", () => {
      tabs.forEach(x => x.classList.toggle("active", x === tb));
      ["html", "css", "js"].forEach(t => { eds[t].hidden = t !== tb.dataset.t; });
    }));

    Object.values(eds).forEach(ed => ed.addEventListener("input", () => {
      clearTimeout(timer); timer = setTimeout(() => run(false), 700);
    }));

    host.querySelector(".pg-run").addEventListener("click", () => run(true));
    host.querySelector(".pg-open").addEventListener("click", () => {
      try {
        localStorage.setItem("gxs.draft", JSON.stringify({ html: eds.html.value, css: eds.css.value, js: eds.js.value }));
      } catch {}
      location.href = "editor.html";
    });

    run(false); // first paint
  }

  function escapeHtml(x) {
    return String(x).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  window.GXPlayground = { mount: mount };
})();
