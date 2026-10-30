/* ==========================================================================
   NEVTA BOOK — fx.js
   Shared visual effects: the natural rose-petal fall and the unlock curtain.
   Used by index.html (splash), write.html and home.html.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

  /* ---------- Falling rose petals ----------
     Slow and natural: 14–30 s per petal, gentle sideways drift, tumble,
     random size/opacity/delay. Never fast, never mechanical.          */
  function petals() {
    const layer = $('#petals');
    if (!layer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const narrow = window.matchMedia('(max-width: 760px)').matches;
    const COUNT = narrow ? 16 : 34;
    const palettes = [
      'linear-gradient(140deg,#eeafb6,#e4638f 58%,#a82450)',   // rose
      'linear-gradient(140deg,#f2c4ce,#e88ca8 55%,#c22558)',   // blush rose
      'linear-gradient(140deg,#e88ca8,#c22558 60%,#670528)',   // deep rose
      'linear-gradient(140deg,#eeafb6,#d98ca5 60%,#b04a6a)'    // pale petal
    ];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const frag = document.createDocumentFragment();

    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      const w = rnd(9, 21);
      p.style.setProperty('--x',     rnd(-4, 100).toFixed(2) + 'vw');
      p.style.setProperty('--w',     w.toFixed(1) + 'px');
      p.style.setProperty('--h',     (w * rnd(1.05, 1.45)).toFixed(1) + 'px');
      p.style.setProperty('--dx',    rnd(-13, 15).toFixed(1) + 'vw');
      p.style.setProperty('--dur',   rnd(14, 30).toFixed(1) + 's');   // deliberately unhurried
      p.style.setProperty('--delay', (-rnd(0, 28)).toFixed(1) + 's');
      p.style.setProperty('--op',    rnd(0.32, 0.88).toFixed(2));
      p.style.setProperty('--pc',    palettes[i % palettes.length]);
      frag.appendChild(p);
    }
    layer.appendChild(frag);
  }

  /* ---------- Curtain ----------
     Two neon-edged panels. curtainClose() shuts them over the splash;
     the next page boots pre-closed (html.curtain-pre) and curtainOpen()
     lifts them to reveal the register.                                */
  function curtainClose() {
    const c = $('#curtain');
    if (!c) return;
    c.classList.add('close');
  }

  function curtainOpen() {
    const html = document.documentElement;
    if (!html.classList.contains('curtain-pre')) return;
    const c = $('#curtain');
    // one frame pre-closed, then glide open
    requestAnimationFrame(() => requestAnimationFrame(() => {
      html.classList.add('curtain-open');
      setTimeout(() => {
        html.classList.remove('curtain-pre', 'curtain-open');
        if (c) c.classList.remove('close');
        try { sessionStorage.removeItem('nv_curtain'); } catch (e) {}
      }, 1000);
    }));
  }

  window.NexoraFX = { petals, curtainClose, curtainOpen };

  function init() {
    petals();
    curtainOpen();
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
