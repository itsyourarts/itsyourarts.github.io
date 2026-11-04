/* ShadowWebApps — reusable tool workspace kit */
(function(){
  'use strict';
  const SWA = window.SWA;
  const K = SWA.kit = {};
  const I = name => swaIcon(name);

  /* ================= generic tool shell ================= */
  K.shell = function(tool){
    document.title = `${tool.name} — ShadowWebApps`;
    const root = SWA.$('#app');
    root.innerHTML = `
      <div class="wrap toolhead">
        <div class="crumbs">
          <a href="index.html">Home</a> ${I('arrow')} <a href="index.html#tools">Tools</a> ${I('arrow')}
          <span>${SWA.esc(tool.name)}</span>
        </div>
        <h1><span class="ico">${I(tool.icon)}</span> ${SWA.esc(tool.name)}</h1>
        <p>${SWA.esc(tool.blurb)}</p>
      </div>
      <div class="wrap toolgrid">
        <div id="main" style="display:flex;flex-direction:column;gap:16px"></div>
        <aside class="side" id="side"></aside>
      </div>`;

    /* side: how it works + privacy + related */
    const side = SWA.$('#side');
    const steps = tool.steps || [
      ['Pick your file','Drag it in or browse — it is read locally, never uploaded.'],
      ['Choose the settings','Everything previews instantly.'],
      ['Download','Your new file appears with a download button.']
    ];
    const related = SWA_TOOLS.filter(t => t.live && t.slug !== tool.slug && t.cat === tool.cat).slice(0,4);

    side.innerHTML = `
      <div class="panel">
        <h4>How it works</h4>
        <ol class="steps">
          ${steps.map(([t,d],i) => `<li><span class="num">${i+1}</span><div><b>${SWA.esc(t)}</b><br>${SWA.esc(d)}</div></li>`).join('')}
        </ol>
      </div>
      <div class="panel">
        <h4>Privacy</h4>
        <p style="margin:0;font-size:12.5px;color:var(--muted)">
          ${I('shield')} This tool runs entirely inside your browser using JavaScript.
          Your file is never uploaded to a server, and there is no file-size paywall.
        </p>
        <div style="margin-top:12px"><span class="badge">● local processing</span></div>
      </div>
      ${related.length ? `<div class="panel">
        <h4>Related tools</h4>
        <div class="related">
          ${related.map(t => `<a href="tool.html?t=${t.slug}">${I(t.icon)} ${SWA.esc(t.name)}</a>`).join('')}
        </div>
      </div>` : ''}
      <div class="panel">
        <h4>Shortcuts</h4>
        <div class="mono" style="color:var(--muted);line-height:2">
          <div><kbd style="border:1px solid var(--line-strong);padding:1px 6px;border-radius:5px">/</kbd> search tools</div>
          <div><kbd style="border:1px solid var(--line-strong);padding:1px 6px;border-radius:5px">Esc</kbd> close dialog</div>
          <div><kbd style="border:1px solid var(--line-strong);padding:1px 6px;border-radius:5px">Ctrl</kbd> + <kbd style="border:1px solid var(--line-strong);padding:1px 6px;border-radius:5px">V</kbd> paste a file</div>
        </div>
      </div>`;

    return { main: SWA.$('#main'), side };
  };

  function guessFmts(accept){
    if (!accept) return [];
    const a = String(accept).toLowerCase();
    const out = [];
    if (a.includes('audio')) out.push('MP3','WAV','OGG','M4A');
    if (a.includes('video')) out.push(a.includes('mp4') ? 'MP4' : 'MP4','WEBM','MOV');
    if (a.includes('pdf')) out.push('PDF');
    if (a.includes('image')) out.push('JPG','PNG','WEBP');
    return [...new Set(out)];
  }

  /* ================= file workspace ================= */
  K.workspace = function(ctx, opts){
    const ws = {
      files: [],
      opts: opts || {},
      outs: [],
      _onFiles: null,
      _run: null,
      _runLabel: 'Process'
    };

    const card = document.createElement('div');
    card.className = 'panel';
    card.innerHTML = `
      <div class="dz-host"></div>
      <div class="filelist-host"></div>
      <div class="opts-host" style="margin-top:4px"></div>
      <div class="actions" style="display:none;margin-top:18px;gap:10px;flex-wrap:wrap"></div>
      <div class="prog-host"></div>
      <div class="out-host"></div>`;
    ctx.main.appendChild(card);

    ws.card = card;
    ws.dzHost = card.querySelector('.dz-host');
    ws.fileHost = card.querySelector('.filelist-host');
    ws.optsHost = card.querySelector('.opts-host');
    ws.actions = card.querySelector('.actions');
    ws.progHost = card.querySelector('.prog-host');
    ws.outHost = card.querySelector('.out-host');

    const accept = ws.opts.accept !== undefined ? ws.opts.accept : 'video/*,audio/*,application/pdf,image/*';
    const multiple = !!ws.opts.multiple;
    const fmts = ws.opts.fmts !== undefined ? ws.opts.fmts : guessFmts(accept);
    const label = ws.opts.label || 'Drop your file here';

    ws.dzHost.innerHTML = `
      <div class="dropzone" tabindex="0">
        <div class="dz-ico">${I(ws.opts.icon || 'upload')}</div>
        <h3>${label}</h3>
        <p>${multiple ? 'Drag & drop files, click to browse, or paste with Ctrl+V' : 'Drag & drop, click to browse, or paste with Ctrl+V'}</p>
        <div class="fmts">${fmts.map(f => `<span>${f}</span>`).join('')}</div>
      </div>
      <input type="file" class="sr" ${accept ? `accept="${accept}"` : ''} ${multiple ? 'multiple' : ''}>`;

    const dz = ws.dzHost.querySelector('.dropzone');
    const input = ws.dzHost.querySelector('input[type=file]');

    function addFiles(list){
      const arr = Array.from(list || []).filter(Boolean);
      if (!arr.length) return;
      ws.files = multiple ? ws.files.concat(arr) : arr.slice(0,1);
      ws.resetOutput();
      renderFiles();
      if (ws._onFiles) ws._onFiles(ws.files);
    }
    ws.addFiles = addFiles;

    dz.addEventListener('click', () => input.click());
    dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
    ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', e => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
    document.addEventListener('paste', e => {
      const items = (e.clipboardData && e.clipboardData.files) || [];
      if (items.length) addFiles(items);
    });

    function renderFiles(){
      if (!ws.files.length){ ws.fileHost.innerHTML = ''; return; }
      ws.fileHost.innerHTML = `<div class="filelist">${ws.files.map((f,i) => `
        <div class="filerow">
          <div class="fico">${I(ws.opts.icon || 'file')}</div>
          <div class="fmeta">
            <div class="fname">${SWA.esc(f.name)}</div>
            <div class="fsize">${SWA.bytes(f.size)}${f.type ? ' · ' + SWA.esc(f.type.split('/')[1] || f.type) : ''}</div>
          </div>
          <button class="del" data-i="${i}" title="Remove">${I('x')}</button>
        </div>`).join('')}</div>`;
      ws.fileHost.querySelectorAll('.del').forEach(b => b.onclick = () => {
        ws.files.splice(+b.dataset.i, 1);
        ws.resetOutput(); renderFiles();
        if (ws._onFiles) ws._onFiles(ws.files);
      });
    }
    ws.renderFiles = renderFiles;

    /* option helpers */
    ws.option = function(html){
      if (html instanceof Node){ ws.optsHost.appendChild(html); return html; }
      const d = document.createElement('div');
      d.innerHTML = html;
      ws.optsHost.appendChild(d.firstElementChild || d);
      return d;
    };
    ws.optionRow = function(...nodes){
      const r = document.createElement('div');
      r.className = 'row';
      nodes.forEach(n => r.appendChild(n));
      ws.optsHost.appendChild(r);
      return r;
    };
    ws.clearOptions = () => ws.optsHost.innerHTML = '';

    /* run button */
    ws.setRun = function(labelText, fn){
      ws._run = fn;
      ws._runLabel = labelText || 'Process';
      ws.actions.style.display = 'flex';
      ws.actions.innerHTML = `
        <button class="btn run">${I('bolt')} ${SWA.esc(ws._runLabel)}</button>
        <button class="btn ghost clear">Clear</button>`;
      ws.actions.querySelector('.run').onclick = () => ws.execute();
      ws.actions.querySelector('.clear').onclick = () => {
        ws.files = []; renderFiles(); ws.clearOptions(); ws.resetOutput();
        ws.actions.style.display = 'none'; ws._run = null;
      };
    };

    ws.progress = function(pct, text){
      ws.progHost.innerHTML = `<div class="progress-wrap">
        <div class="plabel"><span>${SWA.esc(text || 'Working…')}</span><span>${Math.round(pct)}%</span></div>
        <div class="progress"><i style="width:${SWA.clamp(pct,0,100)}%"></i></div>
      </div>`;
    };
    ws.progressDone = () => { ws.progHost.innerHTML = ''; };

    ws.resetOutput = function(){
      ws.outHost.innerHTML = ''; ws.progHost.innerHTML = ''; ws.outs = [];
    };

    ws.execute = async function(){
      if (!ws._run) return;
      const btn = ws.actions.querySelector('.run');
      if (btn){ btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Working…`; }
      ws.outHost.innerHTML = '';
      ws.progress(2, 'Starting…');
      const tick = (p, t) => ws.progress(p, t);
      try {
        const res = await ws._run(ws.files, tick);
        ws.progressDone();
        if (res) ws.showResult(res);
      } catch (err){
        console.error(err);
        ws.progressDone();
        ws.outHost.innerHTML = `<div class="err"><b>Something went wrong.</b><br>${SWA.esc(err.message || String(err))}</div>`;
      } finally {
        if (btn){ btn.disabled = false; btn.innerHTML = `${I('bolt')} ${SWA.esc(ws._runLabel)}`; }
      }
    };

    ws.showResult = function(res){
      const files = res.files || [];
      ws.outs = files;
      ws.outHost.innerHTML = `
        <div class="result">
          <h4>${I('check')} ${SWA.esc(res.title || 'Done!')}</h4>
          <p>${SWA.esc(res.desc || 'Your file is ready — it was built on your device.')}</p>
          <div class="dl-row" style="flex-direction:column;align-items:stretch;gap:9px">
            ${files.map((f,i) => `
              <div class="filerow" style="background:rgba(0,0,0,.25)">
                <div class="fico" style="background:rgba(52,211,153,.14)">${I('check')}</div>
                <div class="fmeta">
                  <div class="fname">${SWA.esc(f.name)}</div>
                  <div class="fsize">${SWA.bytes(f.blob.size)}${f.note ? ' · ' + SWA.esc(f.note) : ''}</div>
                </div>
                <button class="btn small dl-one" data-i="${i}">${I('download')} Save</button>
              </div>`).join('')}
          </div>
          <div style="display:flex;gap:9px;margin-top:13px;flex-wrap:wrap">
            ${files.length > 1 ? `<button class="btn small dl-all">${I('download')} Download all</button>` : ''}
            <button class="btn ghost small again">Start over</button>
          </div>
          ${res.html || ''}
        </div>`;
      ws.outHost.querySelectorAll('.dl-one').forEach(b => b.onclick = () => {
        const f = ws.outs[+b.dataset.i];
        SWA.download(f.blob, f.name); SWA.toast('Saved ' + f.name);
      });
      const all = ws.outHost.querySelector('.dl-all');
      if (all) all.onclick = () => ws.outs.forEach((f,i) => setTimeout(() => SWA.download(f.blob, f.name), i*260));
      ws.outHost.querySelector('.again').onclick = () => {
        ws.files = []; renderFiles(); ws.clearOptions(); ws.resetOutput();
        ws.actions.style.display = 'none';
      };
      /* autoscroll result into view */
      ws.outHost.scrollIntoView({behavior:'smooth', block:'nearest'});
    };

    ws.onFiles = fn => { ws._onFiles = fn; };
    return ws;
  };

  /* small range control builder */
  K.range = function({label, min, max, value, step=1, unit='', hint=''}){
    const id = 'r' + Math.random().toString(36).slice(2,8);
    const wrap = document.createElement('label');
    wrap.className = 'field';
    wrap.innerHTML = `
      <span>${SWA.esc(label)} <b class="val" style="color:var(--violet);letter-spacing:0">${value}${unit}</b></span>
      <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
      ${hint ? `<div class="hint">${SWA.esc(hint)}</div>` : ''}`;
    const input = wrap.querySelector('input');
    const val = wrap.querySelector('.val');
    input.oninput = () => val.textContent = input.value + unit;
    wrap.value = () => parseFloat(input.value);
    wrap.set = v => { input.value = v; val.textContent = v + unit; };
    wrap.input = input;
    return wrap;
  };

  K.select = function({label, options, value}){
    const wrap = document.createElement('label');
    wrap.className = 'field';
    wrap.innerHTML = `<span>${SWA.esc(label)}</span>
      <select>${options.map(o => `<option value="${SWA.esc(o.v)}"${o.v===value?' selected':''}>${SWA.esc(o.t)}</option>`).join('')}</select>`;
    const sel = wrap.querySelector('select');
    wrap.value = () => sel.value;
    wrap.set = v => sel.value = v;
    wrap.el = sel;
    return wrap;
  };

  K.field = function({label, value, placeholder, type='text', hint=''}){
    const wrap = document.createElement('label');
    wrap.className = 'field';
    wrap.innerHTML = `<span>${SWA.esc(label)}</span>
      <input type="${type}" value="${SWA.esc(value||'')}" placeholder="${SWA.esc(placeholder||'')}">
      ${hint ? `<div class="hint">${SWA.esc(hint)}</div>` : ''}`;
    const inp = wrap.querySelector('input');
    wrap.value = () => inp.value;
    wrap.el = inp;
    return wrap;
  };

  K.note = html => {
    const d = document.createElement('div');
    d.className = 'note';
    d.innerHTML = `${I('info')}<div>${html}</div>`;
    return d;
  };

  /* lazy-load a script once */
  K.loadScript = function(src){
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement('script');
      s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  };
})();
