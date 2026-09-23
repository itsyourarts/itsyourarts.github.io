# ⚡ GodxShadow — Neon Dev Academy

W3Schools-style learning platform — neon theme, live code editors with a **real code-execution backend** (Python, C, C++, Java, C#, PHP, JavaScript, SQL, Bash).

> ### 🚀 GitHub pe deploy — 2 minute
> **GitHub Pages (free, static):** repo banao → `Add file ▾ → Upload files` me ye saari files drag-drop karo → **Settings → Pages → Source: `Deploy from a branch` → main / (root)** → live: `https://<user>.github.io/<repo>/`
> *(chahein to bundled GitHub Action workflow bhi use kar sakte ho — uske liye Source: `GitHub Actions` rakho)*
>
> **Code-runner ke saath (recommended):** [render.com](https://render.com) → **New → Blueprint** → apna repo select karo (`render.yaml` + `Dockerfile` ready hain).
>
> **Pages + hosted runner (mix):** `assets/config.js` me `window.GXS_API = "https://your-api.onrender.com"`.
>
> ⚠️ GitHub Pages static hai — wahan **code execute nahi hoga** (site 561 chapters ke saath poori chalti hai, Run button honest message dikhata hai). Detail: **`UPLOAD-TO-GITHUB.md`**.

## Courses (35) · Chapters (561) — har course **start → end** (last chapter = Summary & Aage Kya)

**Web Fundamentals:** HTML (22) · **CSS (65)** ⭐ · JavaScript (22) · Bootstrap (8) · Tailwind (8) · jQuery (8)
**Frontend Frameworks:** React (19) · Angular (8) · Vue (8)
**Backend:** Node.js (19) · PHP (20) · Django (9) · Flask (15) · ASP.NET (15)
**Languages:** Python (25) · C (27) · C++ (27) · C# (23) · Java (25) · Kotlin (8) · Swift (9) · Go (8) · Rust (8)
**Databases:** SQL (22) · MySQL (19)
**Data/Code Formats:** JSON (13) · XML (13) · NumPy (15) · Pandas (15)
**DevOps/Tools:** Git & GitHub (8) · Docker (8) · Linux & Bash (8)
**Mobile:** Flutter (8) · **Slides:** DSA (8)

⭐ CSS course = **65 chapters**, sab me live editor seed; **49/65 me responsive CSS** (`@media`, `@container`, `clamp()`, `auto-fit`, `max-width:100%`) — demo chhoti screen / narrow preview me khud reflow hota hai.

## Features

- **Home** — live stats (561 chapters / 35 courses), numbered chapter lists, progress bar
- **Tutorials** — English explanations + examples, syntax highlighting, har code block par **Copy + Try it ▸**
- **Try it Yourself** — **per-language editor** (Python chapter → Python editor, C# → C# editor…) with **real execution** via `POST /run`
- **Live Editor** ⚡ — HTML/CSS/JS tabs, auto-run preview, console capture, Ctrl+Enter, Format, Download `.html`
- **Examples** — 52 snippets (46 CSS-heavy), live mini-previews · **References** — HTML/CSS/JS tables · **Quiz** — MCQ
- Global search (`/`) · Progress tracking (localStorage) · Back button **1 step only** · Mobile responsive

## Run (local, full functionality)

```bash
cd godxshadow
python3 server.py            # static site + POST /run code runner
# open http://localhost:8000
```

`python3 -m http.server` bhi chalega, par usme code runner nahi hoga (auto-run honest message dikhayega).

---

## 🚀 Deploy

### Option A — GitHub Pages (static, free, zero config)

GitHub Pages sirf static files serve karta hai, so **code runner (Python/C/Java…) waha execute nahi hota** — baaki poori site 100% chalti hai.

```bash
cd godxshadow
git init -b main
git add .
git commit -m "GodxShadow — 561 chapters, 35 courses"
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

Phir GitHub → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Bundled workflow (`.github/workflows/pages.yml`) site ko push par khud publish karta hai:
`https://<your-user>.github.io/<your-repo>/`

Static host par Run button honest message dikhata hai ("no server here to execute code") — crash nahi hota.

### Option B — Full-stack host (site + real code runner) ✅ recommended

`Dockerfile` already included hai (gcc, g++, JDK, Mono, PHP, Node, git sab install karta hai). Kisi bhi Docker host par:

- **Render** — New → Blueprint → repo select karo (`render.yaml` ready hai) → free URL milega `https://godxshadow.onrender.com`
- **Railway / Fly.io / VPS** — repo connect karo ya:
  ```bash
  docker build -t godxshadow . && docker run -p 8000:8000 godxshadow
  ```
- Server `PORT` env var maanta hai (host khud deta hai), `0.0.0.0` par bind karta hai.

### Option C — Pages frontend + backend kahin aur (best of both)

Frontend GitHub Pages par rakho, runner Render/Railway par, aur `assets/config.js` me sirf ye line set karo:

```js
window.GXS_API = "https://godxshadow-api.onrender.com";   // aapka hosted runner
```

Backend CORS headers bhejta hai (`Access-Control-Allow-Origin: *` + `OPTIONS` preflight), so cross-origin calls kaam karti hain.

### Publish speed-tip

`preview/` folder sirf screenshots ke liye hai — `.gitignore` me hai, so repo/Pages deploy me include nahi hota (~14 MB bach jata hai).

---

## Testing

Playwright suites repo ke `tests/` folder me hain (`cd tests && npm install && npm run all`):

| Suite | Asserts | Status |
|---|---|---|
| `e2e.js` — all pages, lesson routing harness, editor bridge, persistence, responsive | 123 | ✅ 0 failed |
| `codetest.js` — per-language runner, auto-run, edit-rerun, SQL rows, display-only langs | 15 | ✅ all pass |
| `respcheck.js` — CSS Try-it responsive (`@media`/`@container` fire in narrow pane) | 8 | ✅ all pass |
| `subpath.js` — GitHub-Pages-style `/repo/` subpath deploy | 8 | ✅ all pass |
| `statichost.js` + `githubpages.js` — static host vs full-stack behaviour | 4 + 4 | ✅ all pass |

## Structure

```
godxshadow/
├── index.html tutorials.html editor.html examples.html references.html quiz.html
├── server.py               # static server + POST /run (per-language runners)
├── Dockerfile render.yaml  # one-command deploy
├── UPLOAD-TO-GITHUB.md     # GitHub par daalne ke 3 tarike (step-by-step)
├── push-to-github.sh       # bash push-to-github.sh <username> <repo>
├── tests/                  # Playwright suites (e2e, codetest, respcheck, subpath…)
├── .nojekyll .gitattributes
├── .github/workflows/pages.yml
└── assets/
    ├── config.js           # window.GXS_API — point static site at a hosted runner
    ├── style.css           # neon theme
    ├── tutorials.js        # DEFAULT_SEED + COURSES registry + helpers
    ├── courses/            # 35 course files (angular, aspnet, bootstrap, c, cpp, csharp, css,
    │                       #  django, docker, dsa, flask, flutter, git, go, html, java, jquery, js,
    │                       #  json, kotlin, linux, mysql, nodejs, numpy, pandas, php, python, react,
    │                       #  rust, sql, swift, tailwind, typescript, vue, xml)
    ├── app.js              # nav, sidebar, router, search, highlighter, progress, language runner
    └── editor.js           # live HTML/CSS/JS editor engine
```

## Note

Educational project — W3Schools ke learning format se inspired; saara code/content original hai.
Live runner sandboxed temp dir me chalta hai (10 s timeout, output 20k chars par capped) — safe for a demo host.
