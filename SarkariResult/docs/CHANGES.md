# Changes log

## 23 Sept 2026 — Round 2 (deploy ke baad aayi problems ka fix)

### 1. ❌ "Ye post static snapshot me save nahi thi" → ✅ ab koi post missing nahi

**Wajah:** snapshot sirf **top 120** posts ki detail save karta tha, jabki app **309** posts dikhata hai. Baaki par click karte hi local file nahi milti thi → CORS proxy try → proxy blocked → "sabhi proxies failed".

**Fix:**

| File | Line | Kya badla |
|---|---|---|
| `scripts/snapshot.js` | 23 | `SNAPSHOT_POSTS` default **120 → 1500** (matlab saare posts) |
| `scripts/snapshot.js` | ~120–160 | Step 5 ab REST top-N ki jagah **poore index (309)** se detail banata hai; concurrency **3 → 6**; **incremental** — jis post me koi badlav nahi (`modified <= saved.fetchedAt`) wo dobara fetch nahi hota |
| `scripts/snapshot.js` | 180 | `meta.json` me ab `posts / reused / total / coverage` bhi likhta hai |

Result: `309 / 309` posts saved (pehle 102). Pehla full run **28 second**, uske baad har run sirf naye posts laata hai.

### 2. 🛡️ Kabhi koi ugly error nahi — hamesha kaam karne wala panel

| File | Line | Kya badla |
|---|---|---|
| `public/app.js` | ~131 `DS.post()` | 4-step chain: **1)** node server → **2)** `data/post/<slug>.json` → **3)** `index.json` se bana **partial** post (title + date + original link) → **4)** proxy. Ab **kabhi throw nahi karta** |
| `public/app.js` | ~614 `wireTryLive()` | "⟳ Live fetch" fail hone par bhi seedha original link dikhta hai |
| `public/app.js` | ~634 `paintPartial()` | 🆕 Naye post ke liye: title + date + "site har 30 min me auto-update hoti hai" + **↗ Original site par kholo** |
| `public/app.js` | ~657 `paintPostFallback()` | Purana "LOAD FAILED / sabhi proxies failed" hata diya — ab "📄 DETAIL LOAD NAHI HO PAAYA" + original link + retry + refresh |
| `public/styles.css` | end | `.pmeta` style (partial panel ki date line) |

### 3. 🔄 Auto-update har 15 minute (sab kuchh: data + links)

| File | Badlaav |
|---|---|
| `.github/workflows/pages.yml` | cron `*/30` → **`*/15`** (GitHub Pages limit 10 build/hour; 4 use hote hain) |
| `scripts/snapshot.js` | Incremental fetch — har run me sirf naye/updated posts (28s → aage aur tezz) |
| `server.js` `getLastDate()` | 60 → **200 posts** scan, 5 → **8 workers** (red zone static jaisa hi bhare) |
| `public/app.js` `loadRedZone()` | Server mode me pehle snapshot file se **turant** red zone (0.2s), phir live API se refresh (pehle 12s "checking…" dikhta tha) |

### 4. 🔴 LAST DATE ZONE = red neon + highlighted words

| File | Kya |
|---|---|
| `public/styles.css` ~360–460 | `.fb-title.rz` neon text-shadow (4 layer) + **`rzFlicker`** animation; `.hero-back .fb-head` red glow; `.rz-grid` do radial red glows; `.rz-item` neon border + hover shine sweep; `.rz-today` **`rzPulse`** breathing glow; badges neon box-shadow |
| `public/styles.css` | `.fb-note b` → note ke numbers (`aaj **2** · 7 din me **26** · chal rahe **37**`) red neon |
| `public/styles.css` | **`.rz-t .hl`** → highlighted shabd white + double red glow |
| `public/app.js` `hlTitle()` | Title me `Last Date`, `Last Date Today/Tomorrow/Extended`, `Online Form`, `Last Chance` ko `<b class="hl">` me wrap karta hai |
| `public/app.js` `renderRedZone()` | Note ab `innerHTML` me `<b>` numbers ke saath |

### 5. ↔️ Drawer (post panel) aur chauda

| File | Badlaav |
|---|---|
| `public/styles.css` ~710 | `.drawer{width:min(880px,95vw)}` → **`min(1150px,96vw)`** (1600px screen par left edge 450px,matlab screen ka ~72%) |
| `public/styles.css` ~679 | `.drawer-body>*{max-width:960px;margin-inline:auto}` — chauda drawer me bhi content padhne layak beech me |

---

## 23 Sept 2026 — Round 1

1. **Hero flip ka pichla side = 🔴 LAST DATE ZONE** (pehle wala "4 column × top 8" board hata diya). Sirf wahi forms jin ki Last Date aaj hai ya future me hai; order `🔴 AAJ → ⏳ KAL → ⏳ Nd → chal rahe`.
   - Engine: `public/parser.js` 290–388 (`firstDate`, `extractLastDate`, `todayIST`, `daysBetween`, `bucketForms`)
   - API: `server.js` `getLastDate()` + `/api/lastdate`
   - Data: `public/data/lastdate.json` (snapshot) — `node scripts/snapshot.js` se banta hai
