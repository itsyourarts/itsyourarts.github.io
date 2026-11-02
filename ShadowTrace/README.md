<div align="center">

<img src="./favicon.svg" alt="ShadowTrace Logo" width="76" height="76" />

# ShadowTrace

**Uncover Where Every Link Actually Goes.**  
Open-source URL Redirect Checker, Tiny Link Expander, Affiliate Chain Auditor, DNS-over-HTTPS Inspector, Domain WHOIS/RDAP Expiry Monitor & HTTP Status Code Suite.

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](#license)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-06b6d4.svg)](#quick-start-local-node)
[![GitHub Pages Ready](https://img.shields.io/badge/GitHub%20Pages-100%25%20Static%20Ready-38bdf8.svg)](#option-1--host-100-free-on-github-pages-zero-backend)
[![Vercel Serverless](https://img.shields.io/badge/Vercel-Serverless%20Ready-000000.svg)](#option-2--deploy-on-vercel-deep-serverless-engine)

</div>

---

## ✨ Features

ShadowTrace is a modern, privacy-first, open-source alternative to *WhereGoes* engineered with a **Hybrid Dual-Engine Architecture** so it works **100% statically on GitHub Pages** (zero backend required!) and automatically upgrades to a **Deep Socket Inspection Engine** when deployed on **Vercel** or Node.js.

| Tool | Capabilities | Works on GitHub Pages? |
| :--- | :--- | :---: |
| **⚡ URL Redirect Tracer** | Follows `301`, `302`, `303`, `307`, `308`, HTML `<meta http-equiv="refresh">`, & JS redirects; displays hop-by-hop HTTP headers, cookies (`🍪`), TLS info, IP addresses, affiliate/UTM trackers (`🎯`), clean tracker-free URLs, and shareable trace permalinks (`#trace=...`). | ✅ Yes |
| **📋 Bulk Link Checker** | Audit up to 10 URLs simultaneously, verify HTTPS upgrades, compare redirect hop counts, and export CSV reports. | ✅ Yes |
| **🌐 Live DNS Lookup** | Real-time DNS-over-HTTPS queries (`A`, `AAAA`, `CAA`, `CNAME`, `HINFO`, `MX`, `NAPTR`, `NS`, `PTR`, `SOA`, `SRV`, `TXT`, plus `ALL` full sweep) via **Cloudflare (1.1.1.1)** or **Google (8.8.8.8)** with DNSSEC validation & `dig` zone output. | ✅ Yes |
| **📅 Domain WHOIS / RDAP** | Queries official IANA RDAP TLD registries directly for registration date, expiration countdown meter, registrar IANA ID, EPP status flags, DNSSEC state, and authoritative nameservers. | ✅ Yes |
| **🔗 Create Tiny URL + QR** | Shorten long links via CORS-enabled providers (`is.gd`, `v.gd`, `spoo.me`) with optional custom aliases and an **instant 100% offline SVG QR Code generator**. | ✅ Yes |
| **📚 HTTP Status Codes** | Searchable, filterable `1xx`–`5xx` reference explaining browser behavior, SEO PageRank impact, and server troubleshooting. | ✅ Yes |
| **🌗 Day / Night Neon Glass UI** | Full **Glassmorphism + Neon Cyber Glow** design system with animated floating neon orbs, frosted `backdrop-filter` surfaces, neon laser hop connectors, and a sliding **☀️ Day Crystal / 🌙 Night Neon** pill switcher (`Alt+T`). | ✅ Yes |

---

## 🧠 Hybrid Dual-Engine Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        ShadowTrace Frontend                          │
│         (Pure Vanilla HTML + CSS + ES Modules — Zero Build!)         │
└──────────────────┬───────────────────────────────────┬───────────────┘
                   │                                   │
     Probes ./api/health                     No Backend Detected
         (200 OK)                            (GitHub Pages Static)
                   ▼                                   ▼
┌──────────────────────────────────┐   ┌───────────────────────────────┐
│  Mode A: Deep Serverless Engine  │   │ Mode B: Pure Browser Engine   │
│    (Vercel / Node / Worker)      │   │   (100% Client-Side CORS)     │
├──────────────────────────────────┤   ├───────────────────────────────┤
│ • Hop-by-hop TCP/TLS sockets     │   │ • CORS HTTP Header Chain API  │
│ • Custom User-Agent spoofing     │   │ • Microlink URL Expander      │
│ • Meta-Refresh & JS redirects    │   │ • Cloudflare & Google DoH     │
│ • Exact DNS/TCP/TLS/TTFB ms      │   │ • Official IANA RDAP WHOIS    │
│ • Built-in SSRF IP protection    │   │ • Direct is.gd/v.gd/spoo.me   │
└──────────────────────────────────┘   └───────────────────────────────┘
```

---

## 🚀 Deployment Guide

### Option 1 — Host 100% Free on GitHub Pages (Zero Backend!)

ShadowTrace uses relative asset paths (`./assets/...`), `.nojekyll`, and a pure client-side CORS engine so it runs directly on `https://<your-username>.github.io/ShadowTrace/` with **zero build step** and **zero backend**:

1. Create a new repository on GitHub named **`ShadowTrace`**.
2. Push this folder to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of ShadowTrace"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ShadowTrace.git
   git push -u origin main
   ```
3. Open your GitHub repo → **Settings** → **Pages**:
   - **Method A (Instant Branch Deploy):** Under *Build and deployment → Source*, choose **Deploy from a branch**, select branch **`main`** and folder **`/ (root)`**, and click **Save**.
   - **Method B (GitHub Actions):** Select **GitHub Actions** — the included `.github/workflows/deploy-pages.yml` workflow will automatically publish your site!
4. Within ~30 seconds, your live ShadowTrace suite will be online at:  
   `https://<your-username>.github.io/ShadowTrace/`

> **Optional Pro Tip for GitHub Pages:** Want custom User-Agent spoofing & HTML Meta/JS redirect inspection while still hosting for free on GitHub Pages? Copy `worker/cloudflare-worker.js` into a free [Cloudflare Worker](https://workers.cloudflare.com/) (100,000 free requests/day) and paste the worker URL into **Advanced Options → Custom Cloudflare Edge Worker URL**!

---

### Option 2 — Deploy on Vercel (Deep Serverless Engine)

Deploying the exact same repository to Vercel automatically activates `api/trace.js` and `api/health.js` as serverless functions with SSRF protection, custom User-Agent profiles, socket timings, and TLS certificate inspection:

1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** your `ShadowTrace` repository.
3. Leave all build settings at their defaults (`Framework Preset: Other`, no build command needed — `vercel.json` is pre-configured) and click **Deploy**.

---

### Quick Start (Local Node.js Server)

ShadowTrace has **zero npm dependencies** — it uses only native Node.js 18+ built-in modules (`http`, `https`, `dns`, `tls`, `zlib`):

```bash
git clone https://github.com/<your-username>/ShadowTrace.git
cd ShadowTrace
node server.js
# ⚡ ShadowTrace running at http://0.0.0.0:3000
```

---

## 🔌 REST API Reference (Vercel / Local Mode)

### `POST /api/trace`

Traces a URL hop-by-hop and returns structured JSON metadata.

```bash
curl -X POST http://localhost:3000/api/trace \
  -H "Content-Type: application/json" \
  -d '{"url": "http://github.com", "uaPreset": "shadowtrace", "maxHops": 15}'
```

**Query / Body Parameters:**
- `url` *(string, required)* — Target URL or shortened link to trace.
- `uaPreset` *(string, optional)* — `shadowtrace` | `chrome_desktop` | `iphone_safari` | `googlebot` | `twitterbot` | `curl`.
- `customUserAgent` *(string, optional)* — Custom User-Agent header override.
- `maxHops` *(number, optional)* — Maximum redirects to follow (`1`–`20`, default `15`).
- `followClientRedirects` *(boolean, optional)* — Follow HTML `<meta http-equiv="refresh">` & JS location redirects (default `true`).

---

## 📁 Project Structure

```text
ShadowTrace/
├── index.html                  # Main SPA interface (relative paths for GitHub Pages)
├── 404.html                    # GitHub Pages SPA route fallback
├── favicon.svg                 # Vector radar/trace brand icon
├── .nojekyll                   # Bypass Jekyll processing on GitHub Pages
├── assets/
│   ├── css/styles.css          # Dark Stealth + Light Classic responsive design system
│   └── js/
│       ├── app.js              # Interactive UI controller, exports, history & routing
│       ├── engines.js          # Hybrid Engine (Static Browser CORS + Serverless API)
│       ├── qr.js               # Zero-dependency offline SVG QR Code encoder
│       └── status-codes.js     # Complete 1xx–5xx HTTP status code SEO database
├── api/
│   ├── health.js               # Serverless capability detection endpoint
│   └── trace.js                # Deep Node.js hop-by-hop tracer with SSRF protection
├── worker/
│   └── cloudflare-worker.js    # Optional 1-file free Cloudflare Worker edge tracer
├── .github/workflows/
│   └── deploy-pages.yml        # Automated GitHub Pages deployment workflow
├── server.js                   # Zero-dependency local Node.js HTTP server
├── vercel.json                 # 1-click Vercel configuration
├── package.json                # Project manifest
└── LICENSE                     # MIT License
```

---

## 👨‍💻 Creator & Credits

**Hello Dear, it's Krishna Chauhan from Ghazipur (UPX61)!** 🌹✨

- **Creator:** Krishna Chauhan (`UPX61`, Ghazipur, Uttar Pradesh)
- **Brand:** **GODXSHADOW**
- **Signature:** `© 2026 GODXSHADOW — by Krishna UPX61`

---

## 📄 License

Released under the [MIT License](./LICENSE).
