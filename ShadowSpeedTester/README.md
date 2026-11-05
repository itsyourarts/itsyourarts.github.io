# ShadowSpeedTest

A dark, neon reimagining of the classic speed-test experience — built as a single, dependency-free HTML file.

## Run it

Open `index.html` directly, or serve the folder:

```bash
cd shadowspeedtest
python3 -m http.server 4173 --bind 0.0.0.0
# then open http://localhost:4173
```

## What it actually measures

| Phase | Method |
| --- | --- |
| Ping / Jitter | Repeated `GET https://speed.cloudflare.com/__down?bytes=0` requests, median RTT + mean consecutive variation |
| Download | 4 parallel CORS fetches of `__down?bytes=N`, chunk-level byte sampling through a `ReadableStream` reader, adaptive chunk size, ~8 s window |
| Upload | `XMLHttpRequest` POST of a generated blob to `__up`, sampled via `upload.onprogress`, adaptive payload size |

The endpoint returns `Access-Control-Allow-Origin: *`, so a plain browser fetch works with no proxy and no API key.

If the endpoint is unreachable (offline, blocked network, sandboxed preview), the app automatically switches to **Demo / Offline** mode with a clearly labelled simulated run. You can also force demo mode from Settings.

## Features

- 270° SVG speedometer with gradient arc, glowing head, animated ticks, orbiting rings and auto-ranging scale
- Live throughput graph on `<canvas>` (download = cyan, upload = violet) with an ambient idle wave
- 4-step phase pipeline, shimmering progress bar, glassmorphic metric cards with pointer-tilt
- Grade (S/A/B/C/D), capability verdicts, 10 GB transfer estimate, copy-to-clipboard share
- Local-only history (localStorage, last 8 runs), clearable in one click
- Settings: live vs demo mode, Mbps / MB/s, Quick / Balanced / Deep test depth, animation + connection-detail toggles
- Space starts/aborts, Escape closes settings, `prefers-reduced-motion` respected
- Fully responsive; all CSS, JS and SVG are inline (no CDN, no fonts, no build step)

## Notes

Results depend on Wi-Fi/Ethernet, VPN, router load and distance to the edge node. Run 2–3 times for a reliable trend. Independent project — not affiliated with Ookla or Speedtest.net.
