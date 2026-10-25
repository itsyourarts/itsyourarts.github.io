# ⚡ ShadowxAi + Seedance 2.5 Video Studio (`Ai/`)

Full-working integration of **[AI-APIs/Seedance-API](https://huggingface.co/AI-APIs/Seedance-API)** (ByteDance Seedance 2.5 / 2.0 / 2.0 Fast / 2.0 Mini via Apiframe v2 REST API) + **Shadow Web Agent** into **`itsyourarts.github.io/Ai`**, merged with Code Copy / Run / Full Preview, Stop button, AI Chat + Vision, and Create Image Studio.

---

## ✨ Kya-Kya Add Hua Hai?

1. **🎬 Seedance 2.5 Video Studio (`POST /v2/videos/generate` + `GET /v2/jobs/:id`)**
   - Models supported: `seedance-2.5` (4–30s), `seedance-2` (up to 4K / 1080p), `seedance-2-fast`, `seedance-2-mini`
   - **Text → Video**, **Image → Video** (`start_image`, `end_image` with phone/PC photo upload via `/v2/uploads`), aur **Multimodal References** (`reference_image_urls`, `reference_video_urls`, `reference_audio_urls`)
   - Native synchronized audio (`generate_audio`), Aspect Ratios (`16:9`, `9:16`, `1:1`, `21:9`, `4:3`, `3:4`, `adaptive`), Seed, Return Last Frame, Live Progress Bar & MP4 Download
2. **💬 Direct Chat Slash Command (`/video`)**
   - Chat box me seedha `/video <your scene>` likh kar send karein (image attach karke bhejenge to automatic Image-to-Video ban jayega!)
3. **🎨 Working Create Image Studio**
   - ByteDance `seedream-4` (jab `APIFRAME_API_KEY` set ho) + Instant Free Flux HD fallback, aur 1-click **"🎬 Animate in Seedance 2.5"** button
4. **💻 Merged `i.html` Features**
   - Code blocks me `📋 Copy`, `▶ Run`, `⛶ Full Preview`, `■ Stop` button, aur mobile dynamic keyboard spacing

---

## 🚀 Setup Guide (Vercel + GitHub Pages — 2 Minute Setup)

Kyunki `api.apiframe.ai` browser se direct CORS block karta hai aur aap apni `APIFRAME_API_KEY` visitors se chhupa kar server par rakhna chahte hain:

### Option A: Vercel par Deploy karein (Recommended)
1. Apni repo `itsyourarts/itsyourarts.github.io` me ye updated **`Ai/`** folder push kar dein.
2. [Vercel](https://vercel.com/new) par jayein → `itsyourarts.github.io` import karein.
3. **Root Directory** me **`Ai`** select karein.
4. **Environment Variables** me add karein:
   - Name: `APIFRAME_API_KEY`
   - Value: `afk_your_real_api_key` *(from https://console.apiframe.ai/signup)*
5. **Deploy** dabayein! Aapka Vercel URL (jaise `https://neon-ai-xyz.vercel.app`) turant 100% live chalega.

### Option B: `https://itsyourarts.github.io/Ai/` (GitHub Pages) se bhi chalayein
1. Upar Step A se jo Vercel URL mila (e.g. `https://neon-ai-xyz.vercel.app`), use `Ai/index.html` me line ~685 par paste kar dein:
   ```js
   const SEEDANCE_BACKEND_URL = "https://neon-ai-xyz.vercel.app";
   ```
2. GitHub par commit kar dein — ab **`https://itsyourarts.github.io/Ai/`** aur Vercel URL **dono** jagah visitors bina API key dale Seedance 2.5 videos generate kar sakenge!

### Option C: Node.js / Render / VPS / Termux par chalayein
```bash
cd Ai
cp .env.example .env
# .env file me APIFRAME_API_KEY=afk_... daalein
node server.js
```
*(Zero npm dependencies — `npm install` ki bhi zaroorat nahi!)*