2. **Cards se permanent glass hata diya** — hover par `glassFlash` + `shineRun` ek baar (0 → 0.99 peak ~300ms → 0 by ~860ms).
   - `public/styles.css` 472 `.card{`, 483 `.glassfx`, 491/492 `glassFlash`, 503/504 `shineRun`
   - `public/app.js` 443, 465 — card markup me `<span class="glassfx">`

---

## Deploy

```bash
cd godxshadow
git add . && git commit -m "309 posts coverage + neon red zone + wider drawer + 15min auto-update"
git push
```

- Push ke saath hi Actions chalega → snapshot → deploy. Uske baad **har 15 minute** auto-update.
- `public/data/` = **9.4 MB** (309 post details). Ye committed rehna chahiye — agar kabhi snapshot fail ho jaye to purana data hi deploy ho jata hai (khali site nahi). Repo chhota rakhna ho to `public/data/` ko `.gitignore` kar sakte ho, par phir `.github/workflows/pages.yml` se `continue-on-error: true` hata dena.
- Node mode: `node server.js` (port 3000). **`server.js` badalne par restart zaroori**, `public/*` ke liye nahi.

## Verified (puppeteer, static + server dono mode)

- Static: `12/12` random posts full detail · `0 partial · 0 errors`
- Coverage: `index items: 309 | missing post files: 0`
- Red zone static: `aaj 2 · 7 din me 26 · chal rahe 37` (30 rows) · server: `aaj 2 · 7 din me 24 · chal rahe 32`
- Neon: `rzFlicker` + `rzPulse` running, 31 highlighted words
- Drawer: width 1150px, 9 tables
- Console errors: **none**

## 23 Sept 2026 — Round 3 (UI controls)

### 1. 🔴 Red zone me text ab theek se baithta hai
**Asli wajah:** `.fb-grid{grid-template-columns:repeat(4,...)}` (line ~461) `.rz-grid` ke baad aata tha, isliye wahi jeet raha tha → red zone **4 tang columns + 14px gap** me banta tha (3-column wali CSS helpless thi).

| File | Fix |
|---|---|
| `public/styles.css` | Poora red-zone block **file ke end** me move kiya → ab koi override nahi |
| `public/styles.css` | `grid-template-columns: repeat(auto-fill, minmax(228px,1fr))` → jitna area mile **utne column** (1600px par 5, tablet par 3-4, mobile par 1) |
| `public/styles.css` | `.rz-t{min-width:0; overflow-wrap:anywhere}` — flex item ko `min-width:0` nahi tha, isliye title katta nahi, **overflow** hota tha |
| `public/styles.css` | `grid-auto-rows:min-content`, gap `6px 10px`, item `min-height:34px`, padding chhota |

Verified: `5 columns × 245px`, 30 items, **hOverflow 0 · clipped 0 · offGrid 0**, sirf vertical scroll, hero ke andar.

### 2. ⇄ Hover-flip hata kar **upar switch**
| File | Badlaav |
|---|---|
| `public/styles.css` | `.hero:hover > .fliptile-inner` rule **hata di** — ab sirf `.hero.flipped` |
| `public/styles.css` ~181 | Naya **`.flip-switch`** — hero ke top-right me, glass pill + track/knob; ON state red neon |
| `public/index.html` | `<button class="flip-switch" id="flipSwitch">` `.fliptile-inner` ke **bahar** (dono faces par dikhe); `.fb-close` aur purana hover `title` hata diya |
| `public/index.html` | `.flip-hint` → "⇄ upar switch dabao · last date zone" |
| `public/app.js` ~766 | `setFlip(on)` — tap → LAST DATE ZONE, dobara tap → SARKARI RESULT (label + aria-pressed bhi badalta hai). **Hero par click se flip ab nahi hota** |

### 3. ⛶ FX button hata kar **Full View / Exit Full View**
| File | Badlaav |
|---|---|
| `public/index.html` | `#fxBtn` (⚡ FX) → `#fullViewBtn` (⛶ Full View) |
| `public/app.js` ~782 | Toggle: `body.fullview` + browser `requestFullscreen()` (fail ho to sirf wide view); label `Full View ↔ Exit Full View`; ESC se exit par label sync |
| `public/styles.css` (end) | `body.fullview` → `.wrap` max-width hata kar poori chaudai, hero 400px, red zone/gird aur chaudi columns, drawer 1400px |

### 4. Card hover halka (corner pe kam)
| File | Badlaav |
|---|---|
| `public/styles.css` | glass `blur(18px) saturate(180%)` → **`blur(10px) saturate(140%)`** |
| `public/styles.css` | `glassFlash` peak opacity **1 → 0.5**, scale 1.02 → 1.015 |
| `public/styles.css` | shine alpha `.30 → .16`, width `42% → 30%` |
| `public/styles.css` | **radial mask** — glass beech me, **kone par fade** (corner pe jyada nahi dikhta) |

