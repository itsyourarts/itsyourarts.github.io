/* ==========================================================================
   NEVTA BOOK — app.js
   Digital shagun register: entry form, register table, filters, live totals,
   localStorage, falling rose petals. Export logic lives in js/exports.js.
   ========================================================================== */
(function () {
  'use strict';

  const STORE_KEY = 'nevtabook.entries.v1';
  const PROJ_KEY  = 'nevtabook.project.v1';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Field schema (also used by exports.js) ---------- */
  const FIELDS = [
    { key: 'id',           label: 'Entry No.',       type: 'text'   },
    { key: 'name',         label: 'Name',            type: 'text'   },
    { key: 'fatherName',   label: "Father's Name",   type: 'text'   },
    { key: 'phone',        label: 'Phone',           type: 'text'   },
    { key: 'address',      label: 'Address',         type: 'text'   },
    { key: 'amount',       label: 'Amount (INR)',    type: 'number' },
    { key: 'method',       label: 'Given As',        type: 'text'   },
    { key: 'note',         label: 'Note',            type: 'text'   },
    { key: 'createdAt',    label: 'Recorded At',     type: 'date'   }
  ];

  const METHODS = ['Cash', 'UPI / Online', 'Cheque', 'Gold / Article gift', 'Promised (to be given later)', 'Other'];

  /* ---------- State ---------- */
  const state = {
    rows: [],
    selected: new Set(),
    search: '',
    method: '',
    editId: null          // entry being edited from the live hero panel
  };

  /* ---------- Persistence ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      state.rows = Array.isArray(arr) ? arr : [];
    } catch (e) { console.warn('Load failed:', e); state.rows = []; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.rows)); }
    catch (e) { toast('Storage is full', 'The browser has run out of space — remove a few entries.', 'err'); }
  }

  /* ---------- Helpers ---------- */
  const uid = () => 'NV-' + Date.now().toString(36).toUpperCase() + '-' +
                    Math.random().toString(36).slice(2, 5).toUpperCase();

  const inr = n => {
    const v = Number(n || 0);
    return v ? '₹' + v.toLocaleString('en-IN') : '₹0';
  };

  const todayISO = () => {
    const d = new Date(), p = x => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  const fmtDate = v => {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d)) return String(v);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fmtDateTime = v => {
    if (!v) return '—';
    const d = new Date(v);
    return isNaN(d) ? String(v) :
      d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function toast(title, msg = '', kind = '') {
    const stack = $('#toastStack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.innerHTML = `<div><b>${esc(title)}</b>${msg ? `<small>${esc(msg)}</small>` : ''}</div>`;
    stack.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3800);
  }

  /* Neon tag colour per method */
  function methodClass(m) {
    const s = String(m || '');
    if (s.startsWith('Cash'))     return 'st-Cash';
    if (s.startsWith('UPI'))      return 'st-UPI';
    if (s.startsWith('Cheque'))   return 'st-Check';
    if (s.startsWith('Gold'))     return 'st-Gift';
    if (s.startsWith('Promised')) return 'st-Due';
    return 'st-Other';
  }

  /* ---------- Filtering ---------- */
  function visibleRows() {
    const q = state.search.trim().toLowerCase();
    return state.rows.filter(r => {
      if (state.method && r.method !== state.method) return false;
      if (!q) return true;
      return ['name', 'fatherName', 'phone', 'address', 'note']
        .some(k => String(r[k] || '').toLowerCase().includes(q));
    });
  }

  /* ---------- Totals ---------- */
  function totals(rows) {
    const amts = rows.map(r => Number(r.amount || 0));
    const sum  = amts.reduce((a, b) => a + b, 0);
    const high = amts.length ? Math.max(...amts) : 0;
    const low  = amts.length ? Math.min(...amts) : 0;
    const highRow = rows.find(r => Number(r.amount || 0) === high) || null;

    const by = { method: {} };
    const cnt = { method: {} };
    rows.forEach(r => {
      const m = r.method || 'Other';
      by.method[m] = (by.method[m] || 0) + Number(r.amount || 0);
      cnt.method[m] = (cnt.method[m] || 0) + 1;
    });
    const methodRows = Object.keys(by.method)
      .map(m => ({ method: m, count: cnt.method[m], sum: by.method[m] }))
      .sort((a, b) => b.sum - a.sum);

    const cash   = rows.filter(r => String(r.method || '').startsWith('Cash'));
    const online = rows.filter(r => String(r.method || '').startsWith('UPI'));

    return {
      count: rows.length, sum, high, low,
      avg: rows.length ? Math.round(sum / rows.length) : 0,
      highWho: highRow ? highRow.name : '—',
      cashSum: cash.reduce((a, r) => a + Number(r.amount || 0), 0), cashN: cash.length,
      upiSum: online.reduce((a, r) => a + Number(r.amount || 0), 0), upiN: online.length,
      byMethod: by.method, methodRows, people: rows.length
    };
  }

  /* ---------- Render ---------- */
  function render() {
    const body = $('#tableBody'), foot = $('#tableFoot');
    if (!body) return;

    const rows = visibleRows();
    const tAll = totals(state.rows);
    const tVis = totals(rows);

    $('#emptyState').style.display = rows.length ? 'none' : 'block';
    $('#rowCount').textContent = state.rows.length + ' entries';
    $('#rowTotal').textContent = inr(tAll.sum) + ' total';

    body.innerHTML = rows.map((r, i) => `
      <tr data-id="${esc(r.id)}" class="${state.selected.has(r.id) ? 'is-sel' : ''}">
        <td><input type="checkbox" class="row-check" ${state.selected.has(r.id) ? 'checked' : ''} aria-label='Select ${esc(r.name)}'/></td>
        <td class="idx">${i + 1}</td>
        <td><b>${esc(r.name)}</b></td>
        <td>${esc(r.fatherName || '—')}</td>
        <td class="mono">${esc(r.phone || '—')}</td>
        <td class="addr" title='${esc(r.address || '')}'>${esc(r.address || '—')}</td>
        <td><span class="st ${methodClass(r.method)}">${esc(r.method || '—')}</span></td>
        <td class="note">${esc(r.note || '—')}</td>
        <td class="dt">${esc(fmtDateTime(r.createdAt))}</td>
        <td class="num ta-r">${inr(r.amount)}</td>
        <td><button class="del-row" type="button" title="Remove entry" aria-label='Remove the entry for ${esc(r.name)}'></button></td>
      </tr>`).join('');

    foot.innerHTML = rows.length ? `
      <tr>
        <td colspan="9" class="ta-r"><b>GRAND TOTAL (${rows.length} ${rows.length === 1 ? 'entry' : 'entries'} shown)</b></td>
        <td class="num ta-r"><b>${inr(tVis.sum)}</b></td>
        <td></td>
      </tr>` : '';

    // Top totals strip
    $('#tTotal').textContent   = inr(tAll.sum);
    $('#tEntries').textContent = `${tAll.count} ${tAll.count === 1 ? 'entry' : 'entries'} in the book`;
    $('#tAvg').textContent     = inr(tAll.avg);
    $('#tHigh').textContent    = inr(tAll.high);
    $('#tHighWho').textContent = tAll.high ? tAll.highWho : '—';
    $('#tCash').textContent    = inr(tAll.cashSum);
    $('#tCashN').textContent   = `${tAll.cashN} entries`;
    $('#tUpi').textContent     = inr(tAll.upiSum);
    $('#tUpiN').textContent    = `${tAll.upiN} entries`;

    // closing breakup: kitna cash se, kitna UPI se … + kitne log, kitna amount
    const bk = $('#breakupGrid');
    if (bk) {
      bk.innerHTML = tVis.methodRows.map(m => `
        <div class="bk">
          <span>${esc(m.method)}</span>
          <b>${inr(m.sum)}</b>
          <i>${m.count} ${m.count === 1 ? 'entry' : 'entries'}</i>
        </div>`).join('');
      $('#breakupFinal').innerHTML = rows.length
        ? `Received from <b>${tVis.count} ${tVis.count === 1 ? 'person' : 'people'}</b> — total <b>${inr(tVis.sum)}</b>`
        : 'No entries in this view yet.';
    }

    const sel = state.selected.size;
    $('#selInfo').textContent = `${sel} selected · ${rows.length} shown`;
    const all = $('#checkAll');
    if (all) {
      all.checked = rows.length > 0 && rows.every(r => state.selected.has(r.id));
      all.indeterminate = !all.checked && rows.some(r => state.selected.has(r.id));
    }
    renderMock();
    renderProject();
    if (window.NexoraExports && NexoraExports.syncCounts) NexoraExports.syncCounts();
  }

  /* ---------- Live hero panel (the 3-dot window shows the real book) ---------- */
  function mockTagClass(m) {
    const s = String(m || '');
    if (s.startsWith('Cash')) return 'tag--magenta';
    if (s.startsWith('UPI'))  return 'tag--cyan';
    return 'tag--violet';
  }

  function renderMock() {
    const rowsBox = $('#mockRows');
    if (!rowsBox) return;
    const t = totals(state.rows);

    $('#mockTotal').textContent   = inr(t.sum);
    $('#mockEntries').textContent = String(t.count);
    $('#mockHigh').textContent    = inr(t.high);
    $('#mockHighWho').textContent = t.high ? t.highWho : 'Largest gift';

    // one bar per method — the mini chart now shows the real breakup
    const mr = t.methodRows.slice(0, 8);
    const max = mr.length ? mr[0].sum : 0;
    $('#mockChart').innerHTML = mr.map(m =>
      `<span style="--h:${Math.max(10, Math.round((m.sum / max) * 92))}%" title="${esc(m.method)} — ${inr(m.sum)}"></span>`
    ).join('');

    // latest saved entries, newest first, each with View / Edit / Delete
    const list = state.rows.slice(0, 6);
    $('#mockEmpty').style.display = list.length ? 'none' : 'block';
    rowsBox.innerHTML = list.map(r => `
      <div class="mrow" data-id="${esc(r.id)}">
        <i class="tag ${mockTagClass(r.method)}">${esc(r.method || '—')}</i>
        <span class="mrow__who"><b>${esc(r.name)}</b><i>${inr(r.amount)} · <span class="dt">${esc(fmtDateTime(r.createdAt))}</span></i></span>
        <span class="mrow__acts">
          <button class="mbtn" type="button" data-act="view" title="View this entry in the register table">View</button>
          <button class="mbtn" type="button" data-act="edit" title="Edit this entry in the form">Edit</button>
          <button class="mbtn mbtn--del" type="button" data-act="del" title="Delete this entry">Delete</button>
        </span>
      </div>`).join('');
  }

  function setHomeBtn(label) { const b = $('#homeSaveBtn'); if (b) b.textContent = label; }

  function startEdit(row) {
    state.editId = row.id;
    const form = $('#leadForm');
    form.elements.name.value       = row.name || '';
    form.elements.fatherName.value = row.fatherName || '';
    form.elements.phone.value      = row.phone || '';
    form.elements.amount.value     = row.amount == null ? '' : row.amount;
    form.elements.method.value     = row.method || METHODS[0];
    form.elements.address.value    = row.address || '';
    form.elements.note.value       = row.note || '';
    setHomeBtn('Update entry');
    const msg = $('#formMsg');
    msg.classList.remove('err');
    msg.textContent = `Editing — ${row.name}. Change the fields, then press Update entry.`;
    const reg = $('#register');
    if (reg && reg.scrollIntoView) reg.scrollIntoView({ behavior: 'smooth' });
    form.elements.name.focus();
    toast('Opened for editing', `${row.name} · ${inr(row.amount)}`);
  }

  function cancelEdit() {
    if (state.editId === null) return;
    state.editId = null;
    setHomeBtn('Add entry');
    const msg = $('#formMsg');
    msg.textContent = ''; msg.classList.remove('err');
  }

  function viewRow(id) {
    // make sure the entry is not hidden behind a filter, then highlight its table row
    if (state.search || state.method) {
      state.search = state.method = '';
      $('#searchInput').value = '';
      $('#methodFilter').value = '';
    }
    render();
    const tr = $(`#tableBody tr[data-id="${id}"]`);
    if (!tr) return;
    if (tr.scrollIntoView) tr.scrollIntoView({ block: 'center', behavior: 'smooth' });
    $$('#tableBody tr.row-flash').forEach(x => x.classList.remove('row-flash'));
    tr.classList.add('row-flash');
    setTimeout(() => tr.classList.remove('row-flash'), 1800);
    toast('Showing entry', 'Highlighted in the register table below.');
  }

  function bindMock() {
    const rowsBox = $('#mockRows');
    if (!rowsBox) return;

    rowsBox.addEventListener('click', e => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const mrow = btn.closest('.mrow');
      const id = mrow && mrow.dataset.id;
      const row = state.rows.find(r => r.id === id);
      if (!row) return;
      const act = btn.dataset.act;

      if (act === 'del') {
        state.rows = state.rows.filter(r => r.id !== id);
        state.selected.delete(id);
        if (state.editId === id) cancelEdit();
        save(); render();
        toast('Entry removed', `${row.name} · ${inr(row.amount)}`, 'err');
      } else if (act === 'edit') {
        startEdit(row);
      } else if (act === 'view') {
        viewRow(id);
      }
    });

    const ms = $('#mockSave');
    if (ms) ms.addEventListener('click', () => {
      const reg = $('#register');
      if (reg && reg.scrollIntoView) reg.scrollIntoView({ behavior: 'smooth' });
      $('#leadForm').elements.name.focus();
      toast('Ready to save', 'Fill the form — the entry lands in this panel instantly.');
    });
  }

  /* ---------- Project / nevta name (asked before starting; shown everywhere) ---------- */
  let nameMode = 'gate';

  function getProject() {
    try { return JSON.parse(localStorage.getItem(PROJ_KEY) || 'null'); } catch (e) { return null; }
  }
  function projectName() { const p = getProject(); return p && p.name ? String(p.name) : ''; }
  function setProject(name) {
    const prev = getProject() || {};
    try {
      localStorage.setItem(PROJ_KEY, JSON.stringify({
        name,
        createdAt: prev.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {}
  }
  function renderProject() {
    const n = projectName();
    const chip = $('#projChip');
    if (chip) { chip.textContent = n; chip.hidden = !n; }
    const rn = $('#renameProj');
    if (rn) rn.hidden = !n;
    const bar = $('#mockProj');
    if (bar) bar.textContent = 'nevta-book.app / ' + (n || 'live register');
  }
  function openNameModal(mode) {
    const m = $('#nameModal'); if (!m) return;
    nameMode = mode;
    $('#projNameInput').value = mode === 'rename' ? projectName() : '';
    $('#projNameSave').textContent = mode === 'rename' ? 'Save name' : 'Start the book';
    const x = $('#nameModalX'); if (x) x.hidden = mode !== 'rename';
    const msg = $('#nameMsg');
    msg.textContent = ''; msg.classList.remove('err');
    m.hidden = false;
    setTimeout(() => $('#projNameInput').focus(), 60);
  }
  function saveProjectName() {
    const v = $('#projNameInput').value.trim();
    const msg = $('#nameMsg');
    if (!v) {
      msg.textContent = 'Please type a name for this nevta / project.';
      msg.classList.add('err');
      return;
    }
    setProject(v.slice(0, 80));
    $('#nameModal').hidden = true;
    renderProject();
    toast(nameMode === 'rename' ? 'Register renamed' : 'Register named',
          v + ' — entries and export files now carry this name.', 'ok');
  }
  function bindProject() {
    renderProject();
    if (!projectName()) openNameModal('gate');
    const sv = $('#projNameSave');
    if (sv) sv.addEventListener('click', saveProjectName);
    const inp = $('#projNameInput');
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveProjectName(); } });
    const rn = $('#renameProj');
    if (rn) rn.addEventListener('click', () => openNameModal('rename'));
    const nm = $('#nameModal');
    if (nm) nm.addEventListener('click', e => {
      if (nameMode === 'rename' && e.target.closest('[data-close]')) nm.hidden = true;
    });
  }

  /* ---------- Form ---------- */
  function readForm(form) {
    const d = Object.fromEntries(new FormData(form).entries());
    return {
      name:         (d.name || '').trim(),
      fatherName:   (d.fatherName || '').trim(),
      phone:        (d.phone || '').trim(),
      address:      (d.address || '').trim().replace(/\s+/g, ' '),
      amount:       d.amount === '' ? 0 : Number(d.amount),
      method:       (d.method || METHODS[0]).trim(),
      note:         (d.note || '').trim()
    };
  }

  function onSubmit(e) {
    e.preventDefault();
    trySave(e.target);
  }

  /* Validates + stores. In edit mode (opened from the panel) it updates the
     existing entry in place instead of creating a new one. Returns the row,
     or null when validation failed. */
  function trySave(form) {
    const msg = $('#formMsg');
    msg.classList.remove('err');
    $$('.field', form).forEach(f => f.classList.remove('invalid'));

    let ok = true;
    if (!form.elements.name.value.trim()) { form.elements.name.closest('.field').classList.add('invalid'); ok = false; }

    const rawAmt = form.elements.amount.value.trim();
    const amt = Number(rawAmt);
    if (rawAmt === '' || isNaN(amt) || amt < 0) {
      form.elements.amount.closest('.field').classList.add('invalid'); ok = false;
    }
    const ph = form.elements.phone.value.trim();
    if (ph && !/^[+\d][\d\s\-()]{6,17}$/.test(ph)) {
      form.elements.phone.closest('.field').classList.add('invalid'); ok = false;
    }
    if (!ok) {
      msg.textContent = 'A name and a valid amount (₹) are required. If you enter a phone number it must have at least 7 digits.';
      msg.classList.add('err');
      return null;
    }

    const data = readForm(form);

    // UPDATE mode — the entry was opened from the live panel's Edit button
    if (state.editId) {
      const target = state.rows.find(r => r.id === state.editId);
      if (target) {
        Object.assign(target, data, { updatedAt: new Date().toISOString() });
        state.editId = null; setHomeBtn('Add entry');
        save(); render();
        form.reset();
        form.elements.method.value = target.method;
        form.elements.name.focus();
        msg.textContent = `Updated — ${target.name}, ${inr(target.amount)} (${target.method})`;
        toast('Entry updated', `${target.name} · ${inr(target.amount)}`, 'ok');
        return target;
      }
      state.editId = null; setHomeBtn('Add entry');
    }

    const row = Object.assign({ id: uid(), createdAt: new Date().toISOString() }, data);
    state.rows.unshift(row);
    save(); render();

    // Light reset: identity fields cleared, method kept for fast repeated writing
    form.reset();
    form.elements.method.value = row.method;
    form.elements.name.focus();

    msg.textContent = `Recorded — ${row.name}, ${inr(row.amount)} (${row.method})`;
    toast('Entry recorded', `${row.name} · ${inr(row.amount)}`, 'ok');
    return row;
  }

  /* ---------- Sample book ---------- */
  const DEMO = [
    ['Sh. Ramesh Chandra Agarwal','Sh. Mohan Lal Agarwal','+91 98110 22334','House 45, Ward 6, Gandhi Nagar, Delhi — 110001',11000,'Cash','Came with the whole family to write the nevta.'],
    ['Smt. Sunita Devi','Sh. Rakesh Kumar','+91 99870 11223','B-12/4, Vasant Kunj, Delhi — 110070',5100,'UPI / Online','Sent by UPI; the screenshot is on WhatsApp.'],
    ['Sh. Vijay Prakash','Late Sh. Hari Prakash','+91 90045 78123','78, Model Town, Rohtak, Haryana — 124001',2500,'Gold / Article gift','A silver glass along with the shagun.'],
    ['Sh. Mahesh Yadav','Sh. Ramswaroop Yadav','+91 98765 40021','Village Bhainswal, Post Sikandra, Mathura, UP — 281204',21000,'Cash','Maternal uncle — had the nevta written at the baraat.'],
    ['Smt. Kavita Sharma','Sh. Naresh Sharma','+91 91234 55678','301, Green Heights, Sector 14, Gurugram, Haryana — 122001',1500,'UPI / Online','Neighbour — gave it at the time of the vidaai.'],
    ['Sh. Deepak Bansal','Sh. Suresh Bansal','+91 97654 33221','22/7, Chandni Chowk, Delhi — 110006',5000,'Cash','Business friend — came two days before the wedding.'],
    ['Sh. Girish Mishra','Pt. Shivnath Mishra','+91 98220 90901','Nirmal Ashram Road, Vrindavan, Mathura — 281121',1100,'Cash','The family priest — given along with his blessings.'],
    ['Smt. Anita Verma','Sh. Bhola Verma','+91 99001 23456','Kothi 9, Civil Lines, Jaipur, Rajasthan — 302006',31000,'Cheque','Paid by cheque; still to be deposited at the bank.'],
    ['Sh. Rakesh Tiwari','Sh. Dinesh Tiwari','+91 95555 12345','Flat 402, Amrapali, Noida, UP — 201301',2000,'Promised (to be given later)','Said he will give it after the wedding.'],
    ['Dr. Sanjay Malhotra','Sh. Ved Prakash Malhotra','+91 98100 45678','House 4/33, Panchsheel Enclave, Delhi — 110017',16000,'UPI / Online','Family doctor — shagun for the whole household.']
  ];

  function loadDemo() {
    const now = Date.now();
    let added = 0;
    DEMO.forEach((d, i) => {
      const key = d[0] + '|' + d[3];
      if (state.rows.some(r => (r.name + '|' + (r.address || '')) === key)) return;
      state.rows.push({
        id: uid(),
        name: d[0], fatherName: d[1], phone: d[2], address: d[3],
        amount: d[4], method: d[5],
        note: d[6] || '',
        createdAt: new Date(now - i * 86400000).toISOString()
            });
      added++;
    });
    save(); render();
    toast('Sample book loaded',
      added ? `${added} entries added — ${state.rows.length} in total.` : 'This sample was already loaded.', 'ok');
  }

  /* ---------- Table + filter events ---------- */
  function bindTable() {
    $('#tableBody').addEventListener('click', e => {
      const tr = e.target.closest('tr'); if (!tr) return;
      const id = tr.dataset.id;

      // Drive the checkbox from STATE, never from the DOM property —
      // that way selection can never desync after a re-render.
      if (e.target.classList.contains('row-check')) {
        if (state.selected.has(id)) state.selected.delete(id);
        else state.selected.add(id);
        e.target.checked = state.selected.has(id);
        tr.classList.toggle('is-sel', state.selected.has(id));
        const vis = visibleRows();
        $('#selInfo').textContent = `${state.selected.size} selected · ${vis.length} shown`;
        const all = $('#checkAll');
        all.checked = vis.length > 0 && vis.every(r => state.selected.has(r.id));
        all.indeterminate = !all.checked && vis.some(r => state.selected.has(r.id));
        if (window.NexoraExports && NexoraExports.syncCounts) NexoraExports.syncCounts();
        return;
      }

      if (e.target.classList.contains('del-row')) {
        const row = state.rows.find(r => r.id === id);
        state.rows = state.rows.filter(r => r.id !== id);
        state.selected.delete(id);
        save(); render();
        toast('Entry removed', row ? `${row.name} · ${inr(row.amount)}` : '', 'err');
      }
    });

    $('#checkAll').addEventListener('change', e => {
      const rows = visibleRows();
      if (e.target.checked) rows.forEach(r => state.selected.add(r.id));
      else rows.forEach(r => state.selected.delete(r.id));
      render();
    });

    $('#searchInput').addEventListener('input', e => { state.search = e.target.value; render(); });
    $('#methodFilter').addEventListener('change', e => { state.method = e.target.value; render(); });

    $('#clearFilters').addEventListener('click', () => {
      state.search = state.method = '';
      $('#searchInput').value = '';
      $('#methodFilter').value = '';
      render();
      toast('Filters cleared', 'The whole register is showing now.');
    });

    $('#deleteSel').addEventListener('click', () => {
      if (!state.selected.size) return toast('Nothing selected', 'Tick a few entries first.', 'err');
      const n = state.selected.size;
      const sum = state.rows.filter(r => state.selected.has(r.id)).reduce((a, r) => a + Number(r.amount || 0), 0);
      state.rows = state.rows.filter(r => !state.selected.has(r.id));
      state.selected.clear();
      save(); render();
      toast('Entries removed', `${n} ${n === 1 ? 'entry' : 'entries'} · ${inr(sum)}`, 'err');
    });

    $('#clearAll').addEventListener('click', () => {
      if (!state.rows.length) return;
      if (!confirm('Empty the whole register? This cannot be undone.')) return;
      state.rows = []; state.selected.clear();
      save(); render();
      toast('Register emptied', 'Every entry has been removed.', 'err');
    });
  }

  /* ---------- "End" handoff from the writer ----------
     The writer's End button stores the chosen format and navigates here;
     on arrival that single file is built, downloaded instantly and logged
     in Recent exports (dashboard me save). */
  function finishHandoff() {
    try {
      const fmt = sessionStorage.getItem('nv_finish_export');
      if (!fmt) return;
      sessionStorage.removeItem('nv_finish_export');
      if (!state.rows.length) {
        toast('Nothing to export yet', 'The register is empty — write an entry first.', 'err');
        return;
      }
      if (!window.NexoraExports) return;
      toast('Finishing up', fmt.toUpperCase() + ' is being built — it will download in a moment.', 'ok');
      setTimeout(() => {
        const reg = $('#register');
        if (reg && reg.scrollIntoView) reg.scrollIntoView({ behavior: 'smooth' });
        NexoraExports.quick(fmt);
      }, 400);
    } catch (e) {}
  }

  /* ---------- Nav + animations ---------- */
  function bindNav() {
    const burger = $('#navBurger'), links = $('#navLinks');
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', e => {
      if (e.target.tagName === 'A') { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  function revealOnScroll() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) {
          setTimeout(() => en.target.classList.add('in'), i * 60);
          io.unobserve(en.target);
        }
      });
    }, { threshold: .1, rootMargin: '0px 0px -40px' });
    els.forEach(e => io.observe(e));
  }

  function countUp() {
    const els = $$('[data-count]');
    const paint = el => el.textContent = Number(el.dataset.count).toLocaleString('en-IN');
    if (!('IntersectionObserver' in window)) { els.forEach(paint); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target, target = Number(el.dataset.count);
        const dur = 1500, t0 = performance.now();
        const tick = now => {
          const p = Math.min(1, (now - t0) / dur);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: .5 });
    els.forEach(e => io.observe(e));
  }

  function cursorGlow() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
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

  /* ---------- Init ---------- */
  function init() {
    $('#year').textContent = new Date().getFullYear();
    load();
    render();

    const form = $('#leadForm');
    form.addEventListener('submit', onSubmit);
    form.addEventListener('reset', () => cancelEdit());
    $('#loadDemo').addEventListener('click', loadDemo);

    // Save & Export — stores the entry, then opens the export panel
    const se = $('#saveExportBtn');
    if (se) se.addEventListener('click', () => {
      trySave(form);
      if (!state.rows.length) {
        toast('Nothing to export yet', 'Add an entry or load the sample book first.', 'err');
        return;
      }
      if (window.NexoraExports) NexoraExports.openModal();
    });

    bindTable(); bindMock(); bindProject(); bindNav(); revealOnScroll(); countUp(); cursorGlow();
    finishHandoff();

    ['openExport', 'openExportTop', 'openExportCta', 'openExportHero', 'mockExport'].forEach(id => {
      const b = document.getElementById(id);
      if (!b) return;
      b.addEventListener('click', () => {
        if (!state.rows.length) {
          toast('The register is empty', 'Add an entry or load the sample book first.', 'err');
          document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
          return;
        }
        if (window.NexoraExports) NexoraExports.openModal();
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && window.NexoraExports) NexoraExports.closeModal();
    });
  }

  /* ---------- Public API (for exports.js) ---------- */
  window.NexoraApp = {
    FIELDS, METHODS, state,
    toast, esc, inr, fmtDate, fmtDateTime, uid, totals,
    get projectName() { return projectName(); },
    finishHandoff,
    get allRows()  { return state.rows.slice(); },
    get visible()  { return visibleRows(); },
    get selected() { return state.rows.filter(r => state.selected.has(r.id)); },
    rerender: render
  };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
