const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8000';
let fails = 0;
function chk(n, c, x) { console.log((c ? 'PASS' : 'FAIL') + ' ' + n + (x ? ' | ' + x : '')); if (!c) fails++; }
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  // 1) PYTHON lesson -> python editor + auto-run output
  await page.goto(BASE + '/tutorials.html?c=python&l=intro', { waitUntil: 'networkidle' });
  const cp = page.locator('#pgHost .cpw');
  chk('P1 code playground mounted', (await cp.count()) === 1);
  chk('P2 python title shown', ((await cp.locator('.pg-title').textContent()) || '').includes('Python'));
  await page.waitForTimeout(2500);
  const out1 = await cp.locator('#cpOut').innerText();
  chk('P3 auto-run output: Hello GodxShadow', out1.includes('Hello, GodxShadow!'), out1.slice(0, 60));
  const ed = cp.locator('.cp-code');
  chk('P4 editor has python code', ((await ed.inputValue()) || '').includes('print'));
  // edit + re-run
  await ed.fill('print("edited:", 20 + 3)');
  await cp.locator('.cp-run').click();
  await page.waitForTimeout(2000);
  const out2 = await cp.locator('#cpOut').innerText();
  chk('P5 edited code runs', out2.includes('edited: 23'), out2.slice(0, 40));
  // panel Run button (codewrap data-run)
  await page.locator('.codewrap [data-run]').first().click();
  await page.waitForTimeout(2000);
  const out3 = await cp.locator('#cpOut').innerText();
  chk('P6 panel Run ▶ restores+runs lesson code', out3.includes('Hello, GodxShadow!'), out3.slice(0, 60));
  // single code panel, not html/css/js
  chk('P7 single language panel', (await page.locator('.codewrap').count()) === 1, 'count=' + await page.locator('.codewrap').count());
  await page.screenshot({ path: './preview/16-python-runner.png' });

  // 2) C# lesson
  const page2 = await browser.newPage({ viewport: { width: 1360, height: 900 } });
  page2.on('pageerror', e => errs.push('csharp: ' + e.message));
  await page2.goto(BASE + '/tutorials.html?c=csharp&l=intro', { waitUntil: 'networkidle' });
  const cp2 = page2.locator('#pgHost .cpw');
  chk('C1 csharp playground mounted', (await cp2.count()) === 1);
  chk('C2 csharp title', ((await cp2.locator('.pg-title').textContent()) || '').includes('C#'));
  await page2.waitForTimeout(3000);
  const cout = await cp2.locator('#cpOut').innerText();
  chk('C3 csharp ran: Hello from C#', cout.includes('Hello from C#!'), cout.slice(0, 80));
  await page2.screenshot({ path: './preview/17-csharp-runner.png' });

  // 3) SQL lesson
  const page3 = await browser.newPage();
  page3.on('pageerror', e => errs.push('sql: ' + e.message));
  await page3.goto(BASE + '/tutorials.html?c=sql&l=select', { waitUntil: 'networkidle' });
  const cp3 = page3.locator('#pgHost .cpw');
  chk('S1 sql playground mounted', (await cp3.count()) === 1);
  await page3.waitForTimeout(2500);
  const sout = await cp3.locator('#cpOut').innerText();
  chk('S2 sql output rows', /row/.test(sout), sout.slice(0, 80));

  // 4) WEB lesson regression: css/flexbox keeps web playground
  const page4 = await browser.newPage();
  page4.on('pageerror', e => errs.push('css: ' + e.message));
  await page4.goto(BASE + '/tutorials.html?c=css&l=flexbox', { waitUntil: 'networkidle' });
  chk('W1 web playground intact', (await page4.locator('#pgHost .pg-frame').count()) === 1 && (await page4.locator('#pgHost .cpw').count()) === 0);

  // 5) non-runnable (rust) shows info, no crash
  const page5 = await browser.newPage();
  page5.on('pageerror', e => errs.push('rust: ' + e.message));
  await page5.goto(BASE + '/tutorials.html?c=rust&l=control', { waitUntil: 'networkidle' });
  const cp5 = page5.locator('#pgHost .cpw');
  chk('R1 rust code editor mounted', (await cp5.count()) === 1);
  await page5.waitForTimeout(2500);
  const rout = await cp5.locator('#cpOut').innerText();
  chk('R2 rust info message', rout.includes('not installed') || rout.includes('for learning'), rout.slice(0, 60));

  console.log('pageerrors:', errs.length ? errs.join(' || ') : 'none');
  await browser.close();
  console.log(fails === 0 ? 'ALL PASS' : fails + ' FAILURES');
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