Verified: peak opacity `0.4997` (pehle 1.0), end me `0`.

### Verified (puppeteer, server mode)
`HOVER -> flipped:false ✓` · `SWITCH tap1 -> flipped:true` · `tap2 -> flipped:false` ·
`RED ZONE: 5 cols × 245px, 30 items, 0 overflow, inside hero` ·
`FULL VIEW: 1360px → 1600px, label toggles` · `CARD HOVER peak 0.4997 → 0` · **`ERRORS: none`**

Screenshots: `shots/r3-01-switch-front.png`, `r3-02-redzone-fit.png`, `r3-03-fullview.png`, `r3-04-mobile-redzone.png`

## 23 Sept 2026 — Round 4 (search bug + drawer chauda)

### 1. 🐛 Search box me likha hua hat jata tha — FIXED
**Asli wajah:** `onSearchInput()` me `q.trim().length >= 2 ? 380 : 0` — matlab **1 akshar** likhte hi turant (0 ms) `go({type:'search'})` chala, phir `runSearch()` ne length<2 dekh kar `go({type:'home'})` bhej diya, aur `applyEntry()` ke home branch me **`$('#search').value = ''`** → **jo likha wo hat gaya**.

| File | Line | Fix |
|---|---|---|
| `public/app.js` | `onSearchInput()` | Ab: khaali → 250ms baad home; **1 akshar par kuch nahi** (na search, na clear); >=2 akshar par 380ms debounce |
| `public/app.js` | `runSearch()` | 2 akshar se kam par `go(home)` nahi bhejta — "kam se kam 2 akshar likho" hint dikhata hai, **box khali nahi karta** |
| `public/app.js` | `applyEntry()` | Search entry par input value tabhi set karta hai jab input **focused na ho** — typing ke dauran cursor koodta nahi |

### 2. ↔️ Drawer aur chauda
| File | Badlaav |
|---|---|
| `public/styles.css` ~653 | `.drawer{width:min(1150px,96vw)}` → **`min(1400px,98vw)`** (1600px screen par left edge 200px = 87% screen) |
| `public/styles.css` ~684 | `.drawer-body>*` max-width `960px` → **`1080px`** |
| `public/styles.css` (end) | `body.fullview .drawer` → **`min(1700px,99vw)`** |

### Verified (puppeteer — server + static dono mode)
- **Server:** type `rrb ntpc` char-by-char → value har step par bacha (`r|rr|rrb|rrb |rrb n…`), result **6 rows**, pehla "RRB NTPC 10+2 UG Online Form 2026"; `admit card` → **40 rows**
- **Static (GitHub Pages mode):** `ssc cgl` → 2 rows, box khali karne par wapas home (`#/`, 10 cards)
- **Drawer:** 1400px (static + server), fullview me 1584px
- **`ERRORS: none`** dono mode me

Screenshots: `shots/r4-01-search-working.png`, `shots/r4-02-drawer-1400.png`

## 23 Sept 2026 — Round 5 (GitHub Pages auto-update clarity)

User ne GitHub Pages par "🆕 YE POST ABHI SNAPSHOT ME NAAHI AAYA" dekha
(`delhi-high-court-jja-2026`). **Investigation:** wo post hamare data me maujood thi
(`public/data/post/delhi-high-court-jja-2026.json`) → matlab deployed site **purana data**
dikha rahi thi (push coverage-fix se pehle hua tha). Coverage gap **nahi** tha.

| File | Badlaav |
|---|---|
| `public/app.js` `showSnapshotAge()` | 🆕 Naya **snapshot age chip** — `data/meta.json` ke `builtAt` se age nikalta hai; >45 min purana ho to peela ⚠ + tooltip "Actions tab check karo" |
| `public/index.html` | `<span class="age-chip" id="ageChip" hidden>` mode chip ke bagal me |
| `public/styles.css` (end) | `.age-chip` + `.age-chip.stale` styling |
| `public/app.js` `paintPartial()` | Text "har 30 minute" → **"har 15 minute (GitHub Actions)"** (ab cron 15 min hai) + **45s baad khud dobara try** |
| `.github/workflows/pages.yml` | Snapshot step ab **3 attempt retry** (20s gap) — transient failure se deploy purane data par na ruke |
| `GITHUB-PAGES-AUTOUPDATE.md` | 🆕 Poora guide: pipeline diagram, Actions tab se verify kaise karein, 6 common failure + fix, push commands |

**Verified:** age chip dono mode me dikha (`snapshot 46 min purana` + `stale` class);
partial panel ab "har 15 minute me auto-update (GitHub Actions)" + original link dikhata hai;
`ERRORS: none`.
