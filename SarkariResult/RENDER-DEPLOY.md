# Render par deploy — step by step

## Tariqa 1 — Blueprint (sabse aasan, 2 minute)

1. Is project ko GitHub par push karo (ya wahan upload karo)
2. https://dashboard.render.com → **New + → Blueprint**
3. Repo select karo → Render `render.yaml` khud padh lega
4. Service name confirm karo → **Apply**
5. Build ~1-2 min (snapshot ke saath) → fir **Live** ho jayega
6. URL: `https://godxshadow.onrender.com`

## Tariqa 2 — Manual Web Service

**New + → Web Service** → repo connect → ye values bharo:

| Field | Value |
|---|---|
| Name | `godxshadow` |
| Region | **Singapore** (India ke paas) |
| Branch | `main` |
| Runtime | **Node** |
| Build Command | `npm install --omit=dev --no-audit --no-fund; node scripts/snapshot.js \|\| echo "snapshot skipped"` |
| Start Command | `node server.js` |
| Instance Type | Free |
| Health Check Path | `/api/status` |

**Environment variables:**

| Key | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `PORT` | `3000` |
| `SNAPSHOT_POSTS` | `1500` |
| `SNAPSHOT_CONC` | `6` |
| `SOON_DAYS` | `7` |

→ **Create Web Service**

## Tariqa 3 — Docker (Render + Dockerfile)

`render.yaml` me ye 3 line badal do:

```yaml
    runtime: docker
    dockerfilePath: ./Dockerfile
    dockerContext: ./
```

(Docker build thoda slow hai par same result.)

---

## ✅ Deploy ke baad check karo

```bash
curl https://godxshadow.onrender.com/api/status
# {"ok":true,"uptime":12,"keys":{...}}
```

Site kholo:
- Mode chip: **⚙ node server** (live data — koi snapshot delay nahi)
- Header me **📸 Insta** button → Instagram Downloader andar khulega
- Header me **⇄ switch** → 🔴 LAST DATE ZONE

---

## ⚠️ Render free plan ki baatein

| Cheez | Reality |
|---|---|
| Sleep | 15 min inactive → service soti hai; agle request me **~30s** cold start |
| Hours | 750 instance-hours/month (ek service ke liye kaafi) |
| Disk | Ephemeral — `data/cache.json` restart par reset (koi problem nahi) |
| Bandwidth | 100 GB/month |

**Hamesha jagana ho to:** Starter plan ($7/mo) ya koi uptime pinger
(cron-job.org / UptimeRobot se har 10 min `GET /api/status`).

---

## 🔄 Data kaise fresh rahega (Render par)

Render par **Node server mode** chal raha hai → browser jab bhi `/api/home`,
`/api/latest`, `/api/lastdate` maangta hai, server **source site se live fetch** karta hai
aur cache karta hai (home 300s, lastdate 900s).
**Isliye yahan 15-min wale snapshot/cron ki zaroorat hi nahi** — data hamesha live.

Build command me `node scripts/snapshot.js` sirf **static fallback** ke liye hai
(agar kabhi source down ho to `public/data/**` purana data serve ho jaye).
Uske fail hone par `|| echo "snapshot skipped"` build ko rokta nahi.

---

## 🐛 Kuch gadbad ho to

| Problem | Fix |
|---|---|
| Build fail: `node: command not found` | `NODE_VERSION=20` env var set karo |
| Health check fail | `/api/status` curl se check karo; server 0.0.0.0 par sun raha hai |
| Site khali / CSS nahi | `public/` folder repo me hona chahiye |
| Port error | Render `PORT` env khud set karta hai — `server.js` use padhta hai |
| Build slow (snapshot) | Build command se `node scripts/snapshot.js` hata do |
