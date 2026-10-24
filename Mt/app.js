/* View Booster v2 — saara kaam yahi hai */
(function () {
  'use strict';

  var API = 'https://gjoslls.duckdns.org';

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    url: $('url'), target: $('target'), conc: $('conc'), delay: $('delay'), cred: $('cred'),
    bar: $('bar'), done: $('done'), err: $('err'), rate: $('rate'), views: $('views'),
    log: $('log'), diag: $('diag'), one: $('one'), start: $('start'), stop: $('stop'), ver: $('ver')
  };

  var S = { running: false, done: 0, err: 0, target: 0, t0: 0, tick: null };

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var cred = function () { return el.cred.checked ? 'include' : 'omit'; };
  var fmt = function (s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };

  function log(html) {
    var d = document.createElement('div');
    d.innerHTML = '<b>' + new Date().toLocaleTimeString() + '</b> ' + html;
    el.log.insertBefore(d, el.log.firstChild);
    while (el.log.children.length > 200) el.log.removeChild(el.log.lastChild);
  }

  function pid(u) {
    u = (u || '').trim();
    var m = u.match(/\/v\/([A-Za-z0-9]{16,32})/) ||
            u.match(/\/stream\/([A-Za-z0-9]{16,32})/) ||
            u.match(/^([A-Za-z0-9]{16,32})$/);
    return m ? m[1] : null;
  }

  function api(path, opts) {
    return fetch(API + path, opts).then(function (r) {
      return r.text().then(function (t) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 90));
        try { return JSON.parse(t); } catch (e) { throw new Error('JSON nahi: ' + t.slice(0, 90)); }
      });
    });
  }

  function play(id) {
    return api('/api/play/' + id, { credentials: cred(), headers: { 'Accept': 'application/json' } });
  }

  function countView(id, token) {
    return api('/api/view/' + id + '?t=' + encodeURIComponent(token), {
      method: 'POST',
      credentials: cred(),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: '{}'
    });
  }

  function setViews(n) { if (typeof n === 'number') el.views.textContent = n; }

  function update() {
    el.done.textContent = S.done;
    el.err.textContent = S.err;
    el.bar.style.width = (S.target ? Math.min(100, S.done / S.target * 100) : (S.done % 100)) + '%';
    var sec = (Date.now() - S.t0) / 1000;
    el.rate.textContent = sec > 0.5 ? Math.round(S.done / sec * 60) : 0;
  }

  function needMore() { return S.running && (S.target === 0 || S.done < S.target); }

  function diag() {
    var id = pid(el.url.value);
    if (!id) { log('<span class="bad">URL se video id nahi mila.</span>'); return; }
    log('Test: GET /api/play/' + id);
    play(id).then(function (j) {
      log('<span class="ok">&#9989; API khul gaya.</span> title="' + (j.title || '?') + '" &middot; views=' + j.views);
      log('viewToken: ' + (j.viewToken ? '<span class="ok">mila</span>' : '<span class="warn">NAHI mila</span>'));
      setViews(j.views);
    }).catch(function (e) {
      var m = String(e.message);
      if (m.indexOf('403') > -1) log('<span class="bad">&#10060; 403 forbidden_client</span> — API is origin (' + location.origin + ') ko allow nahi karta.');
      else if (m.indexOf('Failed to fetch') > -1) log('<span class="bad">&#10060; CORS / network block</span> — browser request rok raha hai.');
      else log('<span class="bad">&#10060; ' + m + '</span>');
    });
  }

  function testOne() {
    var id = pid(el.url.value);
    if (!id) return;
    el.one.disabled = true;
    var before;
    play(id).then(function (a) {
      before = a; setViews(a.views);
      if (!a.viewToken) throw new Error('viewToken nahi mila');
      return countView(id, a.viewToken);
    }).then(function () {
      return sleep(700);
    }).then(function () {
      return play(id);
    }).then(function (b) {
      setViews(b.views);
      if (b.views > before.views) log('<span class="ok">&#9989; Kaam kar gaya!</span> ' + before.views + ' &rarr; ' + b.views + ' views');
      else log('<span class="warn">&#9888; count nahi badha</span> (' + before.views + ' &rarr; ' + b.views + '). Server IP se dedupe karta ho sakta hai.');
    }).catch(function (e) {
      log('<span class="bad">&#10060; ' + e.message + '</span>');
    }).then(function () { el.one.disabled = false; });
  }

  function worker() {
    var id = pid(el.url.value);
    var gap = Math.max(0, parseInt(el.delay.value, 10) || 0);
    function loop() {
      if (!needMore()) return Promise.resolve();
      return play(id).then(function (info) {
        if (info && info.viewToken) {
          return countView(id, info.viewToken).then(function () {
            S.done++;
            if (typeof info.views === 'number') setViews(info.views + S.done);
          });
        }
        S.err++;
      }).catch(function (e) {
        S.err++;
        if (S.err <= 5) log('<span class="bad">' + e.message + '</span>');
      }).then(function () {
        update();
        return gap ? sleep(gap) : null;
      }).then(loop);
    }
    return loop();
  }

  function start() {
    var id = pid(el.url.value);
    if (!id) { alert('Pehle sahi video URL daalo'); return; }
    S.target = Math.max(0, parseInt(el.target.value, 10) || 0);
    S.done = 0; S.err = 0; S.t0 = Date.now(); S.running = true;
    el.start.disabled = true; el.stop.disabled = false; el.diag.disabled = true; el.one.disabled = true;
    log('Start &rarr; target <b>' + (S.target || 'unlimited') + '</b> &middot; parallel ' + el.conc.value);
    S.tick = setInterval(update, 200); update();
    var n = Math.max(1, Math.min(20, parseInt(el.conc.value, 10) || 4));
    var jobs = [];
    for (var i = 0; i < n; i++) jobs.push(worker());
    Promise.all(jobs).then(function () {
      clearInterval(S.tick);
      S.running = false;
      update();
      el.start.disabled = false; el.stop.disabled = true; el.diag.disabled = false; el.one.disabled = false;
      log('<span class="ok">Ruk gaya</span> &mdash; ' + S.done + ' views &middot; ' + S.err + ' error &middot; ' + fmt((Date.now() - S.t0) / 1000));
    });
  }

  function stop() { S.running = false; el.stop.disabled = true; log('Stopping...'); }

  el.diag.addEventListener('click', diag);
  el.one.addEventListener('click', testOne);
  el.start.addEventListener('click', start);
  el.stop.addEventListener('click', stop);
  el.url.addEventListener('change', diag);

  ['url', 'target', 'conc', 'delay', 'cred'].forEach(function (k) {
    var v = localStorage.getItem('vb2_' + k);
    if (v !== null) { if (k === 'cred') el.cred.checked = (v === '1'); else el[k].value = v; }
    el[k].addEventListener('change', function () {
      localStorage.setItem('vb2_' + k, k === 'cred' ? (el.cred.checked ? '1' : '0') : el[k].value);
    });
  });

  el.ver.textContent = 'JS loaded \u2713';
  el.ver.className = 'pill ok';
  log('Endpoints: GET /api/play/{id} &rarr; POST /api/view/{id}?t=token');
  log('Ready. API test chala raha hu...');
  diag();
})();