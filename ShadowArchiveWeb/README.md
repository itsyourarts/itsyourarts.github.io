# ShadowVault Web — separate ZIP + .shadow website

A standalone static website for GitHub Pages. This is a NEW project in `ShadowArchiveWeb/`. No original ShadowVault APK or project files were changed. There is no Android bridge, hidden vault, login-hour gate, account or backend in this website.

## Features

- Files / selected folder → standard `.zip` (DEFLATE or Store).
- Files / selected folder → `.shadow`, password-protected or public normal mode.
- Extract / inspect standard ZIP and public SHDW versions 1, 2, 3 and 4.
- New Shadow output is SHDW 3 (password) or SHDW 4 (normal), matching the current Android archive format.
- Source-based download names; nested file paths; drag/drop on supported browsers.
- Actual byte/stage progress, cancellation, light/dark theme and mobile layout.
- Download individual CRC-verified entries, a verified ZIP preserving paths, or extract to a NEW directory where File System Access API is supported.
- Content-based detection: renaming does not convert ZIP/Shadow or decrypt Shadow.

## GitHub Pages: upload without changing your existing ShadowVault repo

1. Download `ShadowArchiveWeb-GitHubPages.zip` and extract it locally.
2. Create a **new GitHub repository**, for example `shadow-archive-web`. Do not replace your Android project's files.
3. Upload ALL extracted website files to the new repository ROOT:
   ```
   index.html
   style.css
   app.js
   archive-core.js
   vendor/
     zip.min.js
     normal-key.js
     ZIPJS-LICENSE.txt
   .nojekyll
   README.md
   TEST-RESULTS.md
   ```
   `index.html` must be directly in the selected publishing folder, not hidden inside an extra ZIP/folder. Upload the actual `vendor` contents too.
4. Open repository **Settings → Pages → Build and deployment**.
5. Choose **Deploy from a branch**, select `main` and `/(root)`, and Save.
6. After GitHub finishes deployment, open the HTTPS URL shown there, normally:
   `https://YOUR-USERNAME.github.io/shadow-archive-web/`
7. Use HTTPS; Web Crypto and browser folder APIs require a secure context. All website resource paths are relative, so repository subpaths work.

No npm build step is required for the published website. It has no CDN dependency. GitHub serves the page but file processing stays in the browser. The repository has NOT been created or published on your behalf.

## Local preview

From this folder:

```sh
python -m http.server 8090 --bind 0.0.0.0
```

Open `http://localhost:8090` on the same machine. Do not rely on double-clicking `file://index.html`; use localhost or HTTPS.

## Security and compatibility

- Password Shadow uses the existing app's PBKDF2-HMAC-SHA256 (600,000 iterations), AES-256-GCM and, for v3/4, 1 MiB authenticated frames plus a mandatory final frame. Changing the password or damaged bytes causes authentication failure.
- Public normal mode has NO private secret. Its compatibility key is necessarily visible in public website JavaScript. Normal archives are publicly decryptable by this compatible site/app. Use password mode for privacy.
- Existing hidden-vault `SVLT` item/catalog files are NOT public SHDW archives. This site does not restore a hidden vault folder. Use the Android app for that.
- Reads standard unencrypted ZIP. Password-encrypted ZIP input/output is not supported; use password-protected `.shadow` instead.
- ZIP extraction validates paths, duplicate/case-normalized path conflicts, symlinks, file/folder collisions, entry counts and declared expanded sizes before exposing results. CRCs are checked when each entry is extracted. A listed ZIP has only had its structure checked until extraction/download. Shadow authentication completes before ZIP results appear.
- Defaults: max 10,000 entries, 32 path components, 1,024 path characters and an adjustable 2 GiB expanded-size safety guard. The guard is to reduce decompression-bomb risks, not a promise that the browser can handle that size. Raise it only for a trusted archive.
- No fixed 25 MB archive cap. Output ZIP/Shadow and extracted Blobs still consume browser memory/storage. Multi-GB archives may fail or close a tab, especially on phones; no universal large-file guarantee, background task or resume. Legacy v1/2 decryption processes the ciphertext as one Web Crypto operation.
- Folder saving is typically available in desktop Chromium. Firefox/Safari/mobile support varies; verified ZIP download and individual download are the fallback. The file/folder picker often omits empty source folders. Nested files are preserved.
- Folder extraction creates a fresh `Shadow-restored-...` directory. On failure/cancel it attempts to remove that new partial directory; if the browser/provider refuses, the error says a partial folder may remain. It never requests deletion of your originals.
- Files are not uploaded by the application. Hosted JavaScript must still be trusted: a changed/malicious hosting repository could change that behavior. Keep your deployed code and dependencies trusted. There are no analytics or remote fonts/scripts in this package.
- This prototype is not independently audited. Keep backups and test small samples first. Browser tests are not Android/on-device testing.

## Library and development

`vendor/zip.min.js` is the full native-JS bundle from `@zip.js/zip.js` **2.8.11**, distributed under BSD-3-Clause. Its license is in `vendor/ZIPJS-LICENSE.txt`. It is configured without workers/CDN/WASM fetch requirements; fallback JS compression is used so compression levels are honored.

Readable website source is included directly. In the workspace project, optional test/dev dependencies are declared in `package.json` / `package-lock.json`; `node_modules`, fixture data and Java test dependencies are NOT needed for hosting and are excluded from the hosting ZIP.

See `TEST-RESULTS.md` for scope and limitations. Actual on-device/mobile filesystem permissions, production GitHub deployment and multi-GB browser workloads were not tested.
