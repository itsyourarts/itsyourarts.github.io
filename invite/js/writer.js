/* ==========================================================================
   NEVTA BOOK — writer.js
   The dedicated entry-writing page:
     • Enter in any field  → focus jumps to the next field
     • Enter on last field → same as "Save & next"
     • Save & next         → stores the entry and clears for the next one
     • ◀ Previous entry    → reopens the last saved entry for editing
     • ◀ Older / Newer ▶   → walk through saved entries while editing
     • Recent cards        → tap to open any recent entry for editing
   Shares the same localStorage store as the dashboard (home.html).
   ========================================================================== */
(function () {
  'use strict';

  const STORE_KEY = 'nevtabook.entries.v1';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const form = $('#writerForm');
  const fields = $$('[data-enter]', form);          // tab-through order = DOM order
  const msg = $('#formMsg');

  let rows = [];
  let editIdx = null;                                // null = NEW mode, else index into rows

  /* ---------- storage ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      rows = Array.isArray(arr) ? arr : [];
    } catch (e) { rows = []; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(rows)); }
    catch (e) { toast('Storage is full', 'Remove a few entries from the dashboard first.', 'err'); }
  }

  /* ---------- helpers ---------- */
  const uid = () => 'NV-' + Date.now().toString(36).toUpperCase() + '-' +
                    Math.random().toString(36).slice(2, 5).toUpperCase();
  const inr = n => { const v = Number(n || 0); return v ? '₹' + v.toLocaleString('en-IN') : '₹0'; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = v => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  function toast(title, text = '', kind = '') {
    const stack = $('#toastStack'); if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = `<div><b>${esc(title)}</b>${text ? `<small>${esc(text)}</small>` : ''}</div>`;
    stack.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3600);
  }

  const sum_all = rs => rs.reduce((a, r) => a + Number(r.amount || 0), 0);

  /* ---------- totals strip + recent cards ---------- */
  function renderMeta() {
    const amts = rows.map(r => Number(r.amount || 0));
    const sum = amts.reduce((a, b) => a + b, 0);
    const high = amts.length ? Math.max(...amts) : 0;
    const highRow = rows.find(r => Number(r.amount || 0) === high) || null;

    $('#wCount').textContent = rows.length;
    $('#wTotal').textContent = inr(sum);
    $('#wHigh').textContent  = inr(high);
    $('#wHighWho').textContent = high ? highRow.name : '—';

    // closing breakup: cash kitna, UPI kitna … + kitne log, kitna amount
    const bkCnt = {}, bkSum = {};
    rows.forEach(r => {
      const m = r.method || 'Other';
      bkCnt[m] = (bkCnt[m] || 0) + 1;
      bkSum[m] = (bkSum[m] || 0) + Number(r.amount || 0);
    });
    const methodRows = Object.keys(bkSum).map(m => ({ method: m, count: bkCnt[m], sum: bkSum[m] }))
      .sort((a, b) => b.sum - a.sum);
    $('#wBreakup').innerHTML = methodRows.map(m => `
      <div class="bk">
        <span>${esc(m.method)}</span>
        <b>${inr(m.sum)}</b>
        <i>${m.count} ${m.count === 1 ? 'entry' : 'entries'}</i>
      </div>`).join('');
    $('#wFinal').innerHTML = rows.length
      ? `Received from <b>${rows.length} ${rows.length === 1 ? 'person' : 'people'}</b> — total <b>${inr(sum_all(rows))}</b>`
      : 'Nothing saved yet.';

    const list = $('#recentList');
    const recent = rows.slice(0, 8);
    $('#recentCount').textContent = rows.length;
    $('#recentEmpty').style.display = rows.length ? 'none' : 'block';

    list.innerHTML = recent.map((r, i) => `
      <button type="button" class="rcard glass-soft ${editIdx === i ? 'is-active' : ''}" data-idx="${i}">
        <span class="rcard__n">${esc(r.name)}</span>
        <span class="rcard__a">${inr(r.amount)}</span>
        <span class="rcard__m">${esc(r.method || '')}</span>
        ${editIdx === i ? '<span class="rcard__tag">editing</span>' : ''}
      </button>`).join('');
  }

  /* ---------- form <-> row ---------- */
  function readForm() {
    const d = Object.fromEntries(new FormData(form).entries());
    return {
      name:         (d.name || '').trim(),
      fatherName:   (d.fatherName || '').trim(),
      phone:        (d.phone || '').trim(),
      address:      (d.address || '').trim().replace(/\s+/g, ' '),
      amount:       d.amount === '' ? 0 : Number(d.amount),
      method:       (d.method || 'Cash').trim(),
      note:         (d.note || '').trim()
    };
  }

  function fillForm(r) {
    form.elements.name.value       = r.name || '';
    form.elements.fatherName.value = r.fatherName || '';
    form.elements.phone.value      = r.phone || '';
    form.elements.amount.value     = r.amount == null ? '' : r.amount;
    form.elements.method.value     = r.method || 'Cash';
    form.elements.address.value    = r.address || '';
    form.elements.note.value       = r.note || '';
  }

  function resetForNew(keepContext = true) {
    const ctx = keepContext ? readForm() : null;
    form.reset();
    if (keepContext && ctx) {
      form.elements.method.value = ctx.method;   // keeps repeated writing fast
    }
    $$('.field', form).forEach(f => f.classList.remove('invalid'));
    msg.textContent = ''; msg.classList.remove('err');
  }

  function setMode() {
    const editing = editIdx !== null;
    const bar = $('#editBar');
    bar.hidden = !editing;
    $('#wTitle').textContent = editing ? `Editing entry #${rows.length - editIdx}` : 'New shagun entry';
    $('#saveBtn').innerHTML = editing ? 'Save changes' : 'Save &amp; next';
    if (editing && rows[editIdx]) {
      $('#editLabel').innerHTML =
        `Editing <b>${esc(rows[editIdx].name)}</b> — entry #${rows.length - editIdx} of ${rows.length}`;
    }
    $('#btnNewer').disabled = editing ? editIdx <= 0 : true;
    $('#btnOlder').disabled = editing ? editIdx >= rows.length - 1 : true;
    $('#prevHint').textContent = editing
      ? 'You are editing a saved entry — changes overwrite it when you save.'
      : 'Reopen the last saved entry to check or edit it.';
    renderMeta();
  }

  function openEntry(i) {
    if (i == null || !rows[i]) return;
    editIdx = i;
    fillForm(rows[i]);
    setMode();
    form.elements.name.focus();
  }

  function enterNew() {
    editIdx = null;
    resetForNew(true);
    setMode();
    form.elements.name.focus();
  }

  /* ---------- validation ---------- */
  function validate() {
    $$('.field', form).forEach(f => f.classList.remove('invalid'));
    let ok = true;
    if (!form.elements.name.value.trim()) { form.elements.name.closest('.field').classList.add('invalid'); ok = false; }
    const raw = form.elements.amount.value.trim();
    if (raw === '' || isNaN(Number(raw)) || Number(raw) < 0) {
      form.elements.amount.closest('.field').classList.add('invalid'); ok = false;
    }
    const ph = form.elements.phone.value.trim();
    if (ph && !/^[+\d][\d\s\-()]{6,17}$/.test(ph)) {
      form.elements.phone.closest('.field').classList.add('invalid'); ok = false;
    }
    if (!ok) {
      msg.textContent = 'A name and a valid amount (₹) are required.';
      msg.classList.add('err');
      const bad = $('.field.invalid input', form);
      if (bad) bad.focus();
    }
    return ok;
  }

  /* ---------- save ---------- */
  function doSave() {
    if (!validate()) return false;
    const data = readForm();

    if (editIdx !== null && rows[editIdx]) {
      const old = rows[editIdx];
      rows[editIdx] = Object.assign({}, old, data, { updatedAt: new Date().toISOString() });
      save();
      setMode();
      msg.textContent = `Entry #${rows.length - editIdx} updated — ${data.name}, ${inr(data.amount)}`;
      toast('Entry updated', `${data.name} · ${inr(data.amount)}`, 'ok');
      return true;
    }

    const row = Object.assign({ id: uid(), createdAt: new Date().toISOString() }, data);
    rows.unshift(row);
    save();
    const n = rows.length;
    resetForNew(true);
    editIdx = null;
    setMode();
    msg.textContent = `Entry #${n} saved — ${row.name}, ${inr(row.amount)}. Form is clear for the next guest.`;
    toast('Entry saved', `${row.name} · ${inr(row.amount)} · #${n}`, 'ok');
    form.elements.name.focus();
    return true;
  }

  /* ---------- Enter jumps to the next field ---------- */
  form.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const t = e.target;
    if (!t.matches('input, select')) return;
    e.preventDefault();
    const i = fields.indexOf(t);
    if (i === -1) return;
    if (i < fields.length - 1) {
      fields[i + 1].focus();
      if (fields[i + 1].select && fields[i + 1].type !== 'date') {
        // caret to the end for text inputs, nothing for selects
        if (fields[i + 1].tagName === 'INPUT' && fields[i + 1].type === 'text') {
          const el = fields[i + 1];
          setTimeout(() => el.setSelectionRange(el.value.length, el.value.length), 0);
        }
      }
    } else {
      doSave();                      // Enter on the last field = Save & next
    }
  });

  /* ---------- buttons ---------- */
  form.addEventListener('submit', e => { e.preventDefault(); doSave(); });

  $('#clearBtn').addEventListener('click', () => {
    if (editIdx !== null) enterNew();
    else resetForNew(false);
    toast('Form cleared', editIdx === null ? 'Ready for a fresh entry.' : '');
  });

  $('#btnPrev').addEventListener('click', () => {
    if (!rows.length) return toast('Nothing saved yet', 'Write and save an entry first.', 'err');
    openEntry(editIdx === null ? 0 : Math.min(editIdx + 1, rows.length - 1));
    toast('Opened for editing', rows[editIdx] ? `${rows[editIdx].name} · ${inr(rows[editIdx].amount)}` : '');
  });

  $('#btnOlder').addEventListener('click', () => openEntry(Math.min((editIdx ?? 0) + 1, rows.length - 1)));
  $('#btnNewer').addEventListener('click', () => {
    const i = (editIdx ?? 0) - 1;
    if (i < 0) enterNew(); else openEntry(i);
  });
  $('#btnNew').addEventListener('click', enterNew);

  $('#recentList').addEventListener('click', e => {
    const card = e.target.closest('.rcard');
    if (!card) return;
    openEntry(Number(card.dataset.idx));
    toast('Opened for editing', `${rows[editIdx].name} · ${inr(rows[editIdx].amount)}`);
  });

  /* ---------- End button: book finished → choose a format → instant download on the dashboard ---------- */
  const fmtModal = $('#fmtModal');
  $('#endBtn').addEventListener('click', () => {
    // don't lose a half-written entry — if the form has content, save it first
    if (form.elements.name.value.trim() || form.elements.amount.value.trim()) {
      if (!doSave()) return;               // invalid → its own error shows; do not end
    }
    if (!rows.length) return toast('Nothing to export yet', 'Write and save at least one entry first.', 'err');
    fmtModal.hidden = false;
  });
  $$('[data-close]', fmtModal).forEach(el =>
    el.addEventListener('click', () => { fmtModal.hidden = true; }));
  $$('#fmtPick .fmt').forEach(b => b.addEventListener('click', () => {
    const fmt = b.dataset.fmt;
    fmtModal.hidden = true;
    try { sessionStorage.setItem('nv_finish_export', fmt); } catch (e) {}
    toast('Finishing up', fmt.toUpperCase() + ' will download on the dashboard in a moment…');
    window.location.href = 'home.html';
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && fmtModal && !fmtModal.hidden) fmtModal.hidden = true;
  });

  /* ---------- lock again ---------- */
  $('#lockAgain').addEventListener('click', () => {
    try { sessionStorage.removeItem('nv_unlocked'); sessionStorage.removeItem('nv_curtain'); } catch (e) {}
    window.location.href = 'index.html';
  });

  /* ---------- nav burger ---------- */
  const burger = $('#navBurger'), links = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  /* cursor glow (desktop only) */
  if (!window.matchMedia('(pointer:coarse)').matches) {
    const g = $('#cursorGlow'); let raf = null;
    window.addEventListener('mousemove', e => {
      document.body.classList.add('cursor-on');
      if (raf) return;
      raf = requestAnimationFrame(() => {
        g.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- project / nevta name gate (asked before starting; page opens after) ---------- */
  const PROJ_KEY = 'nevtabook.project.v1';
  function getProject() {
    try { return JSON.parse(localStorage.getItem(PROJ_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveProjectName() {
    const v = $('#projNameInput').value.trim();
    const nm = $('#nameMsg');
    if (!v) {
      nm.textContent = 'Please type a name for this nevta / project.';
      nm.classList.add('err');
      return;
    }
    const prev = getProject() || {};
    try {
      localStorage.setItem(PROJ_KEY, JSON.stringify({
        name: v.slice(0, 80),
        createdAt: prev.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {}
    $('#nameModal').hidden = true;
    toast('Register named', v + ' — the dashboard shows your entries under this name.', 'ok');
    form.elements.name.focus({ preventScroll: true });
  }
  $('#projNameSave').addEventListener('click', saveProjectName);
  $('#projNameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); saveProjectName(); }
  });

  /* ---------- init ---------- */
  function init() {
    load();
    resetForNew(false);
    setMode();
    const p = getProject();
    if (!p || !p.name) {
      $('#nameModal').hidden = false;   // name first — the entry page opens after it
      setTimeout(() => { try { $('#projNameInput').focus({ preventScroll: true }); } catch (e) {} }, 80);
    } else {
      form.elements.name.focus({ preventScroll: true });
    }
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

  /* small API for tests */
  window.NexoraWriter = {
    get rows() { return rows.slice(); },
    get editIdx() { return editIdx; },
    openEntry, enterNew, doSave
  };
})();
