/* ============================================================
   GODXSHADOW — hero auto-typing tagline
   js/hero.js

   Types each line, holds it, erases it, then moves to the next.
   After the last line it loops back to the first, forever.

   The loop is a small state machine driven by setTimeout, and
   GX_Hero.step() advances it one event at a time so the whole
   cycle can be tested deterministically.
   ============================================================ */

window.GX_Hero = (function () {

  const LINES = [
    'Real-time WPM, raw speed, accuracy and consistency — plotted live as you type.',
    'No account, no upload.',
    'Everything runs in your browser.'
  ];

  const SPEED = { type: 34, erase: 18, hold: 1500, gap: 380 };

  let out = null;
  let li = 0;          // which line
  let ci = 0;          // characters currently shown
  let phase = 'type';  // type | hold | erase | gap
  let timer = null;
  let running = false;

  function render() {
    if (out) out.textContent = LINES[li].slice(0, ci);
  }

  /** One transition of the state machine. Returns the new phase. */
  function step() {
    const line = LINES[li];

    if (phase === 'type') {
      if (ci < line.length) { ci++; render(); schedule(SPEED.type); return phase; }
      phase = 'hold';
      schedule(SPEED.hold);
      return phase;
    }

    if (phase === 'hold') {
      phase = 'erase';
      schedule(SPEED.erase);
      return phase;
    }

    if (phase === 'erase') {
      if (ci > 0) { ci--; render(); schedule(SPEED.erase); return phase; }
      phase = 'gap';
      schedule(SPEED.gap);
      return phase;
    }

    // gap -> next line, wrapping back to the first after the last
    li = (li + 1) % LINES.length;
    ci = 0;
    phase = 'type';
    render();
    schedule(SPEED.type);
    return phase;
  }

  function schedule(ms) {
    if (!running) return;
    clearTimeout(timer);
    timer = setTimeout(step, ms);
  }

  function start() {
    out = document.getElementById('heroText');
    if (!out) return;

    // respect the OS "reduce motion" setting: show one line, no animation
    const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (mq && mq.matches) {
      out.textContent = LINES[0];
      return;
    }

    li = 0; ci = 0; phase = 'type';
    running = true;
    render();
    schedule(SPEED.type);
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    timer = null;
  }

  /* ---------- fullscreen controls ---------- */
  function setupFullscreen() {
    // The control is only needed on the typing test page.
    if (!document.getElementById('testView') || document.getElementById('fullscreenBtn')) return;

    const style = document.createElement('style');
    style.textContent = [
      '#fullscreenBtn{position:fixed;right:18px;bottom:18px;z-index:80}',
      '@media(max-width:760px){#fullscreenBtn{right:12px;bottom:12px;padding:10px 14px;font-size:11px}}',
      ':fullscreen body{background:#05030c}',
      ':-webkit-full-screen body{background:#05030c}'
    ].join('');
    document.head.appendChild(style);

    const button = document.createElement('button');
    button.id = 'fullscreenBtn';
    button.type = 'button';
    button.className = 'btn violet';
    button.setAttribute('aria-label', 'Enter full view');
    document.body.appendChild(button);

    function isFullscreen() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function updateLabel() {
      const active = isFullscreen();
      button.textContent = active ? '⛶ exit full view' : '⛶ full view';
      button.setAttribute('aria-label', active ? 'Exit full view' : 'Enter full view');
    }

    function enter() {
      const page = document.documentElement;
      const request = page.requestFullscreen || page.webkitRequestFullscreen;
      if (!request) return;
      const result = request.call(page);
      if (result && result.catch) result.catch(function () {});
    }

    function exit() {
      const exitMethod = document.exitFullscreen || document.webkitExitFullscreen;
      if (exitMethod) {
        const result = exitMethod.call(document);
        if (result && result.catch) result.catch(function () {});
      }
    }

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      if (isFullscreen()) exit(); else enter();
    });

    document.addEventListener('fullscreenchange', updateLabel);
    document.addEventListener('webkitfullscreenchange', updateLabel);

    // Fullscreen can only be requested from a user gesture. The first click
    // anywhere on the page therefore starts full view automatically.
    document.addEventListener('click', function (event) {
      if (!isFullscreen() && event.target !== button && !event.target.closest('#fullscreenBtn')) enter();
    });

    updateLabel();
  }

  document.addEventListener('DOMContentLoaded', function () {
    start();
    setupFullscreen();
  });

  return {
    LINES: LINES,
    step: step,
    start: start,
    stop: stop,
    /** where the machine is right now (used by the tests) */
    state: function () { return { line: li, chars: ci, phase: phase, text: LINES[li].slice(0, ci) }; }
  };
})();
