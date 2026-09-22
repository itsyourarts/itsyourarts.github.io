/* ============================================================
   GODXSHADOW — hero auto-typing tagline
   js/hero.js
   ============================================================ */

window.GX_Hero = (function () {
  const LINES = [
    'Real-time WPM, raw speed, accuracy and consistency — plotted live as you type.',
    'No account, no upload.',
    'Everything runs in your browser.'
  ];
  const SPEED = { type: 34, erase: 18, hold: 1500, gap: 380 };
  let out = null, li = 0, ci = 0, phase = 'type', timer = null, running = false;

  function render() { if (out) out.textContent = LINES[li].slice(0, ci); }
  function step() {
    const line = LINES[li];
    if (phase === 'type') {
      if (ci < line.length) { ci++; render(); schedule(SPEED.type); return phase; }
      phase = 'hold'; schedule(SPEED.hold); return phase;
    }
    if (phase === 'hold') { phase = 'erase'; schedule(SPEED.erase); return phase; }
    if (phase === 'erase') {
      if (ci > 0) { ci--; render(); schedule(SPEED.erase); return phase; }
      phase = 'gap'; schedule(SPEED.gap); return phase;
    }
    li = (li + 1) % LINES.length; ci = 0; phase = 'type'; render(); schedule(SPEED.type); return phase;
  }
  function schedule(ms) { if (!running) return; clearTimeout(timer); timer = setTimeout(step, ms); }
  function start() {
    out = document.getElementById('heroText');
    if (!out) return;
    const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (mq && mq.matches) { out.textContent = LINES[0]; return; }
    li = 0; ci = 0; phase = 'type'; running = true; render(); schedule(SPEED.type);
  }
  function stop() { running = false; clearTimeout(timer); timer = null; }

  // Full site view: fullscreen the whole document, not the typing area.
  function isSiteFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function updateFullscreenButton() {
    const button = document.getElementById('typingFullscreenBtn');
    if (!button) return;
    button.textContent = isSiteFullscreen() ? 'Exit Full View' : 'Full View';
    button.setAttribute('aria-label', isSiteFullscreen() ? 'Exit full view' : 'Enter full view');
  }
  function toggleSiteFullscreen() {
    if (isSiteFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
      return;
    }
    const page = document.documentElement;
    const request = page.requestFullscreen || page.webkitRequestFullscreen;
    if (request) {
      const result = request.call(page);
      if (result && result.catch) result.catch(function () {});
    }
  }
  function setupFullscreen() {
    if (document.getElementById('typingFullscreenBtn')) return;
    const button = document.createElement('button');
    button.id = 'typingFullscreenBtn';
    button.type = 'button';
    button.textContent = 'Full View';
    button.setAttribute('aria-label', 'Enter full view');
    button.style.cssText = [
      'position:fixed', 'top:78px', 'right:18px', 'z-index:9999',
      'padding:10px 18px', 'border-radius:999px',
      'border:1px solid rgba(255,90,130,.9)',
      'background:linear-gradient(135deg,rgba(255,28,82,.96),rgba(255,92,120,.92))',
      'color:#fff', 'font-weight:800', 'font-size:11px',
      'letter-spacing:.14em', 'text-transform:uppercase', 'cursor:pointer',
      'box-shadow:0 0 14px rgba(255,70,110,.9),0 0 28px rgba(255,70,110,.45)',
      'transition:transform .18s ease,box-shadow .18s ease', 'outline:none'
    ].join(';');
    button.addEventListener('mouseenter', function () {
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 0 20px rgba(255,90,130,1),0 0 34px rgba(255,90,130,.6)';
    });
    button.addEventListener('mouseleave', function () {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 0 14px rgba(255,70,110,.9),0 0 28px rgba(255,70,110,.45)';
    });
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      toggleSiteFullscreen();
    });
    document.body.appendChild(button);
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    // Any page click automatically enters full site view, except the toggle itself.
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('#typingFullscreenBtn')) return;
      if (!isSiteFullscreen()) toggleSiteFullscreen();
    });
    updateFullscreenButton();
  }

  document.addEventListener('DOMContentLoaded', function () { start(); setupFullscreen(); });
  return {
    LINES: LINES, step: step, start: start, stop: stop,
    state: function () { return { line: li, chars: ci, phase: phase, text: LINES[li].slice(0, ci) }; }
  };
})();
