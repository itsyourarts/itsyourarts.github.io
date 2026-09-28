# Aapke liye READY ZIP + deploy steps

## 🎁 Zip files (workspace ke `dist/` folder me)

| File | Size | Files | Kya hai |
|---|---|---|---|
| **`dist/godxshadow-site.zip`** | **1.06 MB** | **60** | Poori website — `index.html`, `app.js`, `styles.css`, `parser.js`, `source-proxy.js` + `data/` (15 JSON + 40 post shards) |
| `dist/godxshadow-project.zip` | 1.08 MB | 72 | Poora project (scripts, server.js, package.json, workflows) — local node mode ya kisi aur host ke liye |

> Pehle 8.5 MB / 314 files the. Ab posts **40 balanced shard files** me hain
> (`data/post/00.json … 39.json`) → sirf **60 files**, ek hi drag-drop me upload ho jayenge.

---

## 🚀 Tariqa 1 — GitHub par upload (recommended, aapka repo wahi rahega)

### Step 1 — Zip download karke extract karo
`dist/godxshadow-site.zip` download karo → apne PC/phone me **extract** karo
(GitHub web UI zip ko khud extract nahi karta, isliye extract karke upload karna hoga).

### Step 2 — `sarkariresult/public/` me upload
1. GitHub par `itsyourarts.github.io` repo kholo → **`sarkariresult/public`** folder me jao
2. **Add file → Upload files**
3. Extract kiye hue saare **60 files/folder** drag-and-drop karo (ek hi baar me, limit 100 hai)
4. Niche **Commit changes** dabao

Purani files replace ho jayengi — koi dikkat nahi.

### Step 3 — Auto-update ke liye 1 file banao (optional par zaroori)
**Add file → Create new file** → naam:
```
.github/workflows/sarkariresult-data.yml
```
Content = `deploy-github/sarkariresult-data.yml` (paste kar do).
Phir **Settings → Actions → General → Workflow permissions → "Read and write permissions"** → Save.

Ab data **har 30 minute** apne aap refresh hoga.

### Step 4 — Site kholo
```
https://itsyourarts.github.io/sarkariresult/public/
```
Ab kisi bhi link pe tap karo → **poori detail khulegi** ✅

---

## ⚡ Tariqa 2 — Netlify Drop (sabse fast, git ki zaroorat nahi)

1. https://app.netlify.com/drop kholo
2. Extract kiya hua **site folder** (ya `godxshadow-site.zip`) drag-and-drop karo
3. 30 second me live URL mil jayega — 100% static mode me chalta hai

(Auto-update ke liye Netlify me build-hook + cron chahiye — GitHub wala tariqa uske liye better hai.)

---

## ❌ Abhi aapki site par click kyun kaam nahi kar raha tha (diagnosis)

Maine aapki live site khud check ki:

```
MODE: ☁ static · snapshot
rows/cards: { cards: 10, rows: 251 }        ← UI theek chal raha hai
click -> drawer khulta hai par:
"🆕 YE POST ABHI SNAPSHOT ME NAAHI AAYA"    ← data/post/<slug>.json = 404
```

Matlab UI bilkul sahi hai, bas **post ki JSON files upload hi nahi hui thi**
(web UI me 314 files upload karna mushkil tha). Ab 40 shards hain → sab upload ho jayega.

---

## 🔧 Is update me kya badla

| File | Badlaav |
|---|---|
| `public/parser.js` | 🆕 `shardKey(slug)` — djb2 hash → 40 balanced buckets |
| `scripts/snapshot.js` | Post details ab shard files me likhta hai (`data/post/NN.json` = `{slug: post}`), incremental reuse ke saath |
| `public/app.js` `DS.post()` | Pehle shard padhta hai (ek hi request), purani single-file style fallback, phir partial panel |
| `deploy-github/sarkariresult-data.yml` | Root-level workflow — har 30 min data refresh + commit |

## ✔️ Verified
- `308 posts | shard me missing: 0`
- Static mode: **10/10 random posts full detail**, click → drawer me 9 tables
- Console errors: sirf **1** expected (`api/home` probe)
- Incremental: `17 fetched, 291 reused` (10 second)
- Zip: **60 files, 1.06 MB**
