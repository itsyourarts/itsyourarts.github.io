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
   /* ==========================================================================
   NAV — Enter ya double-space dabane par agla field
   (autocap.js ke sabse neeche, alag block)
   ========================================================================== */
(function () {
  'use strict';

  var ENTER_IN_TEXTAREA_NEXT = false;   // true kar de to address box me bhi Enter = agla field
  var BUSY = '__navBusy';

  function isField(el) {
    if (!el || el.disabled || el.readOnly) return false;
    var t = (el.getAttribute('type') || 'text').toLowerCase();
    if (t === 'checkbox' || t === 'radio' || t === 'file' || t === 'submit' || t === 'button') return false;
    if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return true;
    return ['text', 'tel', 'number', 'search', 'date', 'url', 'email'].indexOf(t) > -1;
  }

  function inApp(el) {
    return !!(el.form || el.id === 'projNameInput');
  }

  function fieldList(form) {
    return Array.prototype.filter.call(form.querySelectorAll('input, textarea, select'), isField);
  }

  /* agla field → focus; agar aakhri field hai to "Add entry" dab jaye */
  function goNext(el) {
    var form = el.form;
    if (!form) return false;
    var list = fieldList(form);
    var i = list.indexOf(el);
    if (i < 0) return false;
    var nx = list[i + 1];
    if (nx) {
      nx.focus();
      try { nx.setSelectionRange(nx.value.length, nx.value.length); } catch (_) {}
      return true;
    }
    var btn = form.querySelector('#homeSaveBtn, button[type="submit"], .btn--neon');
    if (btn) { btn.click(); return true; }
    return false;
  }

  /* ---- Enter ---- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing || e.keyCode === 229) return;
    var el = e.target;
    if (!isField(el) || !inApp(el)) return;
    if (el.tagName === 'SELECT') return;
    if (el.tagName === 'TEXTAREA' && !ENTER_IN_TEXTAREA_NEXT && !(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();          // form ka default submit / reload rok do
    goNext(el);
  }, true);

  /* ---- double space ---- */
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!isField(el) || !inApp(el)) return;
    if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return;
    if (el[BUSY] || e.isComposing) return;
    if (e.inputType !== 'insertText' || e.data !== ' ') return;

    var v = el.value, p = el.selectionStart;
    if (el.selectionStart !== el.selectionEnd) return;
    if (p < 2 || v.slice(p - 2, p) !== '  ') return;   // sirf jab do space lagatar lage

    el[BUSY] = true;
    el.value = v.slice(0, p - 2) + v.slice(p);          // dono space hata do
    try { el.setSelectionRange(p - 2, p - 2); } catch (_) {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el[BUSY] = false;

    goNext(el);
  }, true);

  /* mobile keyboard par bhi "Next" button dikhe */
  document.addEventListener('focusin', function (e) {
    var el = e.target;
    if (isField(el) && inApp(el)) el.setAttribute('enterkeyhint', 'next');
  }, true);
})();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* gate modal / rename modal baad me khulta hai → dobara try karo */
  document.addEventListener('click', function () { setTimeout(init, 120); }, true);
})();
