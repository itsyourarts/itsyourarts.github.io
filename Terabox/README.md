# GodxShadow — Terabox Downloader (Browser)

Paste a Terabox share link → watch it instantly in the built-in neon HLS player → download it.
No Telegram bot, no external API. Pure Node + Express.

![stack](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![deps](https://img.shields.io/badge/deps-express-blue)

## Features
- 🎬 **Play without login** — 480p HLS stream proxied from Terabox's own `/share/streaming`.
- ⬇ **480p download without login** — TS segments merged into one `.ts` file (plays in VLC / MX Player).
- 💎 **Original quality download** — needs your TeraBox `ndus` cookie (Terabox blocks guests with `31045 user not exists`).
- 🖼 Thumbnail proxy, Range/seek support, fullscreen player.
- 🌐 20+ mirror domains: terabox.com, terasharefile.com, 1024tera.com, 4funbox.com, mirrobox.com, terasharelink.com, freeterabox.com …

## Run locally
```bash
npm install
npm start          # http://localhost:3000
```

## Deploy on Render
1. Push this folder to a GitHub repo.
2. Render → **New +** → **Web Service** → pick the repo.
3. Settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Deploy. (`render.yaml` is included, so *New + → Blueprint* also works in one click.)

The server listens on `process.env.PORT` and binds `0.0.0.0`, which is exactly what Render expects. No environment variables are required.

## API
| Route | Purpose |
|---|---|
| `GET /api/resolve?url=<link>&cookie=<ndus>` | Resolve share link → file list + session token |
| `GET /hls.m3u8?t=&i=` | Proxied 480p HLS playlist (no login) |
| `GET /seg?t=&i=&u=` | HLS segment proxy |
| `GET /hlsdl?t=&i=` | 480p download (`.ts`) |
| `GET /dl?t=&i=` | Original-quality download (needs cookie) |
| `GET /stream?t=&i=` | Inline stream for audio/images |
| `GET /thumb?t=&i=` | Thumbnail proxy |

## How it works
Share page → extract `jsToken` + guest cookies → `/api/shorturlinfo` (sign, timestamp, shareid, uk, file list) → `/api/sharedownload` (original `dlink`) and `/share/streaming` (HLS playlist). Everything is proxied server-side so the browser never hits Terabox directly.

## Notes
- Terabox transcodes 480p live, so a long video's `.ts` download arrives at transcode speed (the server polls up to 10 minutes).
- 720p/1080p streaming requires a logged-in (VIP) Terabox account.
- Free Render instances sleep when idle; the first request after sleep takes ~30s.
- Use only for content you own or that is legally shared with you.

© 2026 **GODXSHADOW** — by Krishna UPX61

## Troubleshooting Render

**`failed to read dockerfile: open Terabox: no such file or directory`**
The service was created with **Runtime = Docker** and a wrong Dockerfile path (`Terabox`).
Fix either way:

- **Recommended (Node runtime):** Render → Service → *Settings* → **Runtime: Node**, Build `npm install`, Start `npm start`, then *Manual Deploy → Clear build cache & deploy*. If the app is in a subfolder of the repo, set **Root Directory** to that folder (e.g. `terabox-web`).
- **Or keep Docker:** a `Dockerfile` is included — set **Dockerfile Path** to `./Dockerfile` (and **Docker Build Context / Root Directory** to the folder containing it).

Also make sure Render is pointed at the repo that actually has this code, and that the branch/commit contains `index.js` + `package.json` at the root directory you configured.
