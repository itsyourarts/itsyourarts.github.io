const { chromium } = require('playwright');
let fails = 0;
const chk = (n, c, x) => { console.log((c ? 'PASS' : 'FAIL') + ' ' + n + (x ? ' | ' + x : '')); if (!c) fails++; };
(async () => {
  // Chromium is tricked into thinking the static host IS github.io
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP godxshadow-demo.github.io 127.0.0.1'] });
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const reqs = [];
  p.on('request', r => { if (r.url().includes('/run')) reqs.push(r.url()); });

  await p.goto('http://godxshadow-demo.github.io:8010/tutorials.html?c=python&l=hello-world', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  await p.locator('.cp-run').first().click();
  await p.waitForTimeout(900);
  const out = await p.locator('.cp-out').first().innerText().catch(() => '');
  chk('github.io: clear static-deploy message', /static deploy/i.test(out), out.split('\n')[0].slice(0, 80));
  chk('github.io: points to server.py / GXS_API fix', /server\.py/.test(out) && /GXS_API/.test(out));
  chk('github.io: no bogus network call attempt', reqs.length === 0, 'run-requests=' + reqs.length);

  // chapters/navigation still fine on a subpath-style static host
  await p.goto('http://godxshadow-demo.github.io:8010/tutorials.html?c=css&l=grid', { waitUntil: 'networkidle' });
  const n = await p.locator("#sidebar .sb-links a").count().catch(() => 0);
  chk('github.io: CSS chapter sidebar renders', n > 20, 'items=' + n);
  await p.screenshot({ path: './preview/19-github-pages-static.png', clip: { x: 300, y: 0, width: 1000, height: 700 } });
  await b.close();
  console.log(fails === 0 ? 'ALL PASS' : fails + ' FAILURES');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
