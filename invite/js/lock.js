/* ==========================================================================
   LOCK SCREEN — crimson HUD spec
   Password 'Shadow' · 3 wrong attempts → 30s cooldown (horizontal shake) ·
   valid entry → every red element transitions to neon emerald-cyan
   (#00FFA3 / #00E5FF), holds 1.0s ("ACCESS GRANTED"), then the curtain
   closes and the writer page opens.
   ========================================================================== */
(function () {
  'use strict';

  const PASSWORD = 'Shadow';
  const TARGET = 'write.html';
  const MAX_ATTEMPTS = 3;
  const COOLDOWN_MS = 30000;
  const HOLD_MS = 1000;          // spec: hold the green state for 1.0 second

  const $ = (s) => document.querySelector(s);

  document.addEventListener('DOMContentLoaded', () => {
    const form = $('#lockForm');
    if (!form) return;

    const input = $('#pw');
    const eye = $('#pwEye');
    const msg = $('#lockMsg');
    const caps = $('#capsHint');
    const btn = $('#unlockBtn');
    const stateEl = $('#lockState');
    const alt = $('#lockAlt');

    let unlocking = false;
    let cooldownTimer = null;

    /* Already-unlocked session: offer the shortcut link */
    try {
      if (sessionStorage.getItem('nv_unlocked') === '1') alt.hidden = false;
    } catch (e) {}

    /* ---------- show / hide password (CSS-drawn eye opens & closes) ---------- */
    eye.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.classList.toggle('showing', show);
      eye.setAttribute('aria-pressed', String(show));
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      input.focus();
    });

    /* ---------- Caps Lock hint ---------- */
    ['keydown', 'keyup'].forEach((ev) =>
      input.addEventListener(ev, (e) => {
        if (typeof e.getModifierState === 'function') caps.hidden = !e.getModifierState('CapsLock');
      })
    );

    /* ---------- attempt counter + 30s cooldown (survives a reload) ---------- */
    function readAttempts() {
      try { return JSON.parse(sessionStorage.getItem('shadowlock.attempts') || '{"n":0,"until":0}'); }
      catch (e) { return { n: 0, until: 0 }; }
    }
    function writeAttempts(a) {
      try { sessionStorage.setItem('shadowlock.attempts', JSON.stringify(a)); } catch (e) {}
    }

    function enterCooldown(until) {
      input.disabled = true;
      btn.disabled = true;
      msg.classList.remove('ok');
      form.classList.remove('shake');
      void form.offsetWidth;                       // horizontal shake feedback
      form.classList.add('shake');

      const tick = () => {
        const remain = until - Date.now();
        if (remain <= 0) {
          clearInterval(cooldownTimer);
          cooldownTimer = null;
          writeAttempts({ n: 0, until: 0 });
          input.disabled = false;
          btn.disabled = false;
          msg.textContent = 'Cooldown over — try again.';
          input.focus();
          return;
        }
        msg.textContent = 'Locked — too many wrong attempts. Try again in ' +
          Math.max(1, Math.ceil(remain / 1000)) + 's';
      };
      tick();
      cooldownTimer = setInterval(tick, 250);
    }

    const saved = readAttempts();
    if (saved.until > Date.now()) enterCooldown(saved.until);

    function fail() {
      const a = readAttempts();
      a.n += 1;
      if (a.n >= MAX_ATTEMPTS) {
        writeAttempts({ n: 0, until: Date.now() + COOLDOWN_MS });
        enterCooldown(Date.now() + COOLDOWN_MS);
        return;
      }
      writeAttempts(a);
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      msg.classList.remove('ok');
      msg.textContent = a.n === 1
        ? 'Incorrect password — try again.'
        : `Incorrect password (${a.n}/${MAX_ATTEMPTS} attempts). Hint: it is what a rose becomes at midnight.`;
      input.select();
      input.focus();
    }

    /* ---------- 1-second emerald-cyan ACCESS GRANTED transition ---------- */
    function unlock() {
      if (unlocking) return;
      unlocking = true;

      if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
      writeAttempts({ n: 0, until: 0 });
      try {
        sessionStorage.setItem('nv_unlocked', '1');
        sessionStorage.setItem('nv_curtain', '1');
      } catch (e) {}

      document.body.classList.add('stage-granted');   // flips every --lk-* variable
      stateEl.textContent = 'ACCESS GRANTED';
      msg.classList.add('ok');
      msg.textContent = 'Access granted';
      btn.disabled = true;
      input.disabled = true;
      eye.disabled = true;

      setTimeout(() => {
        if (window.NexoraFX) window.NexoraFX.curtainClose();
      }, HOLD_MS);
      setTimeout(() => { window.location.href = TARGET; }, HOLD_MS + 950);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (unlocking || btn.disabled) return;
      const val = input.value;
      if (!val) {
        msg.classList.remove('ok');
        msg.textContent = 'Enter the master password.';
        input.focus();
        return;
      }
      if (val === PASSWORD) unlock();
      else fail();
    });
  });
})();
