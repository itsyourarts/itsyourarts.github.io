/* ==========================================================================
   NEVTA BOOK — exports.js
   Turns the register into: PDF (jsPDF + autoTable) · XML · JSON · CSV ·
   PNG (html2canvas) · HTML · Markdown · ZIP (JSZip) · Print fallback.
   Everything is generated inside the browser — no server, no upload.
   ========================================================================== */
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const A   = () => window.NexoraApp;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Libraries (with a graceful message if the CDN is unreachable) ---------- */
  const lib = {
    jsPDF:       () => (window.jspdf && window.jspdf.jsPDF) || null,
    html2canvas: () => window.html2canvas || null,
    JSZip:       () => window.JSZip || null,
    saveAs:      () => window.saveAs || null
  };

  /* ---------- Filenames ---------- */
  const stamp = () => {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  };
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'shagun-register';
  const PROJ_KEY = 'nevtabook.project.v1';
  const XLOG_KEY = 'nevtabook.exports.v1';

  function readProjectName() {
    try {
      if (typeof localStorage === 'undefined') return '';
      const p = JSON.parse(localStorage.getItem(PROJ_KEY) || 'null');
      return p && p.name ? String(p.name) : '';
    } catch (e) { return ''; }
  }
  const fmtLocal = d => d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit', hour12: true });
  // files are named after the project / nevta
  const baseName = () => slug(readProjectName() || $('#reportTitle')?.value || 'shagun-register');

  /* ---------- export history (logged on the dashboard with date & time) ---------- */
  function readLog() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const arr = JSON.parse(localStorage.getItem(XLOG_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function logExport(name, fmt) {
    try {
      const arr = readLog();
      arr.unshift({ name, fmt, at: new Date().toISOString() });
      localStorage.setItem(XLOG_KEY, JSON.stringify(arr.slice(0, 12)));
    } catch (e) {}
    renderExportLog();
  }
  function renderExportLog() {
    const box = $('#exportLog');
    if (!box || !('innerHTML' in box)) return;   // real DOM node only (test mocks pass through)
    const arr = readLog();
    const cnt = $('#exportLogCount'); if (cnt) cnt.textContent = String(arr.length);
    const emp = $('#exportLogEmpty'); if (emp && emp.style) emp.style.display = arr.length ? 'none' : 'block';
    const fd = (A() && A().fmtDateTime) ? A().fmtDateTime : (v => fmtLocal(new Date(v)));
    box.innerHTML = arr.map(x => `
      <div class="xlog">
        <i class="tag ${x.fmt === 'pdf' ? 'tag--magenta' : x.fmt === 'zip' ? 'tag--violet' : 'tag--cyan'}">${esc(String(x.fmt || '').toUpperCase())}</i>
        <b>${esc(x.name || '')}</b>
        <span>${esc(fd(x.at))}</span>
      </div>`).join('');
  }

  function download(blob, filename) {
    const saver = lib.saveAs();
    if (saver) { saver(blob, filename); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  const textBlob = (str, type) => new Blob([str], { type });

  /* ==========================================================================
     Which entries, which columns
     ========================================================================== */
  function activeColumns() {
    return A().FIELDS.filter(f => {
      const cb = document.getElementById('col-' + f.key);
      return cb ? cb.checked : true;
    });
  }

  function activeRows() {
    const app = A();
    const scope = document.querySelector('input[name="rowScope"]:checked')?.value || 'all';
    let rows = scope === 'selected' ? app.selected
             : scope === 'filtered' ? app.visible
             : app.allRows;

    return rows;
  }

  function cellValue(row, field) {
    const v = row[field.key];
    if (field.key === 'amount')    return Number(v || 0);
    if (field.key === 'createdAt') return v || '';
    return v == null ? '' : String(v);
  }

  function cellDisplay(row, field) {
    switch (field.key) {
      case 'amount':    return A().inr(row.amount);
      case 'createdAt': return A().fmtDate(row.createdAt);
      default: {
        const v = row[field.key];
        return (v === '' || v == null) ? '—' : String(v);
      }
    }
  }

  function meta(rows) {
    const t = A().totals(rows);
    return {
      generatedAt: new Date().toISOString(),
      generatedLabel: fmtLocal(new Date()),
      project: readProjectName(),
      company: $('#brandName')?.value || 'Shagun Register',
      title:   $('#reportTitle')?.value || 'Shagun Register',
      count: t.count, total: t.sum, avg: t.avg,
      high: t.high, highWho: t.highWho, low: t.low,
      byMethod: t.byMethod,
      methodRows: t.methodRows || [],
      people: t.people != null ? t.people : t.count,
      cashSum: t.cashSum, upiSum: t.upiSum
    };
  }

  /* ==========================================================================
     XML
     ========================================================================== */
  const xmlEsc = s => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  const xmlTag = k => k.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
                       .replace(/[^A-Za-z0-9_.-]/g, '_').replace(/^(\d)/, '_$1');

  function buildXML(rows, cols, m) {
    const L = [];
    L.push('<?xml version="1.0" encoding="UTF-8"?>');
    L.push('<!-- NEVTA BOOK — digital shagun register. Ready to import into any other app. -->');
    L.push(`<shagun_register xmlns="https://nevtabook.in/schema/v1" version="1.0" count="${rows.length}" generated_at="${m.generatedAt}">`);
    L.push('  <host>');
    L.push(`    <name>${xmlEsc(m.company)}</name>`);
    L.push(`    <register_title>${xmlEsc(m.title)}</register_title>`);
    L.push(`    <project>${xmlEsc(m.project || '')}</project>`);
    L.push(`    <generated>${xmlEsc(m.generatedLabel || '')}</generated>`);
    L.push(`    <total_amount currency="INR">${m.total}</total_amount>`);
    L.push(`    <average_amount currency="INR">${m.avg}</average_amount>`);
    L.push(`    <highest_amount currency="INR" by="${xmlEsc(m.highWho)}">${m.high}</highest_amount>`);
    L.push('    <by_method>');
    (m.methodRows.length ? m.methodRows : Object.entries(m.byMethod).map(([method, amount]) => ({ method, amount, count: 0 })))
      .forEach(r => L.push(`      <method name="${xmlEsc(r.method)}" entries="${r.count}" amount="${r.sum != null ? r.sum : r.amount}"/>`));
    L.push('    </by_method>');
    L.push(`    <total_people>${m.people}</total_people>`);
    L.push('  </host>');
    L.push('  <entries>');

    rows.forEach((r, i) => {
      L.push(`    <entry serial="${i + 1}">`);
      cols.forEach(f => {
        const tag = xmlTag(f.key);
        const val = cellValue(r, f);
        const attr = f.key === 'amount' ? ' currency="INR"' : '';
        L.push(val === '' || val == null
          ? `      <${tag}${attr}/>`
          : `      <${tag}${attr}>${xmlEsc(val)}</${tag}>`);
      });
      L.push('    </entry>');
    });

    L.push('  </entries>');
    L.push('</shagun_register>');
    return L.join('\n');
  }

  /* ==========================================================================
     JSON
     ========================================================================== */
  function buildJSON(rows, cols, m) {
    return JSON.stringify({
      meta: {
        generator: 'NEVTA BOOK — Neon Glass Shagun Register',
        version: '1.0',
        host: m.company,
        registerTitle: m.title,
        project: m.project || '',
        generatedAt: m.generatedAt,
        generatedLocal: m.generatedLabel || '',
        entryCount: rows.length,
        totals: {
          totalINR: m.total, averageINR: m.avg,
          highestINR: m.high, highestBy: m.highWho, lowestINR: m.low,
          cashINR: m.cashSum, onlineINR: m.upiSum
        },
        byMethod: m.byMethod,
        methodBreakup: m.methodRows.map(r => ({ method: r.method, entries: r.count, amountINR: r.sum })),
        totalPeople: m.people,
        fields: cols.map(c => ({ key: c.key, label: c.label, type: c.type }))
      },
      entries: rows.map((r, i) => {
        const o = { serial: i + 1 };
        cols.forEach(f => { o[f.key] = cellValue(r, f); });
        return o;
      })
    }, null, 2);
  }

  /* ==========================================================================
     CSV — with a UTF-8 BOM so Excel opens it correctly
     ========================================================================== */
  const csvCell = v => {
    const s = String(v ?? '').replace(/[\r\n]+/g, ' ');   // one line per row, spreadsheet friendly
    return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  function buildCSV(rows, cols, m) {
    const t = A().totals(rows);
    const N = cols.length + 1;                       // Sr. + chosen columns
    const pad = arr => { const a = arr.slice(0, N); while (a.length < N) a.push(''); return a.join(','); };
    const head = ['Sr.', ...cols.map(c => csvCell(c.label))].join(',');
    const body = rows.map((r, i) => [i + 1, ...cols.map(c => csvCell(cellValue(r, c)))].join(','));
    const total = pad(['', 'TOTAL', ...cols.slice(1).map(c => c.key === 'amount' ? csvCell(t.sum) : '')]);

    // closing breakup: kitna cash se, kitna UPI se … har method ki entries + amount
    const breakup = (t.methodRows || []).map(r =>
      pad(['', csvCell('Breakup — ' + r.method), '', '', '', csvCell(r.sum), '', csvCell(r.count + (r.count === 1 ? ' entry' : ' entries'))]));
    const people = pad(['', csvCell('TOTAL PEOPLE'), '', '', '', '', '', csvCell(t.people + (t.people === 1 ? ' person' : ' people'))]);
    const grand  = pad(['', csvCell('TOTAL AMOUNT RECEIVED'), '', '', '', csvCell(t.sum), '', '']);

    // project + generation date-time ride along at the very end
    const tail = m ? [
      pad(['', csvCell('PROJECT — ' + (m.project || 'Unnamed'))]),
      pad(['', csvCell('GENERATED — ' + (m.generatedLabel || fmtLocal(new Date())))])
    ] : [];

    return '\uFEFF' + [head, ...body, total, '', pad(['', 'BREAKUP BY METHOD']), ...breakup, people, grand, ...tail].join('\r\n');
  }

  /* ==========================================================================
     Markdown
     ========================================================================== */
  function buildMarkdown(rows, cols, m) {
    const L = [];
    L.push(`# ${m.title}`);
    L.push('');
    L.push(`**Host / Family:** ${m.company}  `);
    L.push(`**Project / nevta:** ${m.project || '—'}  `);
    L.push(`**Generated:** ${new Date(m.generatedAt).toLocaleString('en-IN')}  `);
    L.push(`**Total entries:** ${m.count}  `);
    L.push(`**Total shagun:** ${A().inr(m.total)}  `);
    L.push(`**Average:** ${A().inr(m.avg)}  `);
    L.push(`**Largest gift:** ${A().inr(m.high)} — ${m.highWho}`);
    L.push('');
    L.push('## By method');
    L.push('');
    L.push('| Method | Amount |');
    L.push('| --- | ---: |');
    Object.entries(m.byMethod).forEach(([k, v]) => L.push(`| ${k} | ${A().inr(v)} |`));
    L.push('');
    L.push('## Register');
    L.push('');
    L.push('| ' + cols.map(c => c.label).join(' | ') + ' |');
    L.push('|' + cols.map(c => (c.type === 'number' ? ' ---: ' : ' --- ')).join('|') + '|');
    rows.forEach(r => {
      L.push('| ' + cols.map(c => cellDisplay(r, c).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')).join(' | ') + ' |');
    });
    L.push('');
    L.push('## Breakup by method');
    L.push('');
    L.push('| Method | Entries | Amount |');
    L.push('| --- | ---: | ---: |');
    m.methodRows.forEach(r => L.push(`| ${r.method} | ${r.count} | ${A().inr(r.sum)} |`));
    L.push('');
    L.push(`**TOTAL: ${m.people} ${m.people === 1 ? 'person' : 'people'} · ${A().inr(m.total)} received**`);
    L.push('');
    L.push('---');
    L.push('_Generated by NEVTA BOOK — the neon glass shagun register._');
    return L.join('\n');
  }

  /* ==========================================================================
     HTML — standalone and print-ready
     ========================================================================== */
  function buildHTML(rows, cols, m) {
    const th  = cols.map(c => `<th class="${c.type === 'number' ? 'ta-r' : ''}">${esc(c.label)}</th>`).join('');
    const trs = rows.map((r, i) =>
      `<tr><td class="sn">${i + 1}</td>${cols.map(c => `<td class="${c.type === 'number' ? 'ta-r amt' : ''}">${esc(cellDisplay(r, c))}</td>`).join('')}</tr>`).join('\n      ');

    const tfoot = `<tr><td></td><td class="tot">GRAND TOTAL</td>${cols.map((c, idx) =>
      idx === 0 ? '' : `<td class="${c.key === 'amount' ? 'ta-r tot-amt' : ''}">${c.key === 'amount' ? esc(A().inr(m.total)) : ''}</td>`
    ).join('')}</tr>`;


    const btRows = m.methodRows.map(r =>
      `<tr><td>${esc(r.method)}</td><td class="ta-r">${r.count}</td><td class="ta-r amt">${esc(A().inr(r.sum))}</td></tr>`).join('\n      ');
    const methodCards = Object.entries(m.byMethod).map(([k, v]) =>
      `<div class="s"><b>${esc(A().inr(v))}</b><i>${esc(k)}</i></div>`).join('');

    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(m.title)} — ${esc(m.company)}</title>
<style>
  :root{--cyan:#E8789E;--mag:#D94F7C;--vio:#C05C72;--rose:#ff4d6d}
  *{box-sizing:border-box}
  body{margin:0;padding:40px 18px;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#FFF2F7;
       background:radial-gradient(900px 600px at 8% -10%,#5c1030,transparent 60%),
                  radial-gradient(800px 600px at 100% 0%,#7a1439,transparent 55%),#3d0a26}
  .wrap{max-width:1180px;margin:0 auto;padding:36px;border-radius:26px;position:relative;overflow:hidden;
        background:linear-gradient(150deg,rgba(255,255,255,.09),rgba(255,255,255,.03));
        border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(18px);
        box-shadow:0 30px 80px -30px #000,0 0 70px -34px rgba(255,77,109,.7)}
  .co{font-family:ui-monospace,Menlo,monospace;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;color:#9fb6d8;margin-bottom:6px}
  h1{margin:0;font-size:2rem;letter-spacing:-.02em}
  h1 span{color:var(--rose);text-shadow:0 0 20px rgba(255,77,109,.85)}
  h2{font-size:1rem;letter-spacing:.14em;text-transform:uppercase;color:#EEAFB6;margin:28px 0 10px;
     font-family:ui-monospace,Menlo,monospace}
  .meta{font-family:ui-monospace,Menlo,monospace;font-size:.78rem;color:#7a86a8;margin-top:14px;line-height:1.9}
  .stats{display:flex;flex-wrap:wrap;gap:12px;margin:22px 0 6px}
  .kpi{padding:15px 19px;border-radius:16px;background:rgba(232,120,158,.09);border:1px solid rgba(232,120,158,.32)}
  .kpi b{display:block;font-size:1.5rem;color:#fff}
  .kpi i{font-style:normal;font-family:ui-monospace,Menlo,monospace;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:#9fb6d8}
  .kpi.big{background:linear-gradient(135deg,rgba(255,77,109,.24),rgba(232,120,158,.14));border-color:rgba(255,77,109,.45)}
  .kpi.big b{font-size:2rem;color:#fff;text-shadow:0 0 22px rgba(255,77,109,.65)}
  .s{padding:11px 15px;border-radius:13px;background:rgba(192,92,114)),.16);border:1px solid rgba(192,92,114)),.36)}
  .s2{background:rgba(255,77,109,.14);border-color:rgba(255,77,109,.36)}
  .s b{display:block;font-size:1.02rem;color:#fff}.s i{font-style:normal;font-size:.72rem;color:#c9d4ee}
  .tw{overflow:auto;border-radius:18px;border:1px solid rgba(255,255,255,.13)}
  table{width:100%;border-collapse:collapse;font-size:.84rem;min-width:900px}
  th{position:sticky;top:0;background:rgba(9,12,28,.98);color:var(--cyan);text-align:left;padding:11px 12px;
     font-family:ui-monospace,Menlo,monospace;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;
     border-bottom:1px solid rgba(232,120,158,.35)}
  td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.07);color:#c9d4ee;vertical-align:top}
  td.sn{font-family:ui-monospace,Menlo,monospace;color:#6f7ba1}
  td.ta-r,th.ta-r{text-align:right}
  td.amt{font-family:ui-monospace,Menlo,monospace;color:#00FFA3;font-weight:600}
  tbody tr:nth-child(even) td{background:rgba(255,255,255,.035)}
  tbody tr:hover td{background:rgba(255,77,109,.09)}
  tfoot td{background:rgba(255,77,109,.16)!important;color:#fff;font-weight:700;border-top:2px solid rgba(255,77,109,.5)}
  tfoot .tot{font-family:ui-monospace,Menlo,monospace;letter-spacing:.1em;font-size:.78rem}
  tfoot .tot-amt{font-family:ui-monospace,Menlo,monospace;color:#00FFA3;font-size:1rem}
  table.bt{min-width:420px}
  .final-line{margin:16px 2px 0;font-family:ui-monospace,Menlo,monospace;font-size:1rem;color:#00FFA3;
              text-shadow:0 0 16px rgba(0,255,163,.55)}
  .final-line b{color:#fff}
  .btn{display:inline-block;margin-top:20px;padding:.78rem 1.5rem;border-radius:999px;border:0;cursor:pointer;
       font-weight:600;color:#1a0208;background:linear-gradient(120deg,#ff8fae,var(--vio));
       box-shadow:0 14px 34px -14px rgba(255,77,109,.95)}
  footer{margin-top:26px;padding-top:16px;border-top:1px solid rgba(255,255,255,.12);
         font-family:ui-monospace,Menlo,monospace;font-size:.72rem;color:#7a86a8;
         display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  @media print{
    body{background:#fff;color:#000;padding:0}
    .wrap{box-shadow:none;border:1px solid #ccc;background:#fff;backdrop-filter:none}
    h1 span{color:#a10f36;text-shadow:none}.co,.meta{color:#444}
    th{background:#eee;color:#000;border-color:#999}td{color:#111;border-color:#ddd}
    td.amt{color:#0a5c1e}
    .kpi,.s,.s2{background:#f6f8ff;border-color:#cfd8e8}.kpi b,.kpi i,.s b,.s i{color:#111}
    tfoot td{background:#fdeef2!important;color:#000}
    .final-line{color:#0a5c1e;text-shadow:none}.final-line b{color:#000}
    .btn{display:none}table{min-width:0;font-size:10pt}
  }
</style></head>
<body>
  <div class="wrap">
    <p class="co">${esc(m.company)}</p>
    <h1><span>${esc(m.title)}</span></h1>
    <div class="meta">Project / nevta: ${esc(m.project || '—')}<br/>
      Generated: ${esc(m.generatedLabel || new Date(m.generatedAt).toLocaleString('en-IN'))}<br/>
      Total entries: ${m.count} &nbsp;·&nbsp; Columns: ${cols.length}</div>

    <div class="stats">
      <div class="kpi big"><b>${esc(A().inr(m.total))}</b><i>Total shagun</i></div>
      <div class="kpi"><b>${m.count}</b><i>Entries</i></div>
      <div class="kpi"><b>${esc(A().inr(m.avg))}</b><i>Average</i></div>
      <div class="kpi"><b>${esc(A().inr(m.high))}</b><i>Largest — ${esc(m.highWho)}</i></div>
    </div>

    <h2>By method</h2>
    <div class="stats">${methodCards || '<div class="s"><b>—</b><i>no data</i></div>'}</div>

    <h2>Register</h2>
    <div class="tw">
      <table>
        <thead><tr><th>#</th>${th}</tr></thead>
        <tbody>
      ${trs || `<tr><td colspan="${cols.length + 1}" style="text-align:center;padding:28px">No entries</td></tr>`}
        </tbody>
        <tfoot>${tfoot}</tfoot>
      </table>
    </div>

    <h2>Breakup by method</h2>
    <div class="tw">
      <table class="bt">
        <thead><tr><th>Method</th><th class="ta-r">Entries</th><th class="ta-r">Amount</th></tr></thead>
        <tbody>
      ${btRows || '<tr><td colspan="3" style="text-align:center;padding:18px">No entries</td></tr>'}
        </tbody>
        <tfoot><tr><td>TOTAL</td><td class="ta-r">${m.people} ${m.people === 1 ? 'person' : 'people'}</td><td class="ta-r tot-amt">${esc(A().inr(m.total))}</td></tr></tfoot>
      </table>
    </div>
    <p class="final-line">Received from <b>${m.people} ${m.people === 1 ? 'person' : 'people'}</b> — total <b>${esc(A().inr(m.total))}</b></p>

    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
    <footer>
      <span>${esc(m.company)} · ${esc(m.title)}</span>
      <span>NEVTA BOOK — the neon glass shagun register</span>
    </footer>
  </div>
</body></html>`;
  }

  /* ==========================================================================
     Report DOM — used for the PNG capture and for printing
     ========================================================================== */
  function reportHTML(rows, cols, m) {
    const th  = cols.map(c => `<th>${esc(c.label)}</th>`).join('');
    const trs = rows.map((r, i) =>
      `<tr><td class="sn">${i + 1}</td>${cols.map(c => `<td class="${c.key === 'amount' ? 'ta-r amt' : ''}">${esc(cellDisplay(r, c))}</td>`).join('')}</tr>`).join('');
    const foot = `<tr><td class="sn"></td><td class="tot">GRAND TOTAL</td>${cols.map((c, i) =>
      i === 0 ? '' : `<td class="${c.key === 'amount' ? 'ta-r tot-amt' : ''}">${c.key === 'amount' ? esc(A().inr(m.total)) : ''}</td>`
    ).join('')}</tr>`;

    const stats = $('#includeSummary').checked ? `
      <div class="report__stats">
        <div class="report__stat report__stat--big"><b>${esc(A().inr(m.total))}</b><i>Total shagun</i></div>
        <div class="report__stat"><b>${m.count}</b><i>Entries</i></div>
        <div class="report__stat"><b>${esc(A().inr(m.avg))}</b><i>Average</i></div>
        <div class="report__stat"><b>${esc(A().inr(m.high))}</b><i>Largest gift</i></div>
        ${Object.entries(m.byMethod).slice(0, 2).map(([k, v]) =>
          `<div class="report__stat"><b>${esc(A().inr(v))}</b><i>${esc(k)}</i></div>`).join('')}
      </div>` : '';

    const btRows = m.methodRows.map(r =>
      `<tr><td>${esc(r.method)}</td><td class="ta-r">${r.count}</td><td class="ta-r amt">${esc(A().inr(r.sum))}</td></tr>`).join('');

    return `<div class="report" id="reportNode">
      <div class="report__hd">
        <div>
          <div class="report__brand">${esc(m.company)}</div>
          <div class="report__title">${esc(m.title)}</div>
          ${m.project ? `<div class="report__brand">${esc(m.project)}</div>` : ''}
        </div>
        <div class="report__meta">
          Project: ${esc(m.project || '—')}<br/>
          Generated: ${esc(m.generatedLabel || new Date(m.generatedAt).toLocaleString('en-IN'))}<br/>
          Entries: ${m.count} · Total: ${esc(A().inr(m.total))}
        </div>
      </div>
      ${stats}
      <table><thead><tr><th>#</th>${th}</tr></thead><tbody>${trs}</tbody>
        <tfoot>${foot}</tfoot>
      </table>
      <table class="report__bt">
        <thead><tr><th>Method</th><th>Entries</th><th>Amount</th></tr></thead>
        <tbody>${btRows}</tbody>
        <tfoot><tr><td class="tot">TOTAL — ${m.people} ${m.people === 1 ? 'person' : 'people'}</td><td></td><td class="ta-r tot-amt">${esc(A().inr(m.total))}</td></tr></tfoot>
      </table>
      <div class="report__ft">
        <span>${esc(m.company)} · ${esc(m.title)}</span>
        <span>NEVTA BOOK — neon glass shagun register</span>
      </div>
    </div>`;
  }

  async function buildPNG(rows, cols, m) {
    const h2c = lib.html2canvas();
    if (!h2c) throw new Error('PNG_LIB');

    const stage = $('#reportStage');
    stage.innerHTML = reportHTML(rows, cols, m);
    const node = $('#reportNode');
    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 80)));

    const canvas = await h2c(node, { backgroundColor: '#05060f', scale: 2, useCORS: true, logging: false });
    stage.innerHTML = '';
    return await new Promise(res => canvas.toBlob(b => res(b), 'image/png'));
  }

  /* ==========================================================================
     PDF — jsPDF + autoTable
     ========================================================================== */
  function buildPDF(rows, cols, m) {
    const Ctor = lib.jsPDF();
    if (!Ctor) throw new Error('PDF_LIB');

    const doc = new Ctor({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 38;

    // Neon header band
    doc.setFillColor(8, 6, 22);
    doc.rect(0, 0, W, 100, 'F');
    doc.setFillColor(255, 77, 109); doc.rect(0, 98, W, 2.4, 'F');
    doc.setFillColor(0, 240, 255);  doc.rect(0, 100.4, W * 0.4, 1.3, 'F');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(19); doc.setTextColor(255, 255, 255);
    doc.text(String(m.company || 'Shagun Register'), M, 42);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(12.5); doc.setTextColor(255, 143, 174);
    doc.text(String(m.title || 'Shagun Register'), M, 64);
    if (m.project) {
      doc.setFontSize(10);
      doc.text('Project / nevta: ' + String(m.project), M, 82);
    }

    doc.setFontSize(8.5); doc.setTextColor(190, 182, 216);
    doc.text('Generated: ' + (m.generatedLabel || new Date(m.generatedAt).toLocaleString('en-IN')), W - M, 40, { align: 'right' });
    doc.text(`Entries: ${m.count}    Total: Rs. ${Number(m.total).toLocaleString('en-IN')}`, W - M, 54, { align: 'right' });
    doc.text(`Average: Rs. ${Number(m.avg).toLocaleString('en-IN')}    Largest: Rs. ${Number(m.high).toLocaleString('en-IN')}`, W - M, 68, { align: 'right' });

    let y = 126;

    if ($('#includeSummary').checked) {
      const kpis = [
        ['TOTAL SHAGUN', 'Rs. ' + Number(m.total).toLocaleString('en-IN')],
        ['ENTRIES', String(m.count)],
        ['AVERAGE', 'Rs. ' + Number(m.avg).toLocaleString('en-IN')],
        ['LARGEST GIFT', 'Rs. ' + Number(m.high).toLocaleString('en-IN')],
        ...Object.entries(m.byMethod).slice(0, 2).map(([k, v]) => [k.toUpperCase().slice(0, 18), 'Rs. ' + Number(v).toLocaleString('en-IN')])
      ].slice(0, 6);

      const bw = (W - M * 2 - (kpis.length - 1) * 9) / kpis.length;
      kpis.forEach((k, i) => {
        const x = M + i * (bw + 9);
        doc.setFillColor(20, 13, 40); doc.setDrawColor(255, 77, 109); doc.setLineWidth(.7);
        doc.roundedRect(x, y, bw, 46, 7, 7, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(255, 255, 255);
        doc.text(String(k[1]).slice(0, 20), x + 10, y + 21);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(190, 168, 196);
        doc.text(String(k[0]).slice(0, 26), x + 10, y + 35);
      });
      y += 64;
    }

    const head = [['#', ...cols.map(c => c.label)]];
    const body = rows.map((r, i) => [String(i + 1), ...cols.map(c => cellDisplay(r, c))]);
    const amountIdx = cols.findIndex(c => c.key === 'amount');

    const opts = {
      head, body, startY: y, theme: 'grid',
      styles: {
        font: 'helvetica', fontSize: 7.6, cellPadding: 5, overflow: 'linebreak',
        lineColor: [222, 205, 214], lineWidth: .4, textColor: [40, 28, 38]
      },
      headStyles: { fillColor: [26, 10, 30], textColor: [255, 143, 174], fontStyle: 'bold', fontSize: 7.2, lineWidth: 0 },
      alternateRowStyles: { fillColor: [252, 246, 250] },
      columnStyles: {
        0: { cellWidth: 24, halign: 'center', textColor: [140, 124, 136] },
        ...(amountIdx >= 0 ? { [amountIdx + 1]: { halign: 'right', fontStyle: 'bold', textColor: [10, 90, 40] } } : {})
      },
      margin: { left: M, right: M, bottom: 48 },
      didDrawPage: () => {
        doc.setFillColor(8, 6, 22); doc.rect(0, H - 30, W, 30, 'F');
        doc.setFillColor(255, 77, 109); doc.rect(0, H - 30, W, 1.2, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(200, 180, 196);
        doc.text(`${m.company} — ${m.title}`, M, H - 12);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, W - M, H - 12, { align: 'right' });
      }
    };

    if (typeof doc.autoTable === 'function') {
      doc.autoTable(opts);

      // closing breakup table: cash kitna, UPI kitna, ... entries ke saath
      let y2 = doc.lastAutoTable.finalY + 22;
      if (m.methodRows.length) {
        if (y2 > H - 140) { doc.addPage(); y2 = 46; }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 77, 109);
        doc.text('BREAKUP BY METHOD', M, y2 - 8);
        doc.autoTable({
          head: [['Method', 'Entries', 'Amount (Rs.)']],
          body: m.methodRows.map(r => [r.method, String(r.count), Number(r.sum).toLocaleString('en-IN')]),
          foot: [['TOTAL', m.people + (m.people === 1 ? ' person' : ' people'), Number(m.total).toLocaleString('en-IN')]],
          startY: y2, theme: 'grid',
          styles: { font: 'helvetica', fontSize: 8.2, cellPadding: 5, lineColor: [222, 205, 214], lineWidth: .4, textColor: [40, 28, 38] },
          headStyles: { fillColor: [26, 10, 30], textColor: [255, 143, 174], fontStyle: 'bold', fontSize: 7.6, lineWidth: 0 },
          footStyles: { fillColor: [253, 238, 242], textColor: [120, 10, 50], fontStyle: 'bold', lineWidth: 0 },
          alternateRowStyles: { fillColor: [252, 246, 250] },
          columnStyles: { 1: { halign: 'center', cellWidth: 70 }, 2: { halign: 'right', fontStyle: 'bold', textColor: [10, 90, 40] } },
          margin: { left: M, right: M, bottom: 48 }
        });
        y2 = doc.lastAutoTable.finalY + 20;
      }

      // sabse last me: kitne log aur kitna amount mila
      if (y2 > H - 60) { doc.addPage(); y2 = 50; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(255, 77, 109);
      doc.text(`RECEIVED FROM ${m.people} ${m.people === 1 ? 'PERSON' : 'PEOPLE'}  —  TOTAL Rs. ${Number(m.total).toLocaleString('en-IN')}`, M, y2);
    } else if (typeof window.autoTable === 'function') {
      window.autoTable(doc, opts);
    } else {
      throw new Error('PDF_PLUGIN');
    }

    return doc.output('blob');
  }

  /* ==========================================================================
     Print fallback — a PDF even without any library
     ========================================================================== */
  function printReport(rows, cols, m) {
    const w = window.open('', '_blank', 'width=1200,height=840');
    if (!w) { A().toast('Popup blocked', 'The browser blocked the popup — please allow it.', 'err'); return; }
    w.document.open();
    w.document.write(buildHTML(rows, cols, m));
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 700);
    A().toast('Opening the print dialog', 'Choose “Save as PDF”.', 'ok');
  }

  /* ==========================================================================
     Orchestrator
     ========================================================================== */
  const BUILDERS = {
    pdf:  { ext: 'pdf',  fn: (r, c, m) => buildPDF(r, c, m) },
    xml:  { ext: 'xml',  fn: (r, c, m) => textBlob(buildXML(r, c, m),  'application/xml;charset=utf-8') },
    json: { ext: 'json', fn: (r, c, m) => textBlob(buildJSON(r, c, m), 'application/json;charset=utf-8') },
    csv:  { ext: 'csv',  fn: (r, c, m) => textBlob(buildCSV(r, c, m), 'text/csv;charset=utf-8') },
    png:  { ext: 'png',  fn: (r, c, m) => buildPNG(r, c, m) },
    html: { ext: 'html', fn: (r, c, m) => textBlob(buildHTML(r, c, m), 'text/html;charset=utf-8') },
    md:   { ext: 'md',   fn: (r, c, m) => textBlob(buildMarkdown(r, c, m), 'text/markdown;charset=utf-8') }
  };

  const MISSING = {
    PDF_LIB:    'The PDF library (jsPDF) did not load — check your internet connection, or use “Print / Save PDF”.',
    PDF_PLUGIN: 'The PDF table plugin did not load — use the “Print / Save PDF” button instead.',
    PNG_LIB:    'PNG needs html2canvas — check your internet connection, or export as HTML instead.'
  };

  async function exportOne(fmt, rows, cols, m, opts = {}) {
    const b = BUILDERS[fmt];
    if (!b) throw new Error('Unknown format: ' + fmt);
    const out = await b.fn(rows, cols, m);
    const name = `${baseName()}-${stamp()}.${b.ext}`;
    if (!opts.silent) { download(out, name); logExport(name, fmt); }
    return { name, blob: out, fmt };
  }

  function setBusy(on, text) {
    const hint = $('#expHint');
    if (hint) hint.textContent = text || (on ? 'Working…' : 'Ready');
    ['btnExport', 'btnZip', 'btnPrint'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = !!on;
    });
  }

  async function runExport() {
    const rows = activeRows(), cols = activeColumns();
    if (!rows.length) return A().toast('No entries', 'Change the scope or the date range.', 'err');
    if (!cols.length) return A().toast('No columns', 'Tick at least one column.', 'err');

    const fmts = $$('#fmtGrid input:checked').map(i => i.value);
    if (!fmts.length) return A().toast('No format chosen', 'Pick at least one format.', 'err');

    const m = meta(rows);
    setBusy(true, `Building ${fmts.length} file(s)…`);

    const done = [], failed = [];
    for (const f of fmts) {
      try { done.push(await exportOne(f, rows, cols, m)); }
      catch (e) { failed.push({ f, msg: MISSING[e.message] || String(e.message || e) }); }
    }
    setBusy(false);

    if (done.length) A().toast(`${done.length} file(s) ready`, done.map(d => d.name).join(' · '), 'ok');
    failed.forEach(x => A().toast(x.f.toUpperCase() + ' could not be built', x.msg, 'err'));
  }

  async function runZip() {
    const rows = activeRows(), cols = activeColumns();
    if (!rows.length) return A().toast('No entries', 'Change the scope or the date range.', 'err');
    if (!cols.length) return A().toast('No columns', 'Tick at least one column.', 'err');

    const fmts = $$('#fmtGrid input:checked').map(i => i.value);
    if (!fmts.length) return A().toast('No format chosen', 'Pick at least one format.', 'err');

    const Zip = lib.JSZip();
    if (!Zip) {
      A().toast('JSZip unavailable', 'Downloading the files individually instead.', 'err');
      return runExport();
    }

    const m = meta(rows);
    setBusy(true, 'Building the ZIP…');
    const zip = new Zip();
    const stampName = `${baseName()}-${stamp()}`;
    const folder = zip.folder(stampName);
    const failed = [];

    for (const f of fmts) {
      try {
        const r = await exportOne(f, rows, cols, m, { silent: true });
        folder.file(r.name, r.blob);
      } catch (e) { failed.push({ f, msg: MISSING[e.message] || String(e.message || e) }); }
    }

    folder.file('SUMMARY.txt',
`${m.company}
${m.title}
Project / nevta: ${m.project || '—'}
----------------------------------------
Generated      : ${m.generatedLabel || new Date(m.generatedAt).toLocaleString('en-IN')}
Total entries  : ${m.count}
TOTAL SHAGUN   : ${A().inr(m.total)}
Average        : ${A().inr(m.avg)}
Largest gift   : ${A().inr(m.high)} — ${m.highWho}
Cash           : ${A().inr(m.cashSum)}
UPI / Online   : ${A().inr(m.upiSum)}
Breakup by method:
${m.methodRows.map(r => `  - ${r.method}: ${r.count} ${r.count === 1 ? 'entry' : 'entries'} — ${A().inr(r.sum)}`).join('\n') || '  -'}

TOTAL: ${m.people} ${m.people === 1 ? 'person' : 'people'} — ${A().inr(m.total)} received

Files in this archive:
${fmts.map(f => `  - ${f.toUpperCase()}`).join('\n')}

Generated by NEVTA BOOK — the neon glass shagun register (100% inside your browser).
`);

    try {
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      download(blob, `${stampName}.zip`);
      logExport(stampName + '.zip', 'zip');
      A().toast('ZIP ready', `${fmts.length - failed.length} files + SUMMARY.txt`, 'ok');
    } catch (e) {
      A().toast('ZIP failed', String(e.message || e), 'err');
    }
    failed.forEach(x => A().toast(x.f.toUpperCase() + ' could not be built', x.msg, 'err'));
    setBusy(false);
  }

  async function quickExport(fmt) {
    const rows = activeRows(), cols = activeColumns();
    if (!rows.length) return A().toast('No entries', 'Add an entry first, then pick a format.', 'err');
    if (!cols.length) return A().toast('No columns', 'Tick at least one column.', 'err');
    const m = meta(rows);
    setBusy(true, `Building ${fmt.toUpperCase()}…`);
    try {
      const r = await exportOne(fmt, rows, cols, m);
      A().toast(`${fmt.toUpperCase()} downloaded`, `${r.name} — logged on the dashboard with date & time.`, 'ok');
    } catch (e) {
      A().toast(fmt.toUpperCase() + ' could not be built', MISSING[e.message] || String(e.message || e), 'err');
    }
    setBusy(false);
  }

  /* ==========================================================================
     Modal
     ========================================================================== */
  function buildColumnChips() {
    const grid = $('#colGrid');
    if (!grid || grid.childElementCount) return;
    const off = ['id', 'createdAt'];           // off by default
    grid.innerHTML = A().FIELDS.map(f => `
      <label class="col-chip">
        <input type="checkbox" id="col-${f.key}" ${off.includes(f.key) ? '' : 'checked'} />
        <span>${esc(f.label)}</span>
      </label>`).join('');
    grid.addEventListener('change', syncCounts);
  }

  function syncCounts() {
    const app = A(); if (!app) return;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('cntAll',  app.allRows.length);
    set('cntSel',  app.selected.length);
    set('cntFilt', app.visible.length);
  }

  function openModal() {
    buildColumnChips();
    syncCounts();
    const m = $('#exportModal');
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#btnExport')?.focus(), 60);
  }
  function closeModal() {
    const m = $('#exportModal');
    if (!m || m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = '';
  }

  function bind() {
    const modal = $('#exportModal');
    if (!modal) return;

    modal.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeModal(); });
    $('#btnExport').addEventListener('click', runExport);
    $('#btnZip').addEventListener('click', runZip);
    $('#btnPrint').addEventListener('click', () => {
      const rows = activeRows(), cols = activeColumns();
      if (!rows.length) return A().toast('No entries', 'Change the scope or the date range.', 'err');
      printReport(rows, cols, meta(rows));
    });
    $$('input[name="rowScope"]').forEach(r => r.addEventListener('change', syncCounts));

    // tap any format card → that single file downloads instantly (and is logged)
    const fg = $('#fmtGrid');
    if (fg) fg.addEventListener('click', e => {
      const lbl = e.target.closest('.fmt');
      if (!lbl) return;
      const inp = lbl.querySelector('input');
      if (inp) quickExport(inp.value);
    });

    renderExportLog();
  }

  /* ---------- Public API ---------- */
  window.NexoraExports = {
    openModal, closeModal, syncCounts,
    quick: quickExport, logList: readLog, projectName: readProjectName,
    rows: activeRows, cols: activeColumns, meta,
    build: { xml: buildXML, json: buildJSON, csv: buildCSV, md: buildMarkdown, html: buildHTML, pdf: buildPDF }
  };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', bind) : bind();
})();
