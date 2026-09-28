# GitHub Pages par snapshot kahan se aata hai + auto-update kaise chalega

## 1. Aapko wo error kyun dikha

`delhi-high-court-jja-2026` hamare data me **maujood hai** (`public/data/post/delhi-high-court-jja-2026.json`).
Matlab aapki **deployed site purana data dikha rahi thi** — kyunki aapne push us waqt kiya tha jab
snapshot sirf **top 120 posts** save karta tha. Ab coverage **309/309** hai.

Seedha fix = naya code + naya data push karna (niche step 6).

---

## 2. Snapshot kahan se aata hai (poorI pipeline)

```
GitHub Actions (har 15 min, GitHub ke server par)
        │
        ├─ 1. repo checkout karta hai
        ├─ 2. node scripts/snapshot.js chalata hai
        │        └─ live site (sarkariresult.com.cm) se data fetch karke
        │           public/data/*.json likhta hai  (home, latest, categories,
        │           index, lastdate, post/<slug>.json … 309 posts)
        ├─ 3. public/ folder ko artifact banata hai
        └─ 4. GitHub Pages par deploy karta hai
                     │
                     ▼
           aapki site (https://<user>.github.io/<repo>/)
                     │
                     └─ browser same-origin se data/*.json padh leta hai
                        (koi backend/CORS proxy nahi chahiye)
```

**Isliye GitHub Pages par bhi data live hi rehta hai** — bas 15 minute ka gap hota hai
(post publish hone ke baad max ~15-20 min me site par aa jata hai).

### Trigger kaun se hain (`.github/workflows/pages.yml`)
| Trigger | Kab |
|---|---|
| `push` (main/master) | jab bhi aap code push karein |
| `schedule: cron "*/15 * * * *"` | **har 15 minute** — bina kuch kiye |
| `workflow_dispatch` | Actions tab se manually "Run workflow" |

---

## 3. Auto-update chal raha hai ya nahi — kaise check karein (30 second)

1. Repo kholo → **Actions** tab.
2. Left me **"Build & Deploy GODXSHADOW to GitHub Pages"** workflow.
3. Sabse upar wala run dekho:
   - **✅ green + "~15 minutes ago"** → sab theek, auto-update chal raha hai.
   - **❌ red** → run fail ho raha hai (niche section 4).
   - **koi run nahi / purana run** → schedule chal hi nahi raha (section 4).
4. Run ke andar **"Build live data snapshot"** step kholo → wahan likha hoga:
   ```
   [snapshot]   posts: 17 fetched, 292 reused (total 309)
   [snapshot] red zone -> today:2 soon:26 open:37
   [snapshot] DONE -> /home/runner/work/.../public/data
   ```

### Site par hi naya indicator (abhi add kiya hai)
Header me mode chip ke bagal me ek chhota chip dikhega:

| Chip | Matlab |
|---|---|
| `snapshot 7 min purana` (neela) | ✅ auto-update chal raha hai |
| `snapshot 46 min purana` (peela ⚠) | ❌ Actions **15 min me nahi chala** — Actions tab check karo |

Ye chip `public/data/meta.json` ke `builtAt` se banta hai — yahi asli proof hai ki
deployed data kitna fresh hai.

---

## 4. Agar auto-update na chal raha ho to — 6 common wajah + fix

**① Pages ka source "GitHub Actions" nahi hai**
> Repo → **Settings → Pages → Source** → **GitHub Actions** select karo.
> ("Deploy from a branch" par ye workflow deploy nahi kar payega.)

**② Workflow file default branch par nahi hai**
> Schedule hamesha **default branch** ke workflow file se chalta hai.
> Agar aapne `master` pe push kiya par default branch `main` hai, to `.github/workflows/pages.yml`
> `main` par bhi hona chahiye. Check: repo ke main page par `.github/workflows/pages.yml` dikhai de?

**③ Actions disabled hain**
> **Settings → Actions → General → Actions permissions** → "Allow all actions and reusable workflows".

**④ Workflow ka permission block**
> Hamare file me already hai:
> ```yaml
> permissions:
>   contents: read
>   pages: write
>   id-token: write
> ```
> Agar repo ke **Settings → Actions → General → Workflow permissions** me
> "Read repository contents and packages permissions" select hai to `pages: write` block ho sakta hai →
> "Read and write permissions" select karo.

**⑤ Schedule disable ho gaya (60 din tak repo me koi activity na ho)**
> GitHub scheduled workflows ko 60 din inactive rehne par disable kar deta hai.
> Fix: koi bhi commit push karo → schedule wapas chalne lagta hai.
> (Isliye maine har run me **3 attempt retry** add kiya hai, taaki koi transient failure na ruke.)

**⑥ Source site ne GitHub ke IP ko block/rate-limit kiya**
> Snapshot step `continue-on-error: true` hai → tab purana (committed) data deploy hota hai,
> site kabhi blank nahi hoti. Ab 3 baar retry bhi hota hai (20s gap ke saath).

---

## 5. Ek aur important baat — scheduled run kabhi late ho sakta hai

GitHub cron **exact 15 min ki guarantee nahi deta** (peak time par 5-20 min late ho sakta hai).
Isliye:
- Naya post site par aane me **15-30 min** lag sakte hain — ye normal hai.
- Agar koi post abhi bhi "🆕 YE POST ABHI SNAPSHOT ME NAAHI AAYA" dikhaye to
  us panel me ab **"har 15 minute me auto-update (GitHub Actions)"** likha hai +
  **↗ Original site par kholo** button + **45 second baad khud dobara try** karta hai.

---

## 6. Abhi kya karein (ek baar, 2 minute)

```bash
cd godxshadow

# (agar repo pehle se linked hai)
git pull

git add .
git commit -m "309-post coverage, search fix, wider drawer, snapshot age chip"
git push
```

Push ke turant baad:
1. **Actions** tab me run start hoga → green hone do (~1-2 min).
2. Site kholo → header me chip `snapshot 0-5 min purana` dikhna chahiye.
3. `delhi-high-court-jja-2026` wala post kholo → ab poori detail khulegi.

> Note: `public/data/` ab **~9.4 MB** hai (309 post details). Ye committed rehna chahiye —
> isse agar kabhi snapshot fail ho jaye to bhi purana data deploy hota hai (site khali nahi hoti).

---

## 7. Local (node server) mode me kya farak hai

| | GitHub Pages (static) | `node server.js` |
|---|---|---|
| Data kahan se | `public/data/*.json` (Actions ne banaya) | live API (`/api/*`) + `data/*.json` fallback |
| Refresh | Actions har 15 min | browser har 60s + server cache |
| Chip | `☁ static · snapshot` | `⚙ node server` |

Dono mode me UI bilkul same hai — path relative hain (`styles.css`, `data/...`),
isliye project site (`user.github.io/repo/`) par bhi sab chalega.
