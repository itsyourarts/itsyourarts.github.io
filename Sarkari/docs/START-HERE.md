# GODXSHADOW ⚡ Sarkari Result LIVE — sab kuch ek jagah

Ek hi zip. Iske andar:

| Folder/File | Kya hai |
|---|---|
| `index.html`, `app.js`, `styles.css`, `parser.js`, `source-proxy.js` | **Sarkari Result** site |
| `data/**` | Sarkari data (15 JSON + 40 post shards = 302 posts) |
| **`insta-app/`** | **📸 Instagram Downloader** (standalone copy) |
| `START-HERE.md` | Ye guide |
| `_project/` | Scripts, server, deploy configs, purane guides |
| `index.html`, `app.js`, `styles.css`, `parser.js`, `source-proxy.js` | Website ke code files |
| `data/**` | Saara data (15 JSON + 40 post shards = 305 posts) |
| `START-HERE.md` | Ye file (poora guide) |
| `_project/` | Scripts, server, deploy configs, purane guides |
| `_project/deploy-github/` | Workflows (GitHub Actions) + netlify.toml |

> **Netlify Drop ke liye:** poora zip extract karke folder drop kar do — `index.html` root par hai, site turant chalegi.
> **GitHub ke liye:** `sarkariresult/public/` me ye 5 code files + `data/` upload kar do (60 files).

---

## 1. Deploy kaise karein (3 tarika)

### A) Netlify Drop — 30 second, bina git (demo/manual)
1. Is zip ko extract karo
2. https://app.netlify.com/drop kholo
3. Poori extracted folder drop karo (ya folder ke andar jaakar saari files select karke)
4. Live URL mil jayega — **static · snapshot** mode me chalega, sab links khulenge ✅
5. ⚠️ **Auto-update NAHI** — naya data chahiye to dobara drop karna hoga

### B) GitHub Pages — auto-update ke saath (recommended)
1. Repo me `sarkariresult/public/` → **Add file → Upload files** → 60 files ek hi baar drag-drop → Commit
2. Repo **root** par ek file banao:
   `.github/workflows/sarkariresult-data.yml`
   (content = `_project/deploy-github/sarkariresult-data.yml`)
3. **Settings → Actions → General → Workflow permissions → "Read and write permissions"** → Save
4. **Settings → Pages → Source = "Deploy from a branch → main / root"** rehne do
5. Site: `https://itsyourarts.github.io/sarkariresult/public/`
6. Data **har 30 minute** apne aap fresh (public repo par Actions free + unlimited)

### C) Apne computer par (node server — live API)
```bash
cd _project
npm install        # sirf zaroorat ho to (kuch dependencies nahi hain)
node server.js     # -> http://localhost:3000
```
Ye mode source site se **live** fetch karta hai (koi snapshot nahi).

---

## 2. Auto-update kaise chalega

| Host | Frequency | Kaise |
|---|---|---|
| **GitHub Pages** | **har 30 min** | Actions workflow: `snapshot.js` chalta hai → naya data commit → Pages serve karta hai |
| Netlify (free) | har 4 ghante | `_project/deploy-github/netlify.toml` + build hook + `netlify-build-hook.yml` (300 build-min/month quota) |
| Netlify Drop | ❌ nahi | manual re-drop |

GitHub workflow har run me **sirf naye/badle posts** laata hai (incremental) — ~10-40 second.

---

## 3. Data fresh hai ya nahi — kaise pata chalega

Site ke header me **age chip**:

| Chip | Matlab |
|---|---|
| `snapshot 7 min purana` (neela) | ✅ fresh, auto-update chal raha hai |
| `snapshot 975 min purana` (peela ⚠) | ❌ purana — workflow check karo |

GitHub par check: **Actions tab → "SarkariResult — data refresh"** → green run + time.
Uske log me dikhega: `[snapshot]   posts: 25 fetched, 280 reused (total 305)`.

---

## 4. Kya-kya features hain

- 🔴 **LAST DATE ZONE** — hero pe ⇄ **switch** dabao (hover se nahi): aaj/jald khatam hone wale forms, red neon, highlighted words
- **Search** — 2+ akshar par results (1 akshar par box khali nahi hota)
- **Drawer** — link tap karte hi poori detail (tables + links), chauda 1400px
- **⛶ Full View** — poori chaudai + browser fullscreen
- **Card hover** — halka glass + shine, ek baar (corner pe nahi)
- **Back / Top / Quick bar** — har page par
- **Snapshot age chip** — data kitna purana hai

---

## 5. Agar kuch na chale

| Problem | Fix |
|---|---|
| Click karne par "🆕 snapshot me nahi aaya" | `data/post/*.json` upload nahi hua — poori `data/` folder upload karo (40 shard files) |
| Site bilkul text-only / CSS nahi | `styles.css` + `app.js` root par hone chahiye (`sarkariresult/public/` me) |
| Chip peela (purana data) | Actions tab dekho — workflow fail ho raha hai ya schedule disable |
| Workflow push fail | Settings → Actions → Workflow permissions → **Read and write** |
| Data 16 ghante purana (Netlify Drop) | Netlify me auto-update nahi hota — dobara drop karo ya GitHub Pages use karo |

---

## 6. File map — kaunsi file kahan

**GitHub repo (`itsyourarts.github.io`):**
```
.github/workflows/sarkariresult-data.yml   <- root par (auto-update)
sarkariresult/public/index.html            <- site
sarkariresult/public/app.js
sarkariresult/public/styles.css
sarkariresult/public/parser.js
sarkariresult/public/source-proxy.js
sarkariresult/public/data/**               <- 55 files
sarkariresult/scripts/snapshot.js          <- data banata hai
```

**Netlify Drop:** extracted folder ke root par upar wale 5 code files + `data/`.

---

## 7. Commands (agar git use kar rahe ho)

```bash
git add .
git commit -m "godxshadow: fresh data + fixes"
git push
```

Push ke baad Actions apne aap chalega (agar workflow file hai).

---

## 📸 Instagram Downloader (mix ho gaya)

Site ke **top bar me "📸 Insta" button** hai — har page par dikhega. Dabate hi
**Instagram Downloader** isi site ke andar khul jata hai (Reels / Video / Photo / IGTV HD).

**Kaise kaam karta hai:** downloader ko `iframe` me load kiya hai
(`https://insta-godxshadow.vercel.app/`). Iframe ke andar wo apne hi origin (Vercel) se
`/api/download`, `/api/proxy` call karta hai → **CORS ka koi issue nahi**.
(Verification: demo URL daala → "FETCH SUCCESSFUL @godxshadow", 23 result cards.)

- URL badalna ho to `public/app.js` me sabse upar:
  ```js
  const INSTA_APP = 'https://insta-godxshadow.vercel.app/';
  ```
- "↗ New tab" button se downloader alag tab me bhi khul jata hai.
- Home wapas aane ke liye **← Home** ya **↩ Back**.

### `insta-app/` folder kya hai
Instagram Downloader ki **standalone copy** (`index.html`, `script.js`, `styles.css`).
Ye **sirf Vercel par poora kaam karta hai** — kyunki download logic `/api/*` serverless
functions me hai. Static host (GitHub Pages / Netlify) par ye **demo mode** me chalega.
Isliye main site me iframe use kiya gaya hai (jo har jagah chalega).

Agar downloader ko apne Vercel project me update karna ho to: Vercel project me
`api/download.js`, `api/proxy.js`, `api/unlock.js` already hain — wahin se CORS bhi
enable kar sakte ho (`Access-Control-Allow-Origin: *`) tab iframe ki jagah direct API
call bhi chal jayegi.
