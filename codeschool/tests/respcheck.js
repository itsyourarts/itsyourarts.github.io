const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8000';
let fails = 0;
function chk(n, c, x) { console.log((c ? 'PASS' : 'FAIL') + ' ' + n + (x ? ' | ' + x : '')); if (!c) fails++; }
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  async function openLesson(c, l) {
    await page.goto(BASE + '/tutorials.html?c=' + c + '&l=' + l, { waitUntil: 'networkidle' });
    await page.click('#pgHost .pg-run');
    await page.waitForTimeout(900);
    const f = page.frameLocator('#pgHost .pg-frame');
    return f;
  }
  const colCount = async (f, sel) => f.locator(sel).first().evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length).catch(() => -1);

  // grid: 3 cols desktop; preview pane (~580px) should hit max-width:640px -> 2 cols
  await openLesson('css', 'grid');
  const f1 = page.frameLocator('#pgHost .pg-frame');
  const cols = await f1.locator('.grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length).catch(() => -1);
  chk('GRID collapses to 2 cols in narrow preview', cols === 2, 'cols=' + cols);

  // pricing-table: plans stack in narrow pane
  await openLesson('css', 'pricing-table');
  const dir = await page.frameLocator('#pgHost .pg-frame').locator('.plans').evaluate(el => getComputedStyle(el).flexWrap).catch(() => 'err');
  const pw = await page.frameLocator('#pgHost .pg-frame').locator('.plan').first().evaluate(el => el.getBoundingClientRect().width).catch(() => -1);
  chk('PRICING plans go full-width on mobile', pw > 280, 'planWidth=' + Math.round(pw) + ' wrap=' + dir);

  // navbars: gap shrinks in narrow pane
  await openLesson('css', 'navbars');
  const gap = await page.frameLocator('#pgHost .pg-frame').locator('.nav').evaluate(el => getComputedStyle(el).gap).catch(() => 'err');
  chk('NAVBAR gap shrinks (10px)', gap === '10px', 'gap=' + gap);

  // fluid-type: live demo renders + heading is fluid
  await openLesson('css', 'fluid-type');
  const ft = await page.frameLocator('#pgHost .pg-frame').locator('h1').evaluate(el => el.textContent).catch(() => '');
  chk('FLUID-TYPE live demo renders', ft.includes('fluid heading'), ft);

  // container-queries: narrow container stacks
  await openLesson('css', 'container-queries');
  const small = await page.frameLocator('#pgHost .pg-frame').locator('.cq.small .item').evaluate(el => getComputedStyle(el).flexDirection).catch(() => 'err');
  const big = await page.frameLocator('#pgHost .pg-frame').locator('.cq:not(.small) .item').evaluate(el => getComputedStyle(el).flexDirection).catch(() => 'err');
  chk('CONTAINER-QUERIES: narrow=column wide=row', small === 'column' && big === 'row', 'small=' + small + ' big=' + big);

  // transforms-3d live demo
  await openLesson('css', 'transforms-3d');
  const card = await page.frameLocator('#pgHost .pg-frame').locator('.scene .card').count();
  chk('TRANSFORMS-3D flip card rendered', card === 1, 'count=' + card);

  // glass-blur live demo
  await openLesson('css', 'glass-blur');
  const glass = await page.frameLocator('#pgHost .pg-frame').locator('.glass').count();
  chk('GLASS-BLUR panels rendered', glass === 2, 'count=' + glass);

  // print-styles: print button works (no js error)
  await openLesson('css', 'print-styles');
  const pb = await page.frameLocator('#pgHost .pg-frame').locator('.pb').count();
  chk('PRINT demo + button rendered', pb === 1, 'count=' + pb);

  console.log('pageerrors:', errs.length ? errs.join(' || ') : 'none');
  await page.screenshot({ path: './preview/18-responsive-tryit.png', clip: { x: 310, y: 0, width: 970, height: 900 } });
  await browser.close();
  console.log(fails === 0 ? 'ALL PASS' : fails + ' FAILURES');
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
