# GodxShadow web downloader

Neon glass UI + Flask backend, adapted from the supplied Diskwala Telegram bot code.

## Setup

1. Use Python 3.10+.
2. Install: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and add your own `API_ID`, `API_HASH`, and authorized Telethon `SESSION`.
4. Run: `python app.py`
5. Open `http://localhost:8000`

The backend validates Diskwala/Flezen/Terabox URLs and returns a download URL plus browser video preview. Diskwala uses a temporary mini-app token through Telethon. Terabox support uses the MIT-licensed `terabox-gateway` package; public links are supported, while password/captcha-protected or upstream-blocked links may fail. Credentials remain server-side.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Keep the framework preset as **Other** and deploy from the project root.
4. `vercel.json` routes all requests to the Flask app automatically.
5. Optional Telegram credentials (`API_ID`, `API_HASH`, `SESSION`) must be added in **Project Settings → Environment Variables**, never committed to Git.

You can also deploy with the Vercel CLI: `vercel --prod`.

External resolver availability is not controlled by this project. Long-running extraction requests may hit Vercel function time limits; a VPS/Render/Railway service is more reliable for production download workloads.

## Important security notice

The uploaded archive's `.env.example` contained what appeared to be live Telegram, bot, session, and MongoDB credentials. Those values were not copied into this web app. Revoke/rotate them immediately: regenerate the bot token in BotFather, terminate the exposed Telegram session, rotate API/session credentials where applicable, and change the MongoDB password/network access.

Only download content you own or have permission to download, and comply with the source platform's terms.
