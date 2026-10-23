# VideoFetch Studio

An independent, VideoFetch-inspired website for finding **public MP4 videos and HLS/DASH streams**, choosing a quality the source actually offers, and downloading **one complete MP4 file** rather than individual video chunks. It includes a responsive page, browser-assisted discovery, on-demand preview, and server-side stream merging.

## Run locally

Requires **Node.js 20+** and **FFmpeg** on your `PATH` for HLS/DASH downloads. Direct MP4s work without FFmpeg.

```bash
# Debian/Ubuntu (or install FFmpeg using your operating system's package manager)
sudo apt-get update && sudo apt-get install -y ffmpeg
ffmpeg -version

npm install
npx playwright install chromium
# If Chromium reports missing libraries on Debian/Ubuntu:
npx playwright install-deps chromium
npm start
```

Open **http://localhost:3000**. `npm run dev` enables automatic server restarts; set `PORT=4000` to change the port. Set `ENABLE_BROWSER_SCAN=0` to skip JavaScript/browser-assisted scans (this limits detection of client-side players). Check `/api/health` for FFmpeg and browser-scan availability.

Click **Sample MP4** or **HLS quality demo** on the home page for public test media. A public `.mp4`, `.m3u8`, or `.mpd` link can also be pasted directly.

## How it works

- Inspects page players, metadata, links, embedded data, and up to two iframes. When needed, Chromium observes media network requests from JavaScript-loaded players, including extensionless MP4 URLs, HLS/M3U8 playlists, and DASH/MPD manifests.
- Groups an HLS/DASH video as **one result**, not one result for every `.ts`, `.m4s`, or `.mp4` fragment. Lists **only the resolutions supplied by that source**. For example, 480p, 720p, 1080p, 2K, or 4K appear only if present; no upscaling is performed. A stream without resolution metadata appears as **Source**. An unlabelled MP4 in a page's video player is measured using its encoded video metadata; an HTTP-to-HTTPS redirect of that same file is not shown twice.
- Clicking **Preview** or **Download** opens a quality picker with the MB size for **each available source quality**, even if the source offers only one. Direct MP4 sizes come from the host's `Content-Length` (decimal MB); HLS/DASH sizes are explicitly marked **estimated** when playlist duration and bitrate are known. If the source doesn't provide enough metadata, the size reads **unavailable**, never a fabricated number. The top-bar quality dropdown also shows sizes.
- Playback starts only **after** confirming a quality in the picker. For HLS/DASH, preview merges/plays on demand; seeking in a live-generated preview may be limited. An always-visible **Choose quality** control appears on the player and immediately left of **Download MP4** below it. The custom **three-dot menu** offers **Picture-in-Picture**, **Full view**, **Choose quality** and **Download MP4**, including while the player is fullscreen. Picture-in-Picture depends on browser permissions. These actions use the same source-quality/MB picker; choosing quality or downloading from fullscreen first exits fullscreen so the picker stays visible. Static assets are served with `Cache-Control: no-store` to avoid showing an older version of the UI.
- Click **Download MP4** to stream the selected complete video (plus its available audio) to **one `.mp4` file**. FFmpeg reads segments and remuxes the video while transcoding audio to AAC; it writes the fragmented MP4 directly to the response **without storing the video on the server's disk**. Large/high-resolution videos may take time, and the quality depends on the source.
- Direct MP4 playback and downloads support byte ranges. **Copy link** is offered only for direct MP4s, not for playlists whose chunks need merging. Results have 25-minute tokens; a source's signed URL may expire sooner, in which case scan again. A 2 GB response and a 30-minute conversion limit apply, with at most two merges at a time.
- Public-IP checks apply to requested URLs, redirects, browser requests, and nested HLS/DASH media URLs through a local validating proxy. The browser's non-secret media request headers (e.g., referrer and Fetch Metadata) may be reused; cookies and credentials are never copied.

For example, if a page offers just one 854×480 MP4, its picker shows **480p** and its measured MB size—not fictitious 720p/1080p choices. If a source supplies 240p, 360p, 480p, 720p, 1080p, 1440p and 2160p, the picker offers **240p, 360p, 480p, 720p, 1080p, 2K and 4K** for both preview and download. A source that supplies **only 4K** will show **only 4K**; the app does not transcode missing lower resolutions. Multi-quality HLS/DASH sizes are marked approximate when they can be estimated.

Run `npm test` for parsing, quality selection, original MP4 detection, size estimates, and proxy security checks. FFmpeg-dependent tests skip when it is not installed.

## Limits and permission

This **will not work on every website**. DRM-protected sources, login/session-cookie-only videos, live/incomplete streams, websites that block scanning, and players requiring special human interaction are unsupported. Generic HLS/DASH support does not defeat DRM or site access controls. Some codecs cannot be remuxed to MP4; they may fail rather than being offered as a fabricated quality. The browser scanner does not replicate an interactive remote browsing session.

Only save videos you own or have permission to download. Respect source terms and copyright. This project is independent and not affiliated with videofetch.app.

**Public deployments:** run the browser scanner and FFmpeg in an isolated container, and enforce an outbound firewall blocking private, loopback, link-local, and cloud-metadata networks. Application-level public-IP validation is not a replacement for an egress firewall or resource limits; consider per-user rate limits and appropriate hosting bandwidth.

## Project layout

- `public/index.html`, `public/styles.css`, `public/app.js` — responsive website and quality selector
- `server.js` — scan API, quality-specific tokens, preview and download endpoints
- `lib/scanner.js` — HTML/Chromium media discovery and grouping
- `lib/streams.js` — HLS/DASH manifest parsing and source-quality selection
- `lib/mux.js` — in-memory manifests, public-IP-validated proxy, FFmpeg single-file MP4 output
- `lib/network.js` — public URL validation and HTTP requests
- `tests/` — unit and security regression tests
