#!/usr/bin/env node
/**
 *  GODXSHADOW · static snapshot builder
 *  ------------------------------------------------------------
 *  GitHub Pages (ya koi bhi static host) par koi backend nahi hota.
 *  Ye script live source se data fetch karke public/data/*.json bana deti hai,
 *  jo browser bina CORS/proxy ke same-origin se read kar leta hai.
 *
 *  Run:  node scripts/snapshot.js
 *  GitHub Actions har 30 minute me chala kar deploy karta hai.
 */
const fs = require('fs');
const path = require('path');

const P = require('../public/parser.js');
const BASE = 'https://sarkariresult.com.cm';
const OUT = path.join(__dirname, '..', 'public', 'data');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const POSTS = Number(process.env.SNAPSHOT_POSTS || 120);   // kitne post details save karein
const PER_CAT = Number(process.env.SNAPSHOT_PER_CAT || 60);

const log = (...a) => console.log('[snapshot]', ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function grab(url, json = false) {
  for (let i = 0; i < 3; i++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 25000);
    try {
      const r = await fetch(url, {
        signal: ac.signal,
        headers: { 'User-Agent': UA, Accept: json ? 'application/json,*/*' : 'text/html,*/*', 'Accept-Language': 'en-IN,en;q=0.9' },
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return json ? await r.json() : await r.text();
    } catch (e) {
      if (i === 2) throw e;
      await sleep(1200 * (i + 1));
    } finally { clearTimeout(t); }
  }
}

const write = (name, obj) => {
  const f = path.join(OUT, name);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(obj));
  return f;
};

const slugOf = (url) => String(url).replace(/\/+$/, '').split('/').pop() || 'x';

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const now = new Date().toISOString();

  /* 1. homepage */
  log('homepage…');
  const home = P.parseHome(await grab(BASE + '/'));
  if (!home.sections.length) throw new Error('homepage parse khali aaya — deploy roka gaya');
  write('home.json', { ...home, fetchedAt: now });
  log('  sections:', home.sections.map((s) => s.title + ':' + s.count).join(', '));

  /* 2. latest + categories */
  log('latest + categories…');
  const rawLatest = await grab(`${BASE}/wp-json/wp/v2/posts?per_page=40&orderby=date&order=desc&_fields=id,date,modified,link,title`, true);
  const latest = { items: P.mapPosts(rawLatest), fetchedAt: now };
  write('latest.json', latest);

  const rawCats = await grab(`${BASE}/wp-json/wp/v2/categories?per_page=100&_fields=id,name,slug,count`, true);
  const cats = (Array.isArray(rawCats) ? rawCats : [])
    .filter((c) => c.count > 0)
    .map((c) => ({ id: c.id, name: P.decode(c.name), slug: c.slug, count: c.count }));
  write('categories.json', { categories: cats, fetchedAt: now });

  /* 3. har section ka category page */
  const index = new Map();
  for (const it of latest.items) index.set(it.url, it);

  for (const s of home.sections) {
    let items = [];
    let total = 0;
    try {
      // "View More" URL se path-slug nikalo (result/ -> result) taaki REST category match ho
      let slugKey = s.id;
      if (s.moreUrl) {
        try { slugKey = new URL(P.abs(s.moreUrl)).pathname.replace(/^\/|\/$/g, '') || s.id; } catch (_) { /* keep id */ }
      }
      const cat = P.resolveCategory(cats, slugKey);
      if (cat) {
        const j = await grab(
          `${BASE}/wp-json/wp/v2/posts?categories=${cat.id}&per_page=${PER_CAT}&page=1&orderby=date&order=desc&_fields=id,date,modified,link,title`,
          true
        );
        items = P.mapPosts(j);
        total = cat.count || items.length;
      }
      if (!items.length && s.moreUrl) {
        items = P.parseListing(await grab(s.moreUrl));
        total = items.length;
      }
    } catch (e) { log('  ! ' + s.title + ': ' + e.message); }

    write(`cat-${s.id}.json`, {
      slug: s.id, name: s.title, page: 1, total, items, fetchedAt: now,
    });
    for (const it of items) if (!index.has(it.url)) index.set(it.url, it);
    log(`  ${s.title}: ${items.length} items`);
    await sleep(250);
  }

  /* 4. search index (client-side instant search ke liye) */
  write('index.json', {
    count: index.size,
    fetchedAt: now,
    items: Array.from(index.values()),
  });
  log('search index:', index.size, 'items');

  /* 5. top N posts ka detail (drawer ke liye) */
  log(`post details (${POSTS})…`);
  // WP REST per_page max 100 hota hai — zarurat pade to page 2 bhi
  const per = Math.min(POSTS, 100);
  let rawForPosts = await grab(
    `${BASE}/wp-json/wp/v2/posts?per_page=${per}&page=1&orderby=date&order=desc&_fields=id,date,link,title`, true
  );
  if (POSTS > 100) {
    const page2 = await grab(
      `${BASE}/wp-json/wp/v2/posts?per_page=${Math.min(POSTS - 100, 100)}&page=2&orderby=date&order=desc&_fields=id,date,link,title`, true
    );
    rawForPosts = rawForPosts.concat(page2);
  }
  const todo = P.mapPosts(rawForPosts).slice(0, POSTS);
  let done = 0;
  for (let i = 0; i < todo.length; i += 3) {
    await Promise.all(todo.slice(i, i + 3).map(async (it) => {
      try {
        const html = await grab(it.url);
        const p = P.parsePost(html, it.url);
        if (p.title) { write('post/' + slugOf(it.url) + '.json', p); done++; }
      } catch (e) { /* skip */ }
    }));
    process.stdout.write(`\r  ${done}/${todo.length}`);
  }
  console.log('');

  write('meta.json', { builtAt: now, source: BASE, posts: done, indexes: index.size });
  log('DONE ->', OUT);
}

main().catch((e) => { console.error('[snapshot] FAILED:', e.message); process.exit(1); });
