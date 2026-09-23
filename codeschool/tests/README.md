# 🧪 GodxShadow test suites

Playwright end-to-end tests. Sabse pehle site chalao, phir tests.

```bash
# terminal 1 — site + code runner
cd ..            # project root
python3 server.py          # http://127.0.0.1:8000

# terminal 2 — tests
cd tests
npm install
npm run install-browser     # one time: chromium download
npm run all
```

Kisi aur host par test karna ho:

```bash
BASE=https://godxshadow.onrender.com node e2e.js
```

| Suite | Asserts | Kya check karta hai |
|---|---|---|
| `e2e.js` | 123 | Saare pages, 561 lesson routes (routing harness), nav/back button, editor bridge, examples/quiz/references, progress persistence, responsive breakpoints |
| `codetest.js` | 15 | Per-language Try-it editor: Python auto-run + edit-rerun, C#, SQL rows, display-only langs (rust), web playground intact |
| `respcheck.js` | 8 | CSS Try-it responsive: `@media`/`@container` narrow preview pane me fire hote hain (grid 2-col, pricing stack, nav gap, fluid clamp) |
| `subpath.js` | 8 | **GitHub Pages jaise `/repo/` subpath** par assets, sidebar, playground — sab sahi load hota hai |
| `statichost.js` | 4 | Static host (no backend) vs full-stack host behaviour |
| `githubpages.js` | 4 | `*.github.io` par runner ke bina saaf message, koi bogus network call nahi |

Screenshots `../preview/` me save hote hain.
