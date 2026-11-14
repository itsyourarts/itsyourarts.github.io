/* =====================================================================
   ShadowImage2Text — script.js
   Vanilla JS · Tesseract.js OCR · Dark mode · No build step
   ---------------------------------------------------------------------
   Sections
     01. Utilities & constants
     02. State
     03. Theme
     04. Preloader
     05. Navbar & navigation
     06. Scroll reveal & scroll spy
     07. Toasts, dialogs & misc UI
     08. Studio: image intake (click, drag, paste, sample)
     09. Studio: preview & validation
     10. OCR engine (Tesseract.js)
     11. Studio: results, copy, download, reset
     12. Boot
   ===================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------
     01. Utilities & constants
     ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
  const ACCEPTED_MIME = [
    "image/png", "image/jpeg", "image/jpg", "image/webp",
    "image/bmp", "image/gif", "image/tiff", "image/x-tiff",
  ];

  /* Tesseract.js 5.x asset locations (pinned for reliability) */
  const TESS = {
    version: "5.1.1",
    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",
    corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1",
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
  };

  /* Progress phases → weighted overall progress */
  const PHASES = [
    { match: "loading tesseract core",      label: "Loading OCR engine…",        from: 0,  to: 20 },
    { match: "initializing tesseract",      label: "Initializing engine…",       from: 20, to: 32 },
    { match: "loading language traineddata", label: "Downloading language model…", from: 32, to: 70 },
    { match: "initializing api",            label: "Preparing recognition…",     from: 70, to: 84 },
    { match: "recognizing text",            label: "Reading your image…",        from: 84, to: 100 },
  ];

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const debounce = (fn, wait = 120) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };
  const formatBytes = (bytes) => {
    if (!bytes) return "0 KB";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const storage = {
    get(key, fallback = null) {
      try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* private mode */ }
    },
  };

  /* ------------------------------------------------------------------
     02. State
     ------------------------------------------------------------------ */
  const state = {
    file: null,
    objectUrl: null,
    worker: null,
    workerLang: null,
    busy: false,
    lastResult: null, // { text, confidence, seconds }
    imgWidth: 0,
    imgHeight: 0,
  };

  /* Cached DOM references */
  const els = {
    preloader: $("#preloader"),
    nav: $("#nav"),
    navToggle: $("#navToggle"),
    mobileMenu: $("#mobileMenu"),
    themeToggle: $("#themeToggle"),
    cursorGlow: $("#cursorGlow"),
    toasts: $("#toasts"),

    dropzone: $("#dropzone"),
    fileInput: $("#fileInput"),
    dzEmpty: $("#dropzoneEmpty"),
    dzPreview: $("#dropzonePreview"),
    previewImg: $("#previewImage"),
    previewFrame: $(".preview-frame"),
    imgName: $("#imgName"),
    imgDims: $("#imgDims"),
    changeBtn: $("#changeBtn"),
    removeBtn: $("#removeBtn"),
    sampleBtn: $("#sampleBtn"),

    langName: "lang",
    extractBtn: $("#extractBtn"),
    resetBtn: $("#resetBtn"),
    engineState: $("#engineState"),
    engineLabel: $("#engineLabel"),

    progress: $("#progress"),
    progressStatus: $("#progressStatus"),
    progressPct: $("#progressPct"),
    progressBar: $("#progressBar"),
    progressNote: $("#progressNote"),

    result: $(".result"),
    resultEmpty: $("#resultEmpty"),
    ocrText: $("#ocrText"),
    confBadge: $("#confBadge"),
    timeBadge: $("#timeBadge"),
    wordCount: $("#wordCount"),
    charCount: $("#charCount"),
    lineCount: $("#lineCount"),
    copyBtn: $("#copyBtn"),
    downloadBtn: $("#downloadBtn"),
    clearTextBtn: $("#clearTextBtn"),

    year: $("#year"),
    toTop: $("#toTop"),
  };

  /* ------------------------------------------------------------------
     03. Theme  (dark is the brand default)
     ------------------------------------------------------------------ */
  const THEME_KEY = "s2t-theme";

  let themeTimer = null;

  function applyTheme(theme, animate = false) {
    const next = theme === "light" ? "light" : "dark";
    const root = document.documentElement;

    if (animate && !prefersReducedMotion()) {
      // Smooth cross-fade: enable transitions just for the switch, then remove.
      root.classList.add("theme-anim");
      clearTimeout(themeTimer);
      themeTimer = setTimeout(() => root.classList.remove("theme-anim"), 640);
    }

    root.setAttribute("data-theme", next);
    storage.set(THEME_KEY, next);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "light" ? "#f6f5fb" : "#05040a");
    if (els.themeToggle) {
      els.themeToggle.setAttribute(
        "aria-label",
        next === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      els.themeToggle.setAttribute("title", next === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  /* Eagerly fetch the Devanagari webfont subset at boot so Hindi UI labels
     never render as tofu on devices without a Hindi system font. */
  function warmFonts() {
    if (!document.fonts || !document.fonts.load) return;
    const hindi = "\u0939\u093F\u0928\u094D\u0926\u0940"; // हिन्दी
    ["400 16px \"Noto Sans Devanagari\"",
     "600 16px \"Noto Sans Devanagari\"",
     "700 16px \"Noto Sans Devanagari\""].forEach((font) => {
      document.fonts.load(font, hindi).catch(() => { /* offline: system fallback */ });
    });
  }

  function initTheme() {
    const stored = storage.get(THEME_KEY);
    applyTheme(stored || "light"); // light is the brand default; choice is remembered
    els.themeToggle?.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark", true);
    });
  }

  /* ------------------------------------------------------------------
     04. Preloader
     ------------------------------------------------------------------ */
  function hidePreloader() {
    if (!els.preloader || els.preloader.classList.contains("is-done")) return;
    els.preloader.classList.add("is-done");
    setTimeout(() => els.preloader?.remove(), 800);
  }

  function initPreloader() {
    // Never trap the user behind the preloader.
    const minDelay = prefersReducedMotion() ? 0 : 450;
    const start = performance.now();
    const finish = () => {
      const wait = Math.max(0, minDelay - (performance.now() - start));
      setTimeout(hidePreloader, wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    // Safety net for very slow assets.
    setTimeout(hidePreloader, 4200);
  }

  /* ------------------------------------------------------------------
     05. Navbar & navigation
     ------------------------------------------------------------------ */
  function initNav() {
    const onScroll = () => els.nav?.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const closeMenu = () => {
      els.mobileMenu?.classList.remove("is-open");
      els.navToggle?.setAttribute("aria-expanded", "false");
      els.navToggle?.setAttribute("aria-label", "Open menu");
    };

    els.navToggle?.addEventListener("click", () => {
      const open = els.mobileMenu?.classList.toggle("is-open") ?? false;
      els.navToggle.setAttribute("aria-expanded", String(open));
      els.navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    $$("#mobileMenu a").forEach((a) => a.addEventListener("click", closeMenu));
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", debounce(() => {
      if (window.innerWidth > 920) closeMenu();
    }, 150));
  }

  /* ------------------------------------------------------------------
     06. Scroll reveal & scroll spy
     ------------------------------------------------------------------ */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    items.forEach((el) => io.observe(el));
  }

  function initScrollSpy() {
    const links = $$('#navLinks a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;
    const map = new Map();
    links.forEach((link) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) map.set(target, link);
    });
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove("is-active"));
          map.get(entry.target)?.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    map.forEach((_, section) => spy.observe(section));
  }

  /* ------------------------------------------------------------------
     07. Toasts, dialogs & misc UI
     ------------------------------------------------------------------ */
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.4 12.4 2.4 2.4 4.8-5"/></svg>',
    error:   '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.6v5.2M12 16.4h.01"/></svg>',
    info:    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.2M12 7.6h.01"/></svg>',
    warn:    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.8 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4.4M12 16.6h.01"/></svg>',
  };

  function toast(message, type = "info", duration = 4200) {
    if (!els.toasts) return;
    while (els.toasts.children.length >= 3) els.toasts.firstElementChild?.remove();

    const node = document.createElement("div");
    node.className = `toast toast--${type}`;
    node.setAttribute("role", type === "error" ? "alert" : "status");
    node.innerHTML = `<span class="toast__icon">${ICONS[type] || ICONS.info}</span><span>${message}</span>`;
    els.toasts.appendChild(node);

    const dismiss = () => {
      node.classList.add("is-out");
      setTimeout(() => node.remove(), 320);
    };
    const timer = setTimeout(dismiss, duration);
    node.addEventListener("click", () => { clearTimeout(timer); dismiss(); });
  }

  function initDialogs() {
    $$("[data-dialog]").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const dialog = document.getElementById(trigger.dataset.dialog);
        if (dialog && typeof dialog.showModal === "function") dialog.showModal();
      });
    });
    $$("dialog.modal").forEach((dialog) => {
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) dialog.close();
      });
      $$("[data-close-dialog]", dialog).forEach((btn) =>
        btn.addEventListener("click", () => dialog.close())
      );
    });
  }

  function initCursorGlow() {
    if (!els.cursorGlow || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (prefersReducedMotion()) return;
    let raf = null;
    let targetX = 0, targetY = 0;
    const move = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      els.cursorGlow.classList.add("is-on");
      if (raf) return;
      raf = requestAnimationFrame(() => {
        els.cursorGlow.style.transform = `translate(${targetX - 260}px, ${targetY - 260}px)`;
        raf = null;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", () => els.cursorGlow.classList.remove("is-on"));
  }

  function initMiscUI() {
    if (els.year) els.year.textContent = String(new Date().getFullYear());
    els.toTop?.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })
    );
    $$(".faq-item").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        $$(".faq-item").forEach((other) => { if (other !== item) other.open = false; });
      });
    });
  }

  /* ------------------------------------------------------------------
     08. Studio: image intake
     ------------------------------------------------------------------ */
  function getSelectedLang() {
    const checked = document.querySelector('input[name="lang"]:checked');
    return checked ? checked.value : "eng";
  }

  function openFilePicker() {
    if (state.busy) return;
    els.fileInput?.click();
  }

  function isValidFile(file) {
    if (!file) return { ok: false, reason: "No file selected." };
    const byMime = ACCEPTED_MIME.includes((file.type || "").toLowerCase());
    const byExt = /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i.test(file.name || "");
    if (!byMime && !byExt) {
      return { ok: false, reason: "That file type isn’t supported. Use PNG, JPG, WEBP, BMP, GIF or TIFF." };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, reason: `That image is ${formatBytes(file.size)} — the limit is 15 MB. Try compressing it first.` };
    }
    if (file.size === 0) {
      return { ok: false, reason: "That file appears to be empty." };
    }
    return { ok: true };
  }

  async function handleFile(file) {
    if (state.busy) {
      toast("Extraction in progress — hang tight for a moment.", "info");
      return;
    }
    const check = isValidFile(file);
    if (!check.ok) {
      toast(check.reason, "error", 5200);
      return;
    }

    revokeObjectUrl();
    state.file = file;
    state.objectUrl = URL.createObjectURL(file);

    // Read natural dimensions before showing
    try {
      const img = await loadImage(state.objectUrl);
      state.imgWidth = img.naturalWidth || img.width;
      state.imgHeight = img.naturalHeight || img.height;
    } catch {
      state.imgWidth = 0;
      state.imgHeight = 0;
      toast("We couldn’t read that image. It may be corrupted.", "error");
      clearImage();
      return;
    }

    els.previewImg.src = state.objectUrl;
    els.imgName.textContent = file.name || "pasted-image.png";
    els.imgDims.textContent = state.imgWidth
      ? `${state.imgWidth} × ${state.imgHeight} px · ${formatBytes(file.size)}`
      : formatBytes(file.size);

    els.dzEmpty.hidden = true;
    els.dzPreview.hidden = false;
    els.dropzone.classList.add("has-image");
    els.extractBtn.disabled = false;
    els.progress.hidden = true;

    toast("<strong>Image loaded.</strong> Choose a language and extract.", "success", 3000);
    els.extractBtn.focus({ preventScroll: true });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image failed to load"));
      img.src = src;
    });
  }

  function revokeObjectUrl() {
    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = null;
    }
  }

  function clearImage() {
    revokeObjectUrl();
    state.file = null;
    state.imgWidth = 0;
    state.imgHeight = 0;
    if (els.previewImg) els.previewImg.removeAttribute("src");
    if (els.fileInput) els.fileInput.value = "";
    els.dzPreview.hidden = true;
    els.dzEmpty.hidden = false;
    els.dropzone.classList.remove("has-image");
    els.extractBtn.disabled = true;
  }

  function initDropzone() {
    const dz = els.dropzone;
    if (!dz) return;

    dz.addEventListener("click", (e) => {
      if (e.target.closest("#sampleBtn") || e.target.closest(".preview-info__actions")) return;
      if (dz.classList.contains("has-image")) return;
      openFilePicker();
    });

    dz.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (dz.classList.contains("has-image")) return;
      e.preventDefault();
      openFilePicker();
    });

    els.fileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = ""; // allow re-selecting the same file
    });

    els.changeBtn?.addEventListener("click", (e) => { e.stopPropagation(); openFilePicker(); });
    els.removeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.busy) return;
      clearImage();
      toast("Image removed. Your extracted text is still here.", "info");
    });

    /* Drag & drop */
    let dragDepth = 0;
    const setDrag = (on) => dz.classList.toggle("is-dragover", on);

    ["dragenter", "dragover"].forEach((type) =>
      dz.addEventListener(type, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (type === "dragenter") dragDepth += 1;
        setDrag(true);
      })
    );
    dz.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) setDrag(false);
    });
    dz.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepth = 0;
      setDrag(false);
      const file = Array.from(e.dataTransfer?.files || []).find((f) =>
        (f.type || "").startsWith("image/") || /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i.test(f.name)
      );
      if (file) handleFile(file);
      else toast("Please drop an image file (PNG, JPG, WEBP, BMP, GIF or TIFF).", "error");
    });

    /* Block the browser from opening files dropped outside the zone */
    ["dragover", "drop"].forEach((type) =>
      window.addEventListener(type, (e) => {
        if (!dz.contains(e.target)) e.preventDefault();
      }, false)
    );

    /* Paste from clipboard */
    window.addEventListener("paste", (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));
      if (!imageItem) return;
      const file = imageItem.getAsFile();
      if (file) {
        e.preventDefault();
        const named = new File([file], file.name || `pasted-${Date.now()}.png`, { type: file.type });
        handleFile(named);
      }
    });

    els.sampleBtn?.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        const sample = await buildSampleImage();
        handleFile(sample);
      } catch {
        toast("Couldn’t generate the sample image on this device.", "error");
      }
    });
  }

  /* Draw a crisp demo image entirely in-canvas (no network needed) */
  async function buildSampleImage() {
    // Wait for a Devanagari-capable font so the Hindi line renders on every OS.
    // Passing the Hindi text makes the browser fetch the correct unicode-range subset.
    const hindiText = "\u091B\u0935\u093F\u092F\u094B\u0902 \u0915\u094B \u092A\u093E\u0920";
    try {
      await Promise.race([
        Promise.all([
          document.fonts.load('600 40px "Noto Sans Devanagari"', hindiText),
          document.fonts.load('700 34px Georgia', 'ShadowImage2Text'),
          document.fonts.ready,
        ]),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
    } catch { /* fall back to system fonts */ }

    return new Promise((resolve, reject) => {
      const W = 1200, H = 760;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unsupported"));

      // Paper
      ctx.fillStyle = "#f7f4ee";
      ctx.fillRect(0, 0, W, H);

      // Soft brand band at the top
      const grad = ctx.createLinearGradient(0, 0, W, 150);
      grad.addColorStop(0, "#2a1a4d");
      grad.addColorStop(0.55, "#4c1d95");
      grad.addColorStop(1, "#1e3a8a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, 118);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 33px Arial, Helvetica, sans-serif";
      ctx.fillText("ShadowImage2Text", 64, 74);

      ctx.fillStyle = "#c4b5fd";
      ctx.font = "500 20px Arial, Helvetica, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("OCR SAMPLE DOCUMENT", W - 64, 73);
      ctx.textAlign = "left";

      // Headline
      ctx.fillStyle = "#171226";
      ctx.font = "700 54px Georgia, 'Times New Roman', serif";
      ctx.fillText("Turn Images Into Text.", 64, 214);

      // Hindi line — rendered by the device's Devanagari font if present
      ctx.fillStyle = "#3b2f63";
      ctx.font = "600 42px 'Noto Sans Devanagari', 'Nirmala UI', Mangal, 'Kohinoor Devanagari', 'Noto Sans', sans-serif";
      ctx.fillText("छवियों को पाठ में बदलें — तेज़ और सरल।", 64, 282);

      // Rule
      ctx.strokeStyle = "#d8d2c6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(64, 322);
      ctx.lineTo(W - 64, 322);
      ctx.stroke();

      // Body copy
      const lines = [
        "This sample image was generated in your browser to demonstrate",
        "optical character recognition. ShadowImage2Text reads printed",
        "text from photos, screenshots and scanned pages in seconds.",
        "",
        "Choose English, Hindi, or both — then press Extract Text.",
      ];
      ctx.fillStyle = "#2c2640";
      ctx.font = "26px Arial, Helvetica, sans-serif";
      let y = 380;
      for (const line of lines) {
        if (line) ctx.fillText(line, 64, y);
        y += 48;
      }

      // Footer stats
      ctx.fillStyle = "#6b6280";
      ctx.font = "500 22px 'Courier New', monospace";
      ctx.fillText("ENGINE  Tesseract.js 5   ·   LANGUAGES  eng + hin", 64, H - 74);
      ctx.fillText("PRIVACY  100% on-device   ·   COST  free forever", 64, H - 36);

      // Corner marks for a scanned-page feel
      ctx.strokeStyle = "#a8a091";
      ctx.lineWidth = 3;
      const corner = 34;
      [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]].forEach(([x, cy]) => {
        const sx = x < W / 2 ? 1 : -1;
        const sy = cy < H / 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(x, cy + sy * corner);
        ctx.lineTo(x, cy);
        ctx.lineTo(x + sx * corner, cy);
        ctx.stroke();
      });

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("toBlob failed"));
        resolve(new File([blob], "shadowimage2text-sample.png", { type: "image/png" }));
      }, "image/png");
    });
  }

  /* ------------------------------------------------------------------
     09. OCR engine (Tesseract.js)
     ------------------------------------------------------------------ */
  function setEngine(stateName, label) {
    if (!els.engineState) return;
    els.engineState.dataset.state = stateName;
    if (els.engineLabel) els.engineLabel.textContent = label;
  }

  const engineLabels = {
    idle: "Engine idle",
    loading: "Engine loading",
    ready: "Engine ready",
    working: "Engine working",
    error: "Engine error",
  };

  function showProgress() {
    if (!els.progress) return;
    els.progress.hidden = false;
    els.progress.classList.remove("is-done");
    els.progressBar.style.width = "0%";
    els.progressPct.textContent = "0%";
  }

  function setProgress(pct, label) {
    const value = clamp(Math.round(pct), 0, 100);
    if (els.progressBar) els.progressBar.style.width = `${value}%`;
    if (els.progressPct) els.progressPct.textContent = `${value}%`;
    if (label && els.progressStatus) els.progressStatus.textContent = label;
    if (els.progress) els.progress.setAttribute("aria-valuenow", String(value));
  }

  function handleWorkerLog(message) {
    if (!message) return;
    const phase = PHASES.find((p) => (message.status || "").includes(p.match));
    if (!phase) return;
    const pct = phase.from + clamp(message.progress || 0, 0, 1) * (phase.to - phase.from);
    setProgress(pct, phase.label);
    if (phase.match === "loading language traineddata" && els.progressNote) {
      els.progressNote.textContent = "Downloading the language model once — it’s cached for next time.";
    }
    if (phase.match === "recognizing text" && els.progressNote) {
      els.progressNote.textContent = "Neural OCR is reading your image on this device.";
    }
  }

  async function ensureWorker(lang) {
    if (!window.Tesseract) {
      throw new Error("The OCR engine couldn’t load. Check your connection and refresh the page.");
    }
    if (state.worker && state.workerLang === lang) return state.worker;

    if (state.worker) {
      try { await state.worker.terminate(); } catch { /* noop */ }
      state.worker = null;
      state.workerLang = null;
    }

    setEngine("loading", engineLabels.loading);
    showProgress();
    setProgress(2, "Loading OCR engine…");

    const worker = await Tesseract.createWorker(lang, 1, {
      workerPath: TESS.workerPath,
      corePath: TESS.corePath,
      langPath: TESS.langPath,
      logger: handleWorkerLog,
      errorHandler: (err) => console.warn("[ShadowImage2Text] OCR worker:", err),
    });

    state.worker = worker;
    state.workerLang = lang;
    setEngine("ready", engineLabels.ready);
    return worker;
  }

  /**
   * Prepare an image for recognition:
   *  – flatten transparency onto white (otherwise text turns invisible)
   *  – upscale small images toward ~1500px for better glyph detail
   *  – cap total pixels to keep memory sane
   */
  async function preprocessImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const natW = img.naturalWidth || img.width;
      const natH = img.naturalHeight || img.height;
      if (!natW || !natH) throw new Error("Image has no dimensions");

      let scale = 1;
      const maxSide = Math.max(natW, natH);
      if (maxSide < 1500) scale = Math.min(2.2, 1500 / maxSide);
      if (natW * natH * scale * scale > 20_000_000) {
        scale = Math.sqrt(20_000_000 / (natW * natH));
      }

      const w = Math.max(1, Math.round(natW * scale));
      const h = Math.max(1, Math.round(natH * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      return canvas;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function setBusyUI(busy) {
    state.busy = busy;
    if (els.extractBtn) {
      els.extractBtn.classList.toggle("is-busy", busy);
      els.extractBtn.disabled = busy || !state.file;
    }
    if (els.resetBtn) els.resetBtn.disabled = busy;
    if (els.removeBtn) els.removeBtn.disabled = busy;
    if (els.changeBtn) els.changeBtn.disabled = busy;
    $$('input[name="lang"]').forEach((r) => { r.disabled = busy; });
    els.dropzone?.classList.toggle("is-locked", busy);
    els.previewFrame?.classList.toggle("is-scanning", busy);
    if (busy) setEngine("working", engineLabels.working);
  }

  async function runExtraction() {
    if (state.busy) return;
    if (!state.file) {
      toast("Add an image first — drop one in or try the sample.", "warn");
      return;
    }

    const lang = getSelectedLang();
    const started = performance.now();
    setBusyUI(true);
    showProgress();
    setProgress(0, "Preparing engine…");
    if (els.progressNote) {
      els.progressNote.textContent =
        "First run downloads the language model once — it’s cached for next time.";
    }

    try {
      const worker = await ensureWorker(lang);
      setProgress(86, "Reading your image…");
      const image = await preprocessImage(state.file);
      const { data } = await worker.recognize(image);

      const seconds = (performance.now() - started) / 1000;
      const text = (data.text || "").replace(/\r\n/g, "\n").trim();

      if (!text) {
        state.lastResult = null;
        els.confBadge.hidden = true;
        els.timeBadge.hidden = true;
        setProgress(100, "No text found");
        els.progress?.classList.add("is-done");
        if (els.progressNote) {
          els.progressNote.textContent =
            "This image didn’t contain readable text. Try a sharper image, more light, or a different language.";
        }
        toast("<strong>No readable text found.</strong> Try a sharper image or switch language.", "warn", 5600);
        return;
      }

      fillResult(text, data.confidence, seconds);
      setProgress(100, "Extraction complete");
      els.progress?.classList.add("is-done");
      if (els.progressNote) {
        els.progressNote.textContent = `Done in ${seconds.toFixed(1)}s with ${Math.round(data.confidence || 0)}% confidence.`;
      }
      toast(`<strong>Text extracted.</strong> ${countWords(text)} words in ${seconds.toFixed(1)}s.`, "success");
      setTimeout(() => { if (!state.busy) els.progress.hidden = true; }, 2600);
    } catch (err) {
      console.error("[ShadowImage2Text] Extraction failed:", err);
      setEngine("error", engineLabels.error);
      if (els.progress) {
        els.progress.hidden = true;
        els.progress.classList.remove("is-done");
      }
      const message =
        typeof err === "string" ? err :
        err?.message?.includes("fetch") || err?.message?.includes("Network")
          ? "We couldn’t download the OCR engine. Check your internet connection and try again."
          : "Extraction failed. Please try again with another image.";
      toast(message, "error", 6000);
    } finally {
      setBusyUI(false);
      if (els.engineState?.dataset.state === "working") {
        setEngine(state.worker ? "ready" : "idle", state.worker ? engineLabels.ready : engineLabels.idle);
      }
      els.extractBtn.disabled = !state.file;
    }
  }

  /* ------------------------------------------------------------------
     11. Studio: results, copy, download, reset
     ------------------------------------------------------------------ */
  const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0);

  function updateCounts() {
    const text = els.ocrText?.value || "";
    if (els.wordCount) els.wordCount.textContent = String(countWords(text));
    if (els.charCount) els.charCount.textContent = String(text.length);
    if (els.lineCount) els.lineCount.textContent = String(text ? text.split("\n").length : 0);
    const hasText = text.trim().length > 0;
    els.result?.classList.toggle("has-text", hasText);
    [els.copyBtn, els.downloadBtn, els.clearTextBtn].forEach((btn) => {
      if (btn) btn.disabled = !hasText;
    });
  }

  function fillResult(text, confidence, seconds) {
    state.lastResult = { text, confidence, seconds };
    if (els.ocrText) els.ocrText.value = text;
    updateCounts();

    if (els.confBadge) {
      const conf = Math.round(confidence || 0);
      els.confBadge.hidden = false;
      els.confBadge.textContent = `${conf}% confidence`;
      els.confBadge.classList.toggle("badge--low", conf < 75);
      els.confBadge.title =
        conf >= 90 ? "High confidence" : conf >= 75 ? "Good confidence — review for typos" : "Low confidence — review carefully";
    }
    if (els.timeBadge) {
      els.timeBadge.hidden = false;
      els.timeBadge.textContent = `${seconds.toFixed(1)}s`;
    }
    els.result?.classList.add("has-text");
  }

  async function copyText() {
    const text = els.ocrText?.value || "";
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      toast("<strong>Copied to clipboard.</strong>", "success", 2600);
    } catch {
      // Fallback for insecure contexts / older browsers
      try {
        els.ocrText.select();
        els.ocrText.setSelectionRange(0, text.length);
        document.execCommand("copy");
        window.getSelection()?.removeAllRanges();
        toast("<strong>Copied to clipboard.</strong>", "success", 2600);
      } catch {
        toast("Copy failed — select the text and copy it manually.", "error");
      }
    }
  }

  function downloadText() {
    const text = els.ocrText?.value || "";
    if (!text.trim()) return;
    const base = (state.file?.name || "extracted-text")
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\- ]+/g, "")
      .trim() || "extracted-text";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}-shadowimage2text.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("<strong>Download started.</strong> Your .txt file is ready.", "success", 2800);
  }

  function clearText() {
    if (!els.ocrText || !els.ocrText.value) return;
    els.ocrText.value = "";
    state.lastResult = null;
    if (els.confBadge) els.confBadge.hidden = true;
    if (els.timeBadge) els.timeBadge.hidden = true;
    els.progress.hidden = true;
    updateCounts();
    els.ocrText.focus();
    toast("Extracted text cleared.", "info", 2400);
  }

  function resetWorkspace() {
    if (state.busy) return;
    clearImage();
    els.ocrText.value = "";
    state.lastResult = null;
    if (els.confBadge) els.confBadge.hidden = true;
    if (els.timeBadge) els.timeBadge.hidden = true;
    els.progress.hidden = true;
    els.progress.classList.remove("is-done");
    setProgress(0, "Preparing engine…");
    updateCounts();
    document.querySelector('input[name="lang"][value="eng"]')?.click();
    toast("<strong>Workspace reset.</strong> Fresh start — drop a new image.", "success", 2800);
  }

  function initStudio() {
    els.extractBtn?.addEventListener("click", runExtraction);
    els.copyBtn?.addEventListener("click", copyText);
    els.downloadBtn?.addEventListener("click", downloadText);
    els.clearTextBtn?.addEventListener("click", clearText);
    els.resetBtn?.addEventListener("click", resetWorkspace);
    els.ocrText?.addEventListener("input", debounce(updateCounts, 80));

    $$('input[name="lang"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!state.lastResult) return;
        toast("Language changed — run Extract Text again for the new language.", "info", 3200);
      });
    });

    /* Ctrl/Cmd + Enter → extract */
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && state.file) {
        e.preventDefault();
        runExtraction();
      }
    });

    updateCounts();
    if (window.Tesseract) {
      setEngine("idle", engineLabels.idle);
    } else {
      setEngine("error", "Engine unavailable");
      if (window.__TESS_FAILED__) {
        toast("The OCR engine couldn’t load from the CDN. Check your connection or ad-blocker, then refresh.", "error", 7000);
      }
    }
  }

  /* ------------------------------------------------------------------
     12. Boot
     ------------------------------------------------------------------ */
  function boot() {
    document.documentElement.classList.add("js");

    initTheme();
    warmFonts();
    initPreloader();
    initNav();
    initReveal();
    initScrollSpy();
    initDialogs();
    initCursorGlow();
    initMiscUI();
    initDropzone();
    initStudio();

    // Expose a tiny debug API for curious developers.
    window.ShadowImage2Text = {
      version: "1.0.0",
      runExtraction,
      resetWorkspace,
      get state() { return { ...state, worker: undefined }; },
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
