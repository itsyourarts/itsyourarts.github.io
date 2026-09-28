# Netlify site (`yoursarkariresult.netlify.app`) — kya chal raha hai, kya nahi

## ✅ Jo chal raha hai (maine live check kiya)

```
MODE     : ☁ static · snapshot
UI       : 10 cards, 251 rows, hero theek
CLICK    : drawer khulta hai -> 9 tables, poora post  ✅
DS.post  : shard se 24,070 chars ka poora HTML mila  ✅
404      : sirf 1 (api/home probe — expected)
```

Matlab **site bilkul sahi kaam kar rahi hai**. Link khul rahe hain.

## ❌ Asli problem: data 16 ghante purana tha

```
AGE CHIP: snapshot 975 min purana  [stale]
```

- Aapne jo zip upload ki thi, uska data **23 Sept 15:24 UTC** ka tha
- Aaj **24 Sept 07:40 UTC** hai → data **~16 ghante purana**
- **Netlify sirf static files serve karta hai** — jo upload kiya wahi freeze.
  Netlify Drop (bina git) me **koi auto-update hota hi nahi**.

Isliye red zone me "AAJ" wale forms kal ke dikh rahe the.

---

## 🚀 Turant fix (2 minute)

Naya zip `godxshadow-site.zip` (**1.01 MB**, data **24 Sept 07:39** ka) download karo →
extract → https://app.netlify.com/drop par dobara drop karo.
Site turant fresh ho jayegi: `today 5 · soon 21 · open 37 (aaj 2026-09-24)`.

---

## 🔄 Permanent auto-update — 2 raasta

### Raasta 1 — GitHub Pages (recommended, FREE + unlimited)

Public repo par GitHub Actions **free aur unlimited** hai → data **har 30 minute** fresh.

1. `godxshadow-site.zip` extract karke repo ke `sarkariresult/public/` me upload (60 files, ek hi drag-drop)
2. Repo root par `.github/workflows/sarkariresult-data.yml` banao
   (content = `deploy-github/sarkariresult-data.yml`)
3. *Settings → Actions → General → Workflow permissions → "Read and write permissions"*
4. Site: `https://itsyourarts.github.io/sarkariresult/public/`
5. Header me chip: `snapshot 7 min purana` (neela) = auto-update chal raha hai

> Pages source **"Deploy from a branch → main/root"** hi rehne do (aapka repo multi-tool hub hai).

### Raasta 2 — Netlify + Git (limited free)

Netlify **free plan me sirf 300 build-minutes/month** hain. Ek build ≈ 1.5 min →
**30-min cron mat chalao** (4 din me quota khatam). Realistic: **har 4 ghante**.

1. Poora project GitHub par push karo (`sarkariresult/` ke saath — `scripts/` zaroori hai)
2. Repo root par `deploy-github/netlify.toml` rakho
   (`base = "sarkariresult"`, `command = "node scripts/snapshot.js"`, `publish = "public"`)
   → har build par data **build-time** par fresh hoga
3. Netlify → **Import from Git** → wo repo select karo
4. Netlify → *Site configuration → Build & deploy → Build hooks* → naya hook banao → URL copy
5. GitHub → *Settings → Secrets → Actions → New secret*: `NETLIFY_BUILD_HOOK` = wo URL
6. `.github/workflows/netlify-build-hook.yml` (`deploy-github/` me hai) repo root par rakho
   → har 4 ghante Netlify build trigger hoga, data fresh

---

## ⚖️ Kaunsa raasta chunun?

| | GitHub Pages | Netlify (free) |
|---|---|---|
| Auto-update | **har 30 min** | har 4 ghante (quota ke karan) |
| Cost | free (public repo, unlimited Actions) | free par 300 build-min/month |
| Setup | 1 workflow file | git connect + build hook + secret |
| Best for | **is project ke liye** | quick demo / manual |

**Meri salah:** GitHub Pages use karo (Raasta 1). Netlify wali site ko link ke liye rakh sakte ho.

---

## 🔍 Khud kaise check karein ki data fresh hai

Site par header me **age chip** dekho:

| Chip | Matlab |
|---|---|
| `snapshot 7 min purana` (neela) | ✅ fresh |
| `snapshot 975 min purana` (peela ⚠) | ❌ purana — auto-update nahi chal raha |
