# GODXSHADOW ⚡ Sarkari Result LIVE (+ 📸 Instagram Downloader)

Neon-glass **Sarkari Result** feed (Results, Admit Cards, Latest Jobs, Answer Key, Syllabus…)
aur andar hi **📸 Instagram Downloader** — ek hi project me.

- **Node mode** (Render / Docker / local): source site se **live** data, cache ke saath
- **Static mode** (GitHub Pages / Netlify / Vercel): `public/data/**` snapshot se chalta hai
- **Zero dependencies** — `npm install` 1 second me

---

## ⚡ Quick start (local)

```bash
npm install          # kuch install nahi hoga (zero deps)
npm start            # -> http://localhost:3000
```

Static fallback data banani ho to:

```bash
npm run snapshot     # public/data/** regenerate (302 posts, 40 shard files)
```

## 🐳 Docker

```bash
docker build -t godxshadow .
docker run -p 3000:3000 godxshadow

# bina snapshot ke (fast build):
docker build --build-arg SKIP_SNAPSHOT=1 -t godxshadow .

# ya compose se:
docker compose up --build
```

Health check: `GET /api/status` → `{"ok":true,...}`

## 🚀 Render (recommended)

Repo → **Render Dashboard → New → Blueprint** → `render.yaml` apne aap read hoga → **Apply**.

Ya manually: **New → Web Service** → repo select →

| Field | Value |
|---|---|
| Runtime | **Node** |
| Build Command | `npm install --omit=dev --no-audit --no-fund; node scripts/snapshot.js \|\| echo "snapshot skipped"` |
| Start Command | `node server.js` |
| Health Check Path | `/api/status` |
| Plan | Free |

Env vars: `NODE_VERSION=20`, `PORT=3000`, `SNAPSHOT_POSTS=1500`, `SNAPSHOT_CONC=6`, `SOON_DAYS=7`

Detail steps: **`RENDER-DEPLOY.md`**

> Render free plan par service 15 min idle ke baad **sleep** ho jati hai (pehli request
> me ~30s lag sakta hai). Hamesha jagana ho to Starter plan (~$7/mo) ya uptime ping.

---

## 🌐 Doosre hosts

| Host | Kaise | Data |
|---|---|---|
| **GitHub Pages** | `public/` upload + `.github/workflows/pages.yml` | snapshot, Actions har 15 min refresh |
| **Netlify** | Drop folder (quick) ya Git + `netlify.toml` | snapshot (manual / build-hook) |
| **Vercel** | `vercel.json` (serverless) ya static `public/` | snapshot |
| **Heroku / Fly / Railway** | `Procfile` (`web: node server.js`) | **live** |
| **VPS** | `docker compose up -d` | **live** |

---

## 📁 Structure

```
server.js              Node server (live API + static files) — 0.0.0.0, PORT env
scripts/snapshot.js    static snapshot builder (302 posts -> 40 shards)
public/
  index.html app.js styles.css parser.js source-proxy.js
  data/                15 JSON + data/post/NN.json (40 shards)
insta-app/             📸 Instagram Downloader (standalone copy)
Dockerfile  .dockerignore  docker-compose.yml
render.yaml  Procfile  vercel.json
deploy-github/         netlify.toml + GitHub Actions workflows
docs/                  purane guides / changelog
```

## ⚙️ Env vars

| Var | Default | Matlab |
|---|---|---|
| `PORT` | `3000` | server port |
| `SNAPSHOT_POSTS` | `1500` | kitne posts ki detail save karein |
| `SNAPSHOT_CONC` | `6` | ek saath kitne fetch |
| `SOON_DAYS` | `7` | red zone "jald khatam" window |

## ✨ Features

- 🔴 **LAST DATE ZONE** — hero pe ⇄ switch (tap): aaj/jald khatam hone wale forms, red neon
- 🔍 **Search** (2+ akshar), 📸 **Insta Downloader** (iframe), ⛶ **Full View**
- **Drawer** 1400px, **Back/Top/Quick bar** har page par, **snapshot age chip**
- Card hover: halka glass + shine, ek baar

---

Fan-made interface. Data live fetch hota hai `sarkariresult.com.cm` se —
official government site par hamesha verify kar lo.
