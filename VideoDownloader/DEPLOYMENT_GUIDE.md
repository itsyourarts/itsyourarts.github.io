# VideoFetch Studio — Deployment Guide (Render)

Ye file VideoFetch Studio app ko GitHub aur Render pe deploy karne ke sabhi steps explain karti hai.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: GitHub Setup](#3-step-1-github-setup)
4. [Step 2: Render Setup](#4-step-2-render-setup)
5. [Step 3: Build Command](#5-step-3-build-command)
6. [Step 4: Environment Variables](#6-step-4-environment-variables)
7. [Step 5: Deploy & Test](#7-step-5-deploy--test)
8. [Troubleshooting](#8-troubleshooting)
9. [Important Notes](#9-important-notes)

---

## 1. Project Overview

- **App**: VideoFetch Studio (Node.js + Express)
- **Function**: Public MP4 videos aur HLS/DASH streams dhundhna, quality choose karna, aur ek complete MP4 file download karna
- **Tech**: Node.js 20+, Express, Playwright (browser scanning), cheerio, FFmpeg (HLS/DASH merge)
- **No code changes required** — sirf deployment configs change karni hain

---

## 2. Prerequisites

- GitHub account
- Render account (free plan chalega)
- Terminal/Command Prompt access

---

## 3. Step 1: GitHub Setup

### 3.1 Repo create karo

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `video-fetch-studio` (ya jo bhi naam chahte ho)
3. **Don't add a README** — empty repo banao
4. **Don't select any license** — optional
5. Create repository pe click karo

### 3.2 Code push karo

Local machine pe `video-fetch-studio` folder mein:

```bash
cd video-fetch-studio

# Git initialize karo
git init

# Sab files add karo
git add .

# Commit karo
git commit -m "Initial commit: VideoFetch Studio"

# Main branch ka naam badlo (optional)
git branch -M main

# Remote add karo (apna repo URL daalo)
git remote add origin https://github.com/<your_username>/video-fetch-studio.git

# Push karo
git push -u origin main
```

### 3.3 Verification

- GitHub repo pe jake confirm karo ki sab files dikh rahe hain: `server.js`, `package.json`, `lib/`, `public/`, `tests/`

---

## 4. Step 2: Render Setup

### 4.1 Render account create karo

1. Go to [render.com](https://render.com)
2. Sign up / Sign in karo
3. GitHub se connect karo (Render GitHub pe jake authorized karega)

### 4.2 Service create karo

1. Render dashboard → **New** button → **Web Service**
2. **Connect GitHub** pe click karo
3. Apna `video-fetch-studio` repo choose karo
4. Render Node.js project detect kar lega (package.json dekh ke)
5. Default settings theek hain:
   - Build command: (ham customized karega — step 5 dekho)
   - Start command: `npm start` (auto-detected)

---

## 5. Step 3: Build Command

⚠️ **IMPORTANT**: Default build command (`npm install`) nahi chalega — browser scanning kaam nahi karega.

### 5.1 Custom build command daalo

Render dashboard → service → **Settings** → **Build Command** field mein:

```
npm install && PLAYWRIGHT_BROWSERS_PATH=/opt/render/project/src/video-fetch-studio/.playwright npx playwright install chromium
```

### 5.2 Path adjust karo

⚠️ **Path important hai** — tumhara project kahan hai Render pe?

Agar project root folder mein hai (default):
```
/opt/render/project/src/video-fetch-studio/
```

Agar project subdirectory mein hai (jaise `VideoDownloader/`):
```
/opt/render/project/src/VideoDownloader/
```

Build command mein usi path ka use karo.

### 5.3 Confirm karo

Build command field mein exactly ye hona chahiye:

```
npm install && PLAYWRIGHT_BROWSERS_PATH=/opt/render/project/src/VideoDownloader/.playwright npx playwright install chromium
```

(Agar project root mein hai toh `video-fetch-studio` ka path use karo)

---

## 6. Step 4: Environment Variables

### 6.1 PLAYWRIGHT_BROWSERS_PATH add karo

1. Render dashboard → service → **Settings** → **Environment**
2. **Environment Variables** section mein **"Add variable"** pe click karo
3. Do fields dikhega:

**Key:**
```
PLAYWRIGHT_BROWSERS_PATH
```

**Value:**
```
/opt/render/project/src/VideoDownloader/.playwright
```

(Path same hona chahiye jo build command mein tumne use kiya)

4. **Save** pe click karo

### 6.2 (Optional) ENABLE_BROWSER_SCAN add karo

Agar browser scanning problem dekhvaye toh:

**Key:**
```
ENABLE_BROWSER_SCAN
```

**Value:**
```
0
```

Ye browser scanning disable kar dega — lekin isse JS-loaded videos detect nahi honge. Pehle try karo bina is variable ke.

---

## 7. Step 5: Deploy & Test

### 7.1 Deploy karo

1. Render dashboard → service → **Services** tab
2. Deployment auto-start ho jayega (push ke saath ya manually trigger karo)
3. Build complete hone tak intezaar karo (1-3 minutes)
4. Service Status: **Live** dikhne lagega
5. URL dikhega: `https://<service-name>.onrender.com`

### 7.2 Test karo

#### Health check:
```bash
curl https://<service-name>.onrender.com/api/health
```
Expected output:
```json
{"ok":true,"browserScanning":true,"ffmpegAvailable":true}
```

#### Scan test (video URL daalo):
```bash
curl -X POST https://<service-name>.onrender.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://yourstream.pages.dev/v/4748cd651a873c87f6399cef"}'
```

Expected output (video dikhega):
```json
{
  "requestedUrl": "...",
  "pageTitle": "YourStream",
  "videos": [
    {
      "id": "...",
      "title": "...",
      "quality": "1280p",
      "size": 3475766,
      ...
    }
  ]
}
```

Agar `videos: []` aaye toh troubleshooting section dekho.

---

## 8. Troubleshooting

### 8.1 Browser unavailable (`browserUnavailable: true`)

**Symptom**: Scan return karti hai `"videos":[]` aur `"browserUnavailable":true`

**Causes**:
1. PLAYWRIGHT_BROWSERS_PATH environment variable nahi hai
2. Build command mein PLAYWRIGHT_BROWSERS_PATH nahi hai
3. Path mismatch hai (build command aur env var mein alag-alag path hai)

**Fix**:
- Build command aur environment variable mein **same path** use karo
- Redeploy karo

### 8.2 Build fails — `su: Authentication failure`

**Cause**: `--with-deps` flag use kar rahe ho

**Fix**: `--with-deps` hata do:
```
npm install && npx playwright install chromium
```

### 8.3 Video found but download fails

**Cause**: Free plan so jata hai (15 minute baad)

**Fix**: Pehla request aane par thoda intezaar karo (5-10 second lagta hai wake-up mein)

### 8.4 FFmpeg available: false

**Cause**: FFmpeg Render pe installed nahi hai (free plan mein possible hai)

**Effect**: HLS/DASH streams merge nahi honge — lekin direct MP4 downloads kaam karenge

**Fix**: Agar HLS/DASH chahiye toh paid plan pe jao ya FFmpeg install karo (advanced)

### 8.5 Service URL change karna

1. Render dashboard → service → **Settings** → **General**
2. **Service name** ke saath URL change ho jata hai
3. Custom domain kare ke liye **Domains** section pe jao (paid plan chahiye)

---

## 9. Important Notes

### ✅ Kuchh karna hai:
- [ ] Build command custom karo (step 5)
- [ ] PLAYWRIGHT_BROWSERS_PATH environment variable add karo (step 6)
- [ ] Deploy karo (step 7)
- [ ] Test karo (step 7.2)

### ❌ Kuchh nahi karna hai:
- App code mein koi changes nahi karna
- package.json, server.js, lib/* — koi bhi file modify nahi karna

### ⚠️ Free Plan Limitations:
- 15 minute inactivity baad so jata hai (5-10 second wake-up time)
- 0.1 GB RAM — heavy operations slow ho sakte hain
- FFmpeg guaranteed nahi hai
- Custom domain nahi hai

### 🔒 Security:
- App public URLs scan karta hai — sirf public video URLs use karo
- Rate limit hai (12 scans per minute per IP)
- Download limit hai (2 GB safety limit)

---

## Quick Reference

| Step | Action | Location |
|------|--------|----------|
| 1 | GitHub repo create karo | github.com |
| 2 | Code push karo | terminal |
| 3 | Render service create karo | render.com |
| 4 | Build command customize karo | Render Settings |
| 5 | Env variable add karo | Render Settings |
| 6 | Deploy & test karo | Render Dashboard |

---

## Need Help?

Agar koi step mein problem aaye toh:
1. Render dashboard → service → **Logs** pe jake error messages dekhho
2. Is file ke troubleshooting section ko follow karo
3. Test endpoints `/api/health` aur `/api/scan` se app ka status check karo

---

*Last updated: 2026-10-24*
