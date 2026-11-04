# Deploying ShadowWebApps on GitHub Pages

The site is 100 % static — no build step, no server, no npm install.

## Option A — GitHub Pages (free, 2 minutes)

1. Create a new **public** repository, e.g. `shadowwebapps`.
2. Upload **everything inside this folder** (so `index.html` sits at the repo root).
   Via terminal:

   ```bash
   git init
   git add .
   git commit -m "ShadowWebApps"
   git branch -M main
   git remote add origin https://github.com/<your-username>/shadowwebapps.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** · Folder: **/ (root)**
   - Save.
4. Wait ~1 minute → your site is live at:

   ```
   https://<your-username>.github.io/shadowwebapps/
   ```

All paths in the project are relative (`assets/...`), so it also works perfectly from a
sub-folder URL like the one above.

## Option B — Netlify / Vercel / Cloudflare Pages

Drag this folder onto the dashboard. No build command, no output directory — publish
directory is the folder itself.

## Option C — Test locally first

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Notes

- **HTTPS is required** for the recorders (screen / webcam / microphone) — GitHub Pages gives
  you HTTPS automatically, so they work out of the box. On plain `file://` they will not.
- Everything is bundled locally (`assets/js/vendor/`), so there are no CDN calls and the tools
  keep working offline after the first load.
- Custom domain: Settings → Pages → Custom domain, then add a `CNAME` file with your domain.
