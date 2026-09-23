const { chromium } = require('playwright');
let fails = 0;
const chk = (n, c, x) => { console.log((c ? 'PASS' : 'FAIL') + ' ' + n + (x ? ' | ' + x : '')); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();

  // --- A) GitHub-Pages-like static host (no /run backend) ---
  const p1 = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p1.goto('http://127.0.0.1:8010/tutorials.html?c=python&l=hello-world', { waitUntil: 'networkidle' });
  await p1.waitForTimeout(700);
  const btn = p1.locator('.cp-run').first();
  await btn.click();
  await p1.waitForTimeout(1500);
  const outTxt = await p1.locator('.cp-out').first().innerText().catch(() => '');
  chk('static host: honest message (not a crash)', /static deploy|runner unreachable/i.test(outTxt), outTxt.split('\n')[0].slice(0, 90));
  chk('static host: tells the fix (server.py / GXS_API)', /server\.py|GXS_API/.test(outTxt));
  const tutorialOk = await p1.locator('.lesson-title, h1').first().innerText().catch(() => '');
  chk('static host: tutorials + chapters still render', tutorialOk.length > 3, tutorialOk.slice(0, 50));
  await p1.screenshot({ path: './preview/19-github-pages-static.png', clip: { x: 300, y: 0, width: 1000, height: 720 } });
  await p1.close();

  // --- B) full-stack host (server.py) ---
  const p2 = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p2.goto('http://127.0.0.1:8000/tutorials.html?c=python&l=hello-world', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(2200);   // auto-run fires
  const live = await p2.locator('.cp-out').first().innerText().catch(() => '');
  chk('full-stack host: python really executes', /hello/i.test(live), live.replace(/\n/g, ' ⏎ ').slice(0, 80));
  await p2.close();

  await b.close();
  console.log(fails === 0 ? 'ALL PASS' : fails + ' FAILURES');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
