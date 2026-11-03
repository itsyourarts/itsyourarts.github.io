/* ==========================================================================
   NEVTA BOOK — autocap.js
   • Har naye word ka pehla letter automatic CAPITAL (space ke baad bhi).
   • Word ke beech type karo → kuch nahi badlega.
   • Shift / CapsLock se capital likho → waisa hi rahega.
   • Backspace karke dobara small likho → small hi rahega (code nahi sudhrega).
   • Paste / autofill me bhi har word ka pehla letter capital.
   ========================================================================== */
(function () {
  'use strict';

  var HOSTS      = ['#leadForm', '#projNameInput'];  // kahan lagana hai
  var RESET_MS   = 4000;                             // itni der baad auto-capitalise wapas on
  var WORD_START = /^[\s\-–—(\[{'"]+$/;             // space / dash / bracket ke baad naya word

  function wordStart(v, pos) { return pos <= 0 || WORD_START.test(v.charAt(pos - 1)); }

  function markManual(st) {
    st.manual = true;
    clearTimeout(st.timer);
    st.timer = setTimeout(function () { st.manual = false; }, RESET_MS);
  }

  function attach(el) {
    if (el.__autocap) return;
    var st = { manual: false, timer: 0 };
    el.__autocap = st;

    el.setAttribute('autocapitalize', 'words');   // mobile keyboards ke liye bhi
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('spellcheck', 'false');

    el.addEventListener('beforeinput', function (e) {
      if (e.isComposing || !e.inputType) return;
      var data = e.data || '';

      /* delete / paste → user khud shape de raha hai */
      if (/^delete/.test(e.inputType) || e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
        markManual(st);
        return;
      }
      /* space dabaya → agla word phir se auto-capitalise */
      if (/^\s+$/.test(data)) { st.manual = false; clearTimeout(st.timer); return; }

      if (e.inputType !== 'insertText' || data.length !== 1) return;
      if (!/[a-z]/.test(data)) return;                       // uppercase = Shift/CapsLock → chhodo
      var pos = el.selectionStart;
      if (pos !== el.selectionEnd) return;                   // selection replace ho rahi hai
      if (!wordStart(el.value, pos)) return;                 // word ke beech me hai
      if (st.manual) return;                                 // user ne jaan-boojh kar small likha

      /* ek hi letter ko capital me badlo, caret ko uske baad rakho */
      e.preventDefault();
      var up = data.toUpperCase();
      var v  = el.value;
      el.value = v.slice(0, el.selectionStart) + up + v.slice(el.selectionEnd);
      try { el.setSelectionRange(el.selectionStart, el.selectionStart); } catch (_) {}
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, true);

    /* paste / autofill: poore text me har word ka pehla letter capital */
    el.addEventListener('input', function (e) {
      if (e.isComposing || !e.inputType) return;
      if (st.manual) return;
      if (!/insertFromPaste|insertFromDrop|insertReplacementText/.test(e.inputType)) return;
      var v = el.value;
      var fixed = v.replace(/(^|[\s\-–—(\[{'"])([a-z])/g, function (m, pre, ch) { return pre + ch.toUpperCase(); });
      if (fixed === v) return;
      var p = el.selectionStart;
      el.value = fixed;
      try { el.setSelectionRange(p, p); } catch (_) {}
    });

    /* field se bahar nikle to bhi ek baar sudhaar lo (auto-fill ke liye) */
    el.addEventListener('blur', function () {
      if (st.manual || !el.value) return;
      var v = el.value;
      var fixed = v.replace(/(^|[\s\-–—(\[{'"])([a-z])/g, function (m, pre, ch) { return pre + ch.toUpperCase(); });
      if (fixed !== v) el.value = fixed;
    });
  }

  function init() {
    HOSTS.forEach(function (sel) {
      var host = document.querySelector(sel);
      if (!host) return;
      if (host.tagName === 'INPUT' || host.tagName === 'TEXTAREA') { attach(host); return; }
      Array.prototype.forEach.call(host.querySelectorAll('input, textarea'), function (el) {
        var type = (el.getAttribute('type') || 'text').toLowerCase();
        if (type !== 'text' && type !== 'search' && el.tagName !== 'TEXTAREA') return;  // number/checkbox/select chhodo
        if (el.readOnly || el.disabled) return;
        attach(el);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* gate modal / rename modal baad me khulta hai → dobara try karo */
  document.addEventListener('click', function () { setTimeout(init, 120); }, true);
})();
