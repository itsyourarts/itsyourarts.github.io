# 📤 isse GitHub pe kaise daalein — 3 tarike

Project **561 chapters / 35 courses / 52 examples** — sab files ready hain, aapko sirf upload karna hai.
(Do options jo aap choose kar sakte ho: **sirf GitHub Pages** = site chalegi par code-runner nahi, ya **Render/Railway** = runner ke saath poora. Neeche Dono hain.)

---

## Tarika 1 — GitHub website se drag & drop (git bilkul nahi chahiye) ✅ easiest

1. GitHub pe jao → **New repository** → naam do (e.g. `godxshadow`) → **Public** → **Create**.
2. Repo kholo → **Add file ▾ → Upload files**.
3. Zip file ko apne computer pe extract karo → uske andar ki **saari files aur `assets` folder** drag & drop karo (folder structure waise hi rakho).
   > Browser drag-drop me folder bhi chalta hai — bas `index.html` repo ke **root** me hona chahiye.
4. Neeche **Commit changes** dabao.
5. **Settings → Pages → Source: GitHub Actions** → push hone par site khud deploy ho jayegi:
   `https://<your-username>.github.io/<repo-name>/`

## Tarika 2 — Git commands (proper history ke saath) ⭐

```bash
# zip extract karke us folder me jao
cd godxshadow
git init -b main
git add .
git commit -m "GodxShadow — 561 chapters, 35 courses, live code runner"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
(ya project me diya hua shortcut chalao: `bash push-to-github.sh <username> <repo>`)

Bundle file se clone karna ho toh:
```bash
git clone godxshadow.bundle godxshadow
cd godxshadow
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Tarika 3 — Render par poora system (code-runner ke saath) 🚀 recommended

GitHub pe push karne ke baad:

1. [render.com](https://render.com) → **New → Blueprint** → apna repo select karo (repo me `render.yaml` + `Dockerfile` already hai).
2. Render khud Docker image banayega jisme **gcc, g++, JDK, Mono (C#), PHP, Node, git** install hain → aapko free URL milta hai, e.g. `https://godxshadow.onrender.com`
3. Us URL par **sab kuch chalta hai** — Python/C/C++/Java/C#/PHP/JS/SQL/Bash ka live run bhi.

### Beech ka rasta (frontend Pages + backend Render)
Frontend GitHub Pages par rehta hai, runner Render par — bas `assets/config.js` me ye line daalo:
```js
window.GXS_API = "https://godxshadow-api.onrender.com";
```
Backend CORS headers bhejta hai, so cross-origin call kar chuki hai.

---

## Pehle se verify kiya gaya hai ✅

- `e2e.js` → **123/123** · `codetest.js` → **15/15** · `respcheck.js` → **8/8**
- **Subpath deploy test** (jaise GitHub Pages `/<repo>/` par khota hai) → **8/8**: assets load, sidebar, Try-it playground, responsive demo sab kaam karta hai
- **Static-host test** (fake `github.io` hostname) → **4/4**: runner ke bina page crash nahi hota, saaf message dikhata hai

## Zaroori baat — Pages par code-runner nahi chalega ⚠️

GitHub Pages sirf static files serve karta hai (wahan Python/GCC/Mono nahi hote). Wahan:
- ✅ Saare 561 chapters, sidebar, search, progress, quiz, examples, References, live HTML/CSS/JS editor
- ❌ Python/C/Java/C#… execute nahi honge → Run dabane par honest message aata hai + fix ka link

Isi liye runner chahiye to **Tarika 3** (Render/Railway) choose karo — wahi poora system hai.
