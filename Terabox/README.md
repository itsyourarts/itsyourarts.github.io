# Terabox Player & Downloader — Browser (No Telegram)

Link paste → file par **tap** → video site ke andar hi full player me chalta hai → **Download** button.

## Run
```bash
cd terabox-web && npm install && npm start   # http://localhost:3000
```

## Kaise kaam karta hai
1. **Resolve** `GET /api/resolve?url=&cookie=` — share page se `jsToken` + cookies → `/api/shorturlinfo` (sign, timestamp, shareid, uk, file list) → `/api/sharedownload` (original dlink).
2. **Play (login ke bina ✅)** `GET /hls.m3u8?t=&i=` — TeraBox ke `/share/streaming` (type `M3U8_AUTO_480`, fallback `M3U8_FLV_264_480`) ki playlist proxy karke segments `/seg` se serve hote hain. Frontend me **hls.js** (locally bundled `public/hls.min.js`) se `<video>` me chalta hai, Safari/iOS me native HLS. Fullscreen button bhi hai.
3. **Download 480p (login ke bina ✅)** `GET /hlsdl?t=&i=` — TS segments poll + concat karke ek `.ts` file deta hai (VLC / MX Player me chalti hai).
4. **Download original quality** `GET /dl?t=&i=` — dlink proxy. Iske liye **ndus cookie zaroori hai** (TeraBox ab guest ko `403 user not exists` deta hai — ye Terabox ka server-side restriction hai, koi public API ise bypass nahi kar paata). UI ke Advanced section me cookie paste karein.
5. `GET /thumb?t=&i=` — thumbnail proxy (Referer chahiye).

## Notes
- 480p HLS TeraBox live-transcode karta hai, isliye lambi video ka `.ts` download transcode ki speed se aata hai (server poll karta rehta hai, max 10 min).
- 720p/1080p streaming ke liye TeraBox login (VIP) maangta hai.
- 20+ mirror domains supported (terasharefile, 1024tera, 4funbox, terasharelink, mirrobox…).
