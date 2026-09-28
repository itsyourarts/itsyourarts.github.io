/* ================= GODxSHADOW — frontend logic ================= */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const urlInput = $('#urlInput');
  const downloadBtn = $('#downloadBtn');
  const downloadBtnText = $('#downloadBtnText');
  const pasteBtn = $('#pasteBtn');
  const clearBtn = $('#clearBtn');
  const demoBtn = $('#demoBtn');
  const dlProgress = $('#dlProgress');
  const progressFill = $('#progressFill');
  const dlResult = $('#dlResult');
  const dlError = $('#dlError');
  const toast = $('#toast');

  /* ---------- API health check → preview/demo mode ---------- */
  let previewMode = (location.protocol === 'file:');
  async function checkApi() {
    if (previewMode && location.protocol === 'file:') { showBanner(); return; }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch('/api/health', { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(t);
      const ct = res.headers.get('content-type') || '';
      if (!res.ok || !ct.includes('application/json')) throw new Error('bad health response');
      await res.json();
      previewMode = false;
      $('#apiBanner').hidden = true;
    } catch {
      previewMode = true;
      showBanner();
    }
  }
  function showBanner() {
    const b = $('#apiBanner');
    b.hidden = false;
    document.body.style.paddingTop = b.offsetHeight + 'px';
  }
  $('#apiBannerClose').addEventListener('click', () => {
    $('#apiBanner').hidden = true;
    document.body.style.paddingTop = '0';
  });
  checkApi();
  // re-check when tab becomes visible again (e.g. user switches to live preview)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkApi(); });

  /* ---------- preloader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => $('#preloader').classList.add('done'), 1200);
  });
  setTimeout(() => $('#preloader').classList.add('done'), 3000); // safety

  /* ---------- nav ---------- */
  const nav = $('#nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30));
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => navLinks.classList.remove('show')));

  /* ---------- particles canvas ---------- */
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  let W, H, parts = [];
  const COLORS = ['0,245,255', '255,43,209', '139,92,246', '57,255,20'];
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  function initParts() {
    parts = [];
    const n = Math.min(90, Math.floor(W / 16));
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.6 + 0.15,
      });
    }
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.shadowColor = `rgba(${p.c},.9)`;
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    // connective lines
    for (let i = 0; i < parts.length; i += 3) {
      for (let j = i + 3; j < parts.length; j += 4) {
        const a = parts[i], b = parts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,245,255,${(1 - d / 130) * 0.14})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  resize(); initParts(); tick();
  window.addEventListener('resize', () => { resize(); initParts(); });

  /* ---------- cursor glow ---------- */
  const glow = $('#cursor-glow');
  window.addEventListener('pointermove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- counters ---------- */
  function fmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return '' + n;
  }
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      cio.unobserve(el);
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || (target >= 1000 ? '+' : '');
      const t0 = performance.now(), dur = 1800;
      (function step(t) {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.floor(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.5 });
  $$('.stat-num').forEach((el) => cio.observe(el));

  /* ---------- marquee duplicate ---------- */
  const track = $('#marqueeTrack');
  track.innerHTML += track.innerHTML;

  /* ---------- faq ---------- */
  $$('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.faq-item.open').forEach((o) => { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; });
      if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  /* ---------- toast ---------- */
  let toastTimer;
  function showToast(msg, isErr) {
    toast.textContent = msg;
    toast.classList.toggle('err', !!isErr);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  /* ---------- tabs ---------- */
  let dlType = 'auto';
  $$('.dl-tab').forEach((t) => t.addEventListener('click', () => {
    $$('.dl-tab').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    dlType = t.dataset.type;
  }));

  /* ---------- history ---------- */
  const HIST_KEY = 'godxshadow_history';
  const getHist = () => { try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch { return []; } };
  const saveHist = (url) => {
    let h = getHist().filter((x) => x !== url);
    h.unshift(url);
    h = h.slice(0, 12);
    localStorage.setItem(HIST_KEY, JSON.stringify(h));
    renderHist();
  };
  function renderHist() {
    const h = getHist();
    const list = $('#histList');
    if (!h.length) { list.innerHTML = '<div class="hist-empty">No links yet — paste your first one ⚡</div>'; return; }
    list.innerHTML = '';
    h.forEach((u) => {
      const d = document.createElement('div');
      d.className = 'hist-item';
      d.textContent = u;
      d.title = u;
      d.addEventListener('click', () => {
        urlInput.value = u;
        $('#historyPanel').classList.remove('show');
        doDownload();
      });
      list.appendChild(d);
    });
  }
  renderHist();
  $('#historyFab').addEventListener('click', () => $('#historyPanel').classList.toggle('show'));
  $('#histClose').addEventListener('click', () => $('#historyPanel').classList.remove('show'));
  $('#histClear').addEventListener('click', () => { localStorage.removeItem(HIST_KEY); renderHist(); });

  /* ---------- typing placeholder ---------- */
  const samples = [
    'Paste Instagram link here…  e.g. instagram.com/reel/…',
    'Paste video link…  e.g. instagram.com/p/…',
    'Paste IGTV link…  e.g. instagram.com/tv/…',
    'Paste carousel link…  photos + videos supported',
  ];
  let si = 0;
  setInterval(() => {
    if (document.activeElement === urlInput || urlInput.value) return;
    si = (si + 1) % samples.length;
    urlInput.setAttribute('placeholder', samples[si]);
  }, 3500);

  /* ---------- buttons ---------- */
  pasteBtn.addEventListener('click', async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) { urlInput.value = t.trim(); showToast('📋 Link pasted!'); urlInput.focus(); }
      else showToast('Clipboard empty hai', true);
    } catch { showToast('Clipboard access blocked — manually paste karo', true); }
  });
  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    dlResult.classList.remove('show');
    dlError.classList.remove('show');
    urlInput.focus();
  });
  demoBtn.addEventListener('click', () => {
    urlInput.value = 'https://www.instagram.com/reel/godxshadow-demo/';
    doDownload();
  });
  $$('.try-link').forEach((a) => a.addEventListener('click', () => {
    urlInput.value = a.dataset.sample;
    setTimeout(doDownload, 500);
  }));
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doDownload(); });
  downloadBtn.addEventListener('click', doDownload);

  /* ---------- progress anim ---------- */
  function setStep(n) {
    $$('.step').forEach((s) => {
      const k = +s.dataset.step;
      s.classList.toggle('active', k === n);
      s.classList.toggle('done', k < n);
      if (k < n) s.querySelector('.step-num').textContent = '✓';
      else s.querySelector('.step-num').textContent = k;
    });
    progressFill.style.width = (n / 3) * 100 + '%';
  }

  /* ---------- main download flow ---------- */
  const IG_RE = /(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/\S+/i;
  let busy = false;

  async function doDownload() {
    const url = urlInput.value.trim();
    dlResult.classList.remove('show');
    dlError.classList.remove('show');
    dlResult.innerHTML = '';
    dlError.innerHTML = '';

    if (!url) { showToast('⚠ Pehle Instagram link paste karo', true); urlInput.focus(); return; }
    if (!IG_RE.test(url)) {
      showError('Invalid link', 'Ye valid Instagram link nahi lag raha. Link <code>instagram.com/…</code> se start hona chahiye — jaise <code>instagram.com/reel/…</code> ya <code>instagram.com/p/…</code>');
      return;
    }
    if (busy) return;
    busy = true;
    downloadBtn.disabled = true;
    downloadBtn.classList.add('loading');
    downloadBtnText.textContent = 'FETCHING…';
    dlProgress.classList.add('show');
    setStep(1);

    // fake staged progress while fetching
    let fake = 8;
    progressFill.style.width = fake + '%';
    const fakeTimer = setInterval(() => {
      fake = Math.min(fake + Math.random() * 9, 88);
      progressFill.style.width = fake + '%';
      if (fake > 30) setStep(2);
      if (fake > 65) setStep(3);
    }, 320);

    try {
      // Preview mode (file viewer / no server) → instant client-side demo, zero network errors
      if (previewMode) {
        clearInterval(fakeTimer);
        progressFill.style.width = '100%';
        setStep(4);
        setTimeout(() => {
          dlProgress.classList.remove('show');
          progressFill.style.width = '0%';
          renderResult(buildClientDemo(url), url);
          saveHist(url);
          showToast('⚡ Demo preview ready! Real downloads ke liye Live Preview me kholo.');
        }, 600);
        return;
      }

      const res = await fetch('/api/download?url=' + encodeURIComponent(url), { cache: 'no-store' });
      // SAFE parse: server/proxy kabhi HTML de de to JSON crash nahi hoga
      const raw = await res.text();
      let data = null;
      try { data = JSON.parse(raw); }
      catch {
        throw new Error('Server ne invalid response diya (API reachable nahi). Live Preview me kholo.');
      }
      clearInterval(fakeTimer);
      progressFill.style.width = '100%';
      setStep(4);

      setTimeout(() => {
        dlProgress.classList.remove('show');
        progressFill.style.width = '0%';
        if (data.success) {
          renderResult(data, url);
          saveHist(url);
          showToast('⚡ Media ready — download karo!');
        } else {
          showError('Fetch failed', escapeHtml(data.message || 'Unknown error') +
            '<br/><br/>Tips: link <b>public</b> post ka ho • private accounts supported nahi • thodi der baad retry karo • ya <b>demo link</b> try karke UI dekho.', data);
        }
      }, 450);
    } catch (e) {
      clearInterval(fakeTimer);
      dlProgress.classList.remove('show');
      // Last-resort: demo render taaki page kabhi "dead error" par na atke
      if (previewMode || location.protocol === 'file:') {
        renderResult(buildClientDemo(url), url);
        showToast('⚡ Demo mode: Live Preview me kholo for real downloads');
      } else {
        showError('Network error', 'Server se connect nahi ho paya: ' + escapeHtml(e.message) +
          '<br/><br/>Agar tum <b>file preview</b> me ho to <b>Live Preview (GodxShadow Neon Site)</b> wala tab kholo — wahan server connected hai. ✅');
      }
    } finally {
      setTimeout(() => {
        busy = false;
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('loading');
        downloadBtnText.textContent = 'DOWNLOAD';
      }, 500);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function buildClientDemo(url) {
    const m = (url || '').match(/\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
    const code = m ? m[2] : 'demo';
    const seed = encodeURIComponent(code);
    return {
      success: true, demo: true, previewFallback: true, source: url, shortcode: code,
      author: 'godxshadow.demo',
      caption: 'Demo preview — ye sample media hai. Real public Instagram link ka original media Live Preview (server mode) me milega.',
      thumbnail: 'https://picsum.photos/seed/' + seed + '/640/640',
      medias: [
        { type: 'video', quality: 'HD 720p (sample)', ext: 'mp4', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { type: 'image', quality: 'Original 1080px (sample)', ext: 'jpg', url: 'https://picsum.photos/seed/' + seed + '/1080/1080' },
      ],
    };
  }

  /* ---------- video unlock (user-browser GraphQL + paste JSON) ---------- */
  const gqlUrlCache = {};
  function unlockPanelHtml(source, shortcode) {
    return `
    <div class="unlock-box" data-source="${escapeHtml(source)}" data-code="${escapeHtml(shortcode)}">
      <div class="bridge-title">🔓 OPTION 1 — UNLOCK FULL VIDEO (SIRF 3 TAPS)</div>
      <p class="unlock-intro">Instagram video file sirf <b>real browser</b> ko deta hai. Tumhara browser + tumhara login use karke <b>poori MP4</b> nikalo:</p>
      <div class="ustep"><span class="u-num">1</span><div class="u-body"><b>Data link kholo</b><p>Button dabao → Instagram ka data page naye tab me khulega.</p><button class="btn-unlock" data-unlock-open>1️⃣ OPEN DATA LINK ↗</button></div></div>
      <div class="ustep"><span class="u-num">2</span><div class="u-body"><b>Copy karo</b><p>Khule page par <code>Ctrl+A</code> phir <code>Ctrl+C</code> <span class="u-mob">(mobile: Select-all → Copy)</span> — phir wapas aao, video <b>auto-unlock</b> ✨</p></div></div>
      <div class="ustep"><span class="u-num">3</span><div class="u-body"><b>Neeche paste karo (ya auto hone do)</b><textarea class="unlock-json" rows="3" spellcheck="false" placeholder='{"data": …} — yahan paste karo, video apne-aap niklega ✨'></textarea><div class="unlock-btnrow"><button class="btn-unlock go" data-unlock-go>🔓 EXTRACT VIDEO</button><button class="btn-view" data-unlock-paste>📋 PASTE FROM CLIPBOARD</button></div></div></div>
      <div class="unlock-result"></div>
      <div class="unlock-note">🔒 JSON sirf tumhare browser me parse hota hai — server ko kuch nahi bheja jata.<br/>⚠️ Data page khaali/error dikhe to pehle <b>instagram.com me login</b> karo, phir Step 1 dobara karo.</div>
    </div>`;
  }
  function extractVideoFromJSON(text) {
    const videos = [];
    const images = [];
    let m;
    const reV = /"video_url"\s*:\s*"((?:[^"\\]|\\.)+)"/g;
    while ((m = reV.exec(text || ''))) {
      const u = m[1].replace(/\\u0026/gi, '&').replace(/\\\//g, '/');
      if (/^https?:\/\//.test(u)) videos.push(u);
    }
    const reI = /"display_url"\s*:\s*"((?:[^"\\]|\\.)+)"/g;
    while ((m = reI.exec(text || ''))) {
      const u = m[1].replace(/\\u0026/gi, '&').replace(/\\\//g, '/');
      if (/^https?:\/\//.test(u)) images.push(u);
    }
    return { videos: [...new Set(videos)], images: [...new Set(images)] };
  }
  async function handleUnlockPaste(btn) {
    const box = btn ? btn.closest('.unlock-box') : null;
    if (!box) return;
    const ta = box.querySelector('.unlock-json');
    try {
      const txt = await navigator.clipboard.readText();
      if (!txt || txt.trim().length < 50) { showToast('Clipboard me JSON nahi mila — Step 1–2 karo', true); return; }
      ta.value = txt.trim();
      runUnlockExtract(box);
    } catch { showToast('Clipboard blocked — manually paste karo (long-press → Paste)', true); }
  }
  // AUTO-EXTRACT: user paste kare → turant video (button dabane ki zaroorat nahi)
  document.addEventListener('paste', (e) => {
    const ta = e.target && e.target.closest ? e.target.closest('.unlock-json') : null;
    if (!ta) return;
    setTimeout(() => {
      const box = ta.closest('.unlock-box');
      if (box && ta.value.trim().length > 50) runUnlockExtract(box);
    }, 80);
  });
  // AUTO-UNLOCK: data tab se copy karke wapas aao → clipboard auto-read → video hazir ✨
  let lastClipCheck = 0;
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) return;
    const now = Date.now();
    if (now - lastClipCheck < 5000) return;
    lastClipCheck = now;
    const box = document.querySelector('.unlock-box');
    if (!box || !box.offsetParent) return;
    const ta = box.querySelector('.unlock-json');
    if (!ta || ta.value.trim().length > 50) return;
    if (box.querySelector('.unlock-result .media-row')) return;
    try {
      const txt = await navigator.clipboard.readText();
      if (txt && txt.length > 50 && /shortcode_media|video_url|graphql/i.test(txt)) {
        ta.value = txt.trim();
        runUnlockExtract(box);
        showToast('✨ Clipboard se auto-unlock!');
      }
    } catch { /* permission denied → manual paste */ }
  });
  async function handleUnlockOpen(btn) {
    const box = btn.closest('.unlock-box');
    const out = box.querySelector('.unlock-result');
    const source = box.getAttribute('data-source') || '';
    const code = box.getAttribute('data-code') || '';
    btn.disabled = true;
    btn.textContent = '⏳ LINK TAIYAAR HO RAHA…';
    try {
      let gql = gqlUrlCache[code];
      if (!gql) {
        const res = await fetch('/api/unlock?url=' + encodeURIComponent(source), { cache: 'no-store' });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'unlock failed');
        gql = data.gqlUrl;
        gqlUrlCache[code] = gql;
      }
      window.open(gql, '_blank', 'noopener');
      out.innerHTML = '<div class="unlock-ok">✅ Data link khul gaya! Us tab se <b>Ctrl+A → Ctrl+C</b> karke poora text yahan Step 3 me paste karo. 👇</div>';
      showToast('🔓 Data link opened — copy karke paste karo');
    } catch (e) {
      out.innerHTML = `<div class="unlock-err">❌ ${escapeHtml(e.message)} — neeche FastDL bridge use karo.</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '1️⃣ OPEN DATA LINK ↗';
    }
  }
  function handleUnlockGo(btn) {
    const box = btn ? btn.closest('.unlock-box') : null;
    if (box) runUnlockExtract(box);
  }
  function runUnlockExtract(box) {
    const ta = box.querySelector('.unlock-json');
    const out = box.querySelector('.unlock-result');
    const text = (ta.value || '').trim();
    if (text.length < 50) {
      out.innerHTML = '<div class="unlock-err">⚠️ Pehle Step 1–2 complete karo — data page ka poora text yahan paste karo.</div>';
      return;
    }
    const found = extractVideoFromJSON(text);
    if (!found.videos.length) {
      out.innerHTML = `<div class="unlock-err">❌ Is text me video nahi mila. Wajah: <b>Instagram me login nahi ho</b> (data page ne error diya) ya galat text paste hua.<br/>👉 instagram.com me login karo → Step 1 ka link <b>dobara kholo</b> → fresh JSON paste karo.${found.images.length ? '<br/>🖼️ Lekin ' + found.images.length + ' photo(s) mile — video ke liye FastDL bridge try karo.' : ''}</div>`;
      return;
    }
    const rows = found.videos.map((u, i) => {
      const label = found.videos.length > 1 ? `Video ${i + 1} · MP4` : 'Full Video · MP4';
      return `<div class="media-row"><div class="media-ico">🎬</div><div class="media-meta"><b>${label}</b><span>Original quality · direct CDN</span></div><div class="media-btns"><a class="btn-dl" href="${escapeHtml(u)}" target="_blank" rel="noopener">⬇ Download MP4</a></div></div>`;
    }).join('');
    out.innerHTML = `<div class="unlock-ok">🎉 <b>${found.videos.length} video${found.videos.length > 1 ? 's' : ''} unlocked!</b> Neeche download karo:</div>${rows}`;
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('🎉 Video unlocked!');
  }

  function renderResult(data, srcUrl) {
    const medias = (data.medias || []).filter((m) => !dlType || dlType === 'auto' || m.type === dlType || (dlType === 'reel' && m.type === 'video') || (dlType === 'igtv' && m.type === 'video') || (dlType === 'photo' && m.type === 'image'));
    const list = medias.length ? medias : data.medias;
    const rows = (list || []).map((m, i) => {
      const fname = `godxshadow_${data.shortcode || 'media'}_${i + 1}.${m.ext || (m.type === 'video' ? 'mp4' : 'jpg')}`;
      // direct: IG CDN images open in USER's browser (real bytes; server proxy would get blanked)
      // previewMode (no server): /api/proxy doesn't exist → direct too
      const useDirect = previewMode || m.direct;
      const href = useDirect
        ? escapeHtml(m.url)
        : '/api/proxy?url=' + encodeURIComponent(m.url) + '&filename=' + encodeURIComponent(fname);
      const extra = useDirect ? ' target="_blank" rel="noopener"' : ` download="${escapeHtml(fname)}"`;
      const dlLabel = useDirect ? '⬇ Open HD' : '⬇ Download';
      const dlHint = useDirect ? ' (new tab me khulega — wahan save kar lo)' : '';
      const icon = m.type === 'video' ? '🎬' : '🖼️';
      const label = m.type === 'video' ? 'Video · MP4' : 'Photo · JPG';
      const viewBtn = (!useDirect && (m.type === 'image' || m.url.includes('googleapis'))) ? `<a class="btn-view" href="${escapeHtml(m.url)}" target="_blank" rel="noopener">👁 Preview</a>` : '';
      return `<div class="media-row">
        <div class="media-ico">${icon}</div>
        <div class="media-meta"><b>${label}</b><span>${escapeHtml(m.quality || 'Original quality')}${dlHint}</span></div>
        <div class="media-btns"><a class="btn-dl" href="${href}"${extra}>${dlLabel}</a>${viewBtn}</div>
      </div>`;
    }).join('');

    const hasMp4 = (data.medias || []).some((m) => m.type === 'video');
    const needsUnlock = !!data.shortcode && !data.demo && !data.previewFallback &&
      (data.videoExpected || data.kind === 'reel' || data.kind === 'tv') && !hasMp4;
    const unlockHtml = needsUnlock ? unlockPanelHtml(data.source || srcUrl || '', data.shortcode) : '';

    // Inline players: video medias play right inside the card (streamed via proxy).
    const players = (list || []).filter((m) => m.type === 'video').map((m) => {
      const vsrc = previewMode
        ? escapeHtml(m.url)
        : '/api/proxy?url=' + encodeURIComponent(m.url) + '&filename=' + encodeURIComponent(`godxshadow_${data.shortcode || 'video'}.mp4`) + '&inline=1';
      const poster = data.thumbnail ? ` poster="${escapeHtml(data.thumbnail)}"` : '';
      return `<video class="inline-player" controls preload="metadata" playsinline${poster} src="${vsrc}"></video>`;
    }).join('');

    dlResult.innerHTML = `<div class="result-card">
      ${data.thumbnail ? `<img class="result-thumb" src="${escapeHtml(data.thumbnail)}" alt="thumbnail" loading="lazy" onerror="this.style.display='none'"/>` : ''}
      <div class="result-info">
        <div class="result-ok"><span class="pulse-dot"></span> FETCH SUCCESSFUL${data.carousel ? ' · CAROUSEL (' + (data.medias || []).length + ' ITEMS)' : ''}</div>
        <div class="result-author">@${escapeHtml(data.author || 'instagram')}</div>
        ${data.caption ? `<div class="result-cap">${escapeHtml(data.caption)}</div>` : ''}
        ${rows || '<div class="result-cap">Media list empty — filter change karke retry karo.</div>'}
        ${players}
        ${data.engines && data.engines.length ? `<div class="engines-line">⚙ via ${escapeHtml(data.engines.join(' + '))}</div>` : ''}
        ${data.message && data.partial ? `<div class="partial-note">ℹ️ ${escapeHtml(data.message)}</div>` : ''}
        ${unlockHtml}
        ${data.partial && data.fastdlUrl ? `
        <div class="bridge-box">
          <div class="bridge-title">🎬 ${needsUnlock ? 'OPTION 2 — ' : ''}POORI VIDEO (MP4) CHAHIYE?</div>
          <p>Instagram video files ko bots se block karta hai — isliye FastDL ka bridge use karo. Tumhara link <b>pehle se bhara</b> khulega, bas wahan captcha solve karo aur HD video le lo.</p>
          <div class="bridge-btns">
            <a class="btn-fastdl" href="${escapeHtml(data.fastdlUrl)}" target="_blank" rel="noopener">⚡ GET MP4 via FASTDL ↗</a>
            <button class="btn-view" data-copy="${escapeHtml(data.source || '')}">📋 Copy link</button>
          </div>
        </div>` : ''}
        ${data.previewFallback ? '<div class="demo-note">⚡ PREVIEW MODE — server connected nahi hai, isliye sample media dikh raha hai. Real downloads ke liye <b>Live Preview (GodxShadow Neon Site)</b> tab me kholo.</div>' : data.demo ? '<div class="demo-note">⚡ DEMO MODE — ye sample media hai. Real public Instagram link paste karo for original content.</div>' : ''}
      </div>
    </div>`;
    dlResult.classList.add('show');
    dlResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showError(title, html, data) {
    data = data || {};
    const preview = (data.thumbnail || data.author) ? `
      <div class="err-preview">
        ${data.thumbnail ? `<img src="${escapeHtml(data.thumbnail)}" alt="post preview" loading="lazy" onerror="this.style.display='none'"/>` : ''}
        <div class="err-preview-meta">
          <div class="err-found">✔ POST FOUND${data.author ? ' · @' + escapeHtml(data.author) : ''}</div>
          <div class="err-src">${escapeHtml((data.source || '').slice(0, 80))}</div>
        </div>
      </div>` : '';
    const isVidKind = data.kind === 'reel' || data.kind === 'tv';
    const unlockHtml = (isVidKind && data.shortcode && data.source) ? unlockPanelHtml(data.source, data.shortcode) : '';
    const bridge = data.fastdlUrl ? `
      <div class="bridge-box err-bridge">
        <div class="bridge-title">⚡ ${unlockHtml ? 'OPTION 2 — ' : ''}FASTDL BRIDGE — 1 CLICK ME DOWNLOAD</div>
        <p>Tumhara link FastDL par <b>pehle se bhara + auto-search</b> ke saath khulega. Wahan captcha solve karo → HD video/photo turant milega.</p>
        <div class="bridge-btns">
          <a class="btn-fastdl" href="${escapeHtml(data.fastdlUrl)}" target="_blank" rel="noopener">⚡ OPEN IN FASTDL ↗</a>
          <button class="btn-view" data-copy="${escapeHtml(data.source || urlInput.value)}">📋 Copy link</button>
        </div>
      </div>` : '';
    const engLine = (data.engines && data.engines.length) ? `<div class="engines-line">⚙ tried: ${escapeHtml(data.engines.join(' + '))}</div>` : '';
    if (data.debug) { try { console.log('[GodxShadow debug]', JSON.stringify(data.debug)); } catch (e) {} }
    dlError.innerHTML = `<b>⛔ ${escapeHtml(title)}</b><br/>${html}${engLine}${preview}${unlockHtml}${bridge}`;
    dlError.classList.add('show');
    showToast(title, true);
  }

  // copy-link + unlock buttons (result + error cards, event delegation)
  document.addEventListener('click', async (e) => {
    const uo = e.target.closest('[data-unlock-open]');
    if (uo) { handleUnlockOpen(uo); return; }
    const ug = e.target.closest('[data-unlock-go]');
    if (ug) { handleUnlockGo(ug); return; }
    const up = e.target.closest('[data-unlock-paste]');
    if (up) { handleUnlockPaste(up); return; }
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const txt = btn.getAttribute('data-copy') || '';
    try { await navigator.clipboard.writeText(txt); showToast('📋 Link copied!'); }
    catch { showToast('Copy failed — manually copy karo', true); }
  });
})();
