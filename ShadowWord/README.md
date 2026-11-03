# ShadowWord — GitHub Pages ready

Is folder mein ready-to-host static website hai. Node.js, npm build ya backend ki zaroorat nahi hai.

## GitHub par host kaise karein

1. ZIP extract/unzip karein. ZIP file ko seedha repository mein upload NA karein.
2. GitHub par ek public repository banayein, jaise `shadowword`.
3. Extract ki hui files ko repository ki root/main directory mein upload karein. `index.html` seedha root mein hona chahiye, kisi extra folder ke andar nahi.
4. `assets` folder aur uski saari files bhi upload karein. Agar browser ek saath 100 files ki limit dikhaye, to assets ko batches mein upload karein, ya GitHub Desktop / Git use karein.
5. Commit changes karein.
6. Repository ke **Settings → Pages** mein jayein.
7. **Source: Deploy from a branch** select karein.
8. **Branch: main**, **Folder: / (root)** select karke **Save** karein.
9. Deployment complete hone ke baad Pages section mein website ka link milega, aam taur par:
   `https://YOUR-USERNAME.github.io/shadowword/`

`YOUR-USERNAME` ko apne GitHub username se replace karein. Agar repository ka naam alag ho, to URL mein woh naam hoga. Yeh example URL hai; website abhi aapke GitHub account mein publish nahi ki gayi hai.

## Git se upload (optional)

Extracted website folder ke andar terminal khol kar:

```bash
git init
git add .
git commit -m "Publish ShadowWord website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/shadowword.git
git push -u origin main
```

Yeh commands nayi, empty repository ke liye hain. Push ke liye apne GitHub account se authentication karein. Password/token ko website files mein kabhi na likhein.

## Folder structure

```text
index.html
assets/
icon.svg
icon-192.png
icon-512.png
manifest.webmanifest
registerSW.js
sw.js
workbox-9c191d2f.js
.nojekyll
README.md
```

Saari supplied runtime files preserve karein. `.nojekyll` hidden file hai; Git ya GitHub Desktop use karne par yeh bhi include ho jayegi.

## Local preview

Python installed ho to website folder mein:

```bash
python -m http.server 8080
```

Browser mein `http://localhost:8080` kholein. `index.html` ko double-click/file:// se kholne par JavaScript modules aur offline features nahi chal sakte.

## Kya fix kiya gaya

- Entry HTML, icons aur manifest ke root-only paths ko relative banaya.
- Dynamic module preload paths ko repository subfolder ke compatible banaya.
- PDF worker ka URL module-relative banaya.
- PWA install/start/scope aur service worker ko website folder tak scope kiya.
- Offline precache revisions refresh kiye aur local font files include kiye.
- `.nojekyll` add kiya.

## Checks

Local Chromium browser mein `/test-repo/` subfolder deployment simulate karke home page, existing sample document/spreadsheet/presentation/PDF editor opening, service worker scope aur offline home-page reload check kiye. In checks mein page JavaScript errors ya HTTP 404 errors nahi mile. Har import/export feature ka exhaustive test nahi kiya gaya hai.

## Important

- Yeh original archive ka production/built version hai, original React source project nahi. UI/source-level changes ke liye original development project chahiye; hosting ke liye is package se kaam chalega.
- Workspace files browser/device ke local storage/IndexedDB mein rehti hain; GitHub repository mein save ya devices ke beech automatically sync nahi hoti.
- Important documents ke backups export karte rahein. Browser data clear karne par local files delete ho sakti hain.
- Offline use ke liye pehli baar site online kholkar cache complete hone dein. OCR jaise features external scripts/models ke download ke liye internet maang sakte hain.
- Future mein HTML/JS/CSS edit karne ke baad `sw.js` ke precache revisions bhi refresh karein, warna purani cached copy dikh sakti hai.
- GitHub Pages public hosting hai; repository mein secrets ya private documents upload na karein.
