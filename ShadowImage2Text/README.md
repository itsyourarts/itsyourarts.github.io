# ShadowImage2Text

**Turn Images Into Text. Instantly.**

A premium, privacy-first image-to-text (OCR) web app. Drop in a screenshot, photo or scan and get clean, editable text in **English**, **हिन्दी (Hindi)** or both — entirely inside the browser, with no uploads and no sign-ups.

![Status](https://img.shields.io/badge/status-production--ready-8b5cf6)
![License](https://img.shields.io/badge/license-MIT-60a5fa)
![No build step](https://img.shields.io/badge/build-none%20required-a855f7)

---

## ✨ Features

| | |
|---|---|
| **Real OCR** | Powered by [Tesseract.js 5](https://github.com/naptha/tesseract.js) running in a Web Worker via WebAssembly. |
| **English + Hindi** | Recognise `eng`, `hin`, or `eng+hin` for mixed-language documents. |
| **100% on-device** | Images are never uploaded. Recognition happens locally, so it's safe for sensitive documents. |
| **Instant workflow** | Drag & drop, click-to-browse or **paste from clipboard** (Ctrl / ⌘ + V). |
| **Smart preprocessing** | Transparent images are flattened onto white and small images are upscaled for far better accuracy. |
| **Live progress** | Weighted, human-readable progress ("Downloading language model…", "Reading your image…"). |
| **Confidence score** | See the engine's confidence plus total extraction time for every run. |
| **Editable output** | Fix any OCR mistakes inline, with live word / character / line counts. |
| **Copy & download** | One-click copy to clipboard, or download a clean `.txt` file named after your image. |
| **Image preview** | See your image with dimensions and file size before extracting. |
| **Light & dark mode** | **Light mode by default** (as specified) with a premium dark theme available from the navbar toggle. Your preference is saved and restored on return visits. |
| **Premium UI** | Animated aurora gradients, glass panels, scroll reveals, toasts and a fully responsive layout. |
| **About section** | A dedicated premium About block with an animated S2T brand illustration and four highlights (Simple to Use, Free Access, Privacy Focused, Made for Everyone). |
| **Accessible** | Keyboard operable, focus-visible states, ARIA labels/live regions and `prefers-reduced-motion` support. |

Keyboard shortcut: **Ctrl / ⌘ + Enter** starts an extraction.

---

## 🚀 Quick start

No build tools, no dependencies to install.

```bash
git clone https://github.com/<your-username>/shadowimage2text.git
cd shadowimage2text
```

Then either:

- **Double-click `index.html`** — it works straight from the file system, *or*
- Serve it locally (recommended for a realistic environment):

```bash
# Python 3
python3 -m http.server 8080

# or Node.js
npx serve .
```

Open <http://localhost:8080>.

> The first extraction downloads the OCR engine + language model (a few MB). Your browser caches them, so subsequent runs are fast.

---

## 🌐 Deploy to GitHub Pages

1. Push this folder to a GitHub repository:

   ```bash
   git init
   git add .
   git commit -m "feat: ShadowImage2Text OCR platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/shadowimage2text.git
   git push -u origin main
   ```

2. In the repository go to **Settings → Pages**.
3. Under **Build and deployment** choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
4. Your site goes live at `https://<your-username>.github.io/shadowimage2text/`.

**Notes**

- Everything uses **relative paths**, so it works from a project sub-path as well as a custom domain.
- A `.nojekyll` file is included so GitHub Pages serves all assets verbatim.
- The CDN scripts are loaded over **HTTPS**, which GitHub Pages provides by default — required for the Web Worker + WASM engine.

---

## 🗂 Project structure

```
shadowimage2text/
├── index.html      # Semantic markup: nav, hero, OCR studio, features, steps, About, FAQ, footer
├── style.css       # Design system: tokens, dark/light themes, components, responsive rules
├── script.js       # OCR engine, file intake, preview, results, copy/download, theme, UI polish
├── README.md       # This file
└── .nojekyll       # GitHub Pages: serve files without Jekyll processing
```

---

## 🧠 How it works

1. **Intake** — a file chosen via click, drag-and-drop or clipboard paste is validated (type + 15 MB limit) and shown in an `<img>` preview using an object URL.
2. **Preprocessing** — the image is drawn to a `<canvas>`: transparency is flattened onto white, small images are upscaled toward 1500 px, and total pixels are capped to keep memory in check.
3. **Recognition** — `Tesseract.createWorker(lang)` loads the chosen language (cached after first use). `worker.recognize(canvas)` returns `{ text, confidence }` from inside a Web Worker, so the UI never freezes.
4. **Results** — the text is placed in an editable textarea with confidence/time badges and live counts. Copy uses the Clipboard API with a `execCommand` fallback; download builds a `.txt` `Blob`.

The worker is **reused** between runs and only re-created when you switch language, which keeps repeat extractions fast.

### Engine asset locations (pinned in `script.js`)

```js
const TESS = {
  version:    "5.1.1",
  workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",
  corePath:   "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1",
  langPath:   "https://tessdata.projectnaptha.com/4.0.0",
};
```

To use a different version — or self-host the assets for an entirely offline deployment — copy the worker, core and `.traineddata.gz` files next to `index.html` and update those paths.

---

## 🔒 Privacy

- Images are processed **locally** in your browser and are never transmitted.
- Extracted text lives only in the page until you clear it or close the tab.
- The only thing stored is your **theme preference** (`localStorage` key `s2t-theme`, defaults to light).
- No analytics, no cookies, no tracking. The only network requests are for the CDN scripts and language data.

---

## 📱 Browser support

Latest Chrome, Edge, Firefox and Safari (desktop and mobile), plus Opera and Samsung Internet. Requirements: ES2020, WebAssembly, Web Workers and Canvas 2D. On very old browsers the page remains usable but OCR may fail with a friendly error.

---

## 🎨 Design system

- **Light palette (default)** — background `#FFFFFF`, secondary `#F8FAFC`, cards `#FFFFFF`, text `#111827`, muted `#64748B`, accents `#7C3AED` + `#6366F1`, borders `#E5E7EB`.
- **Dark palette** — deep black `#05040A`, dark purple, electric violet `#A855F7`, blue `#60A5FA`, white.
- **Type** — *Sora* for display, *Inter* for body, *JetBrains Mono* for code/OCR output.
- **Surfaces** — glassmorphic panels, 1 px gradient hairlines, layered aurora blurs and a subtle noise texture.
- **Default theme** — light, with a smooth 0.5s cross-fade when switching. The choice persists in `localStorage` (`s2t-theme`) and is restored on the next visit.
- **Motion** — IntersectionObserver reveals, floating product preview, animated scanlines, and reduced-motion fallbacks.

---

## 🛠 Customisation

| Want to change… | Where |
|---|---|
| Brand colours / gradients | `:root` custom properties at the top of `style.css` |
| Adding a language | Add a radio `<input name="lang" value="xxx">` in `index.html`; any Tesseract language code works (`fra`, `deu`, `spa`, `ara`, `tam` …) |
| Upload limit | `MAX_BYTES` in `script.js` |
| OCR accuracy tuning | `preprocessImage()` in `script.js` (upscale target, pixel cap) |
| Hero copy | `.hero` section in `index.html` |

---

## ⚠️ Limitations

OCR is never perfect. Accuracy drops with blur, low light, skew, unusual fonts, handwriting or very small text. For best results: crop tightly around the text, keep the image straight and well-lit, and select the correct language.

---

## 🙌 Credits

- [Tesseract.js](https://github.com/naptha/tesseract.js) — OCR engine for the web
- [tesseract.js-core](https://github.com/naptha/tesseract.js-core) — WASM build of Tesseract
- [Tesseract](https://github.com/tesseract-ocr/tesseract) — the original OCR engine
- Hosted language data from [tessdata.projectnaptha.com](https://tessdata.projectnaptha.com)
- Fonts: [Sora](https://fonts.google.com/specimen/Sora), [Inter](https://fonts.google.com/specimen/Inter), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

---

## 👤 Credits

Built and maintained by **Krishna UPX61** · Brand: **God<sup style="color:#dc2626">X</sup>Shadow**

> © 2026 **God<span style="color:#EF4444">X</span>Shadow** — by **Krishna UPX61**

The creator credit sits on the final footer line, centred, using three separate spans:

```html
<span>God</span><span style="color:#EF4444;">X</span><span>Shadow</span>
```

---

## 📄 License

Released under the **MIT License** — use it, fork it, ship it. Tesseract.js and Tesseract are licensed under Apache 2.0.

---

<p align="center"><strong>ShadowImage2Text</strong> · Turn Images Into Text. Instantly.</p>
<p align="center">© 2026 <strong>God<span style="color:#EF4444">X</span>Shadow</strong> — by <strong>Krishna UPX61</strong></p>
