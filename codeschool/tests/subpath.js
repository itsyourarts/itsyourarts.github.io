const { chromium } = require('playwright');
const PREFIX = process.env.PREFIX || 'http://127.0.0.1:8020/myrepo';
let fails = 0;
const chk = (n, c, x) => { console.log((c ? 'PASS' : 'FAIL') + ' ' + n + (x ? ' | ' + x : '')); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  const bad = [];
  p.on('requestfailed', r => bad.push(r.url()));
  p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  const errs = []; p.on('pageerror', e => errs.push(e.message));

  await p.goto(PREFIX + '/index.html', { waitUntil: 'networkidle' });
  chk('subpath: home page loads', (await p.title()).includes('GodxShadow'), await p.title());
  chk('subpath: live stats render', /561/.test(await p.locator('#stats, .stats, body').first().innerText()));

  await p.goto(PREFIX + '/tutorials.html?c=css&l=grid', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  chk('subpath: CSS chapter renders', /CSS Grid/.test(await p.locator('h1').first().innerText()));
  chk('subpath: sidebar lists lessons', (await p.locator('#sidebar .sb-links a').count()) > 500);
  chk('subpath: Try-it playground mounted', (await p.locator('.pgw').count()) > 0);
  await p.locator('.pg-run').first().click();
  await p.waitForTimeout(900);
  const frame = p.frameLocator('#pgHost .pg-frame');
  const cols = await frame.locator('.grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length).catch(() => -1);
  chk('subpath: responsive demo works (2 cols in narrow pane)', cols === 2, 'cols=' + cols);

  chk('subpath: no broken asset requests', bad.length === 0, bad.slice(0, 3).join(' , ') || 'clean');
  chk('subpath: no page errors', errs.length === 0, errs.slice(0, 2).join(' || ') || 'none');
  await b.close();
  console.log(fails === 0 ? 'ALL PASS' : fails + ' FAILURES');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
