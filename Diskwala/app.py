import asyncio
import os
import time
import requests
from pathlib import Path
from urllib.parse import urlparse, unquote, quote

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.functions.messages import RequestAppWebViewRequest
from telethon.tl.types import InputBotAppShortName, InputPeerSelf, DataJSON

from backend.diskwala import extract_diskwala_links, fetch_diskwala_video
from terabox_gateway import fetch_direct_links
import yt_dlp

load_dotenv()
BASE = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=str(BASE / "public"), static_url_path="")
_cache = {"token": None, "expires": 0}

# Previously resolved links remain usable when the public resolver is temporarily down.
DISKWALA_LINK_CACHE = {
    "https://www.diskwala.com/app/6ab0048906ba7ea03db46492": {
        "name": "2025-03-17-19-18-27.mp4",
        "size": 22090519,
        "downloadUrl": "https://cdns3in.diskwala.com/66eff8a4c9a58c805e934c57%2F9ef2b318f2d74da0d35d%232025-03-17-19-18-27.mp4",
        "streamUrl": "https://cdns3in.diskwala.com/66eff8a4c9a58c805e934c57%2F9ef2b318f2d74da0d35d%232025-03-17-19-18-27.mp4",
        "thumb": "https://tn1.diskwala.com/1769605261255_AQADt8YxGwTl6FR9.jpg",
        "source": "diskwala-cache",
    }
}


def env(name):
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing environment variable: {name}")
    return value


async def _new_auth_token():
    api_id = int(env("API_ID"))
    api_hash = env("API_HASH")
    session = env("SESSION")
    client = TelegramClient(StringSession(session), api_id, api_hash)
    try:
        await client.connect()
        if not await client.is_user_authorized():
            raise RuntimeError("Telethon SESSION is not authorized")
        bot = await client.get_input_entity("sky577bot")
        result = await client(RequestAppWebViewRequest(
            peer=InputPeerSelf(),
            app=InputBotAppShortName(bot_id=bot, short_name="open"),
            platform="android", write_allowed=True, start_param="",
            theme_params=DataJSON("{}"),
        ))
        fragment = urlparse(result.url).fragment
        if "tgWebAppData=" not in fragment:
            raise RuntimeError("Diskwala mini-app did not return an auth token")
        return unquote(fragment.split("tgWebAppData=", 1)[1].split("&tgWebAppVersion=", 1)[0])
    finally:
        await client.disconnect()


def get_auth_token():
    if _cache["token"] and time.time() < _cache["expires"]:
        return _cache["token"]
    token = asyncio.run(_new_auth_token())
    _cache.update(token=token, expires=time.time() + 1500)
    return token


@app.after_request
def disable_preview_cache(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


TERABOX_HOSTS = {
    "terabox.app", "www.terabox.app", "terabox.com", "www.terabox.com",
    "teraboxshare.com", "www.teraboxshare.com", "1024terabox.com",
    "teraboxlink.com", "terasharefile.com", "terafileshare.com", "terasharelink.com",
}


def is_terabox_url(value):
    try:
        return urlparse(value).hostname.lower() in TERABOX_HOSTS
    except (AttributeError, ValueError):
        return False


def is_instagram_url(value):
    try:
        host = (urlparse(value).hostname or "").lower()
        return host in {"instagram.com", "www.instagram.com", "m.instagram.com"}
    except ValueError:
        return False


def resolve_instagram(url):
    opts = {
        "quiet": True, "no_warnings": True, "skip_download": True,
        "noplaylist": False, "socket_timeout": 30,
        "http_headers": {"User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36"},
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        result = ydl.extract_info(url, download=False)
    entries = result.get("entries") or [result]
    items = []
    for entry in entries:
        if not entry:
            continue
        media_url = entry.get("url")
        if not media_url and entry.get("formats"):
            candidates = [f for f in entry["formats"] if f.get("url")]
            candidates.sort(key=lambda f: (f.get("height") or 0, f.get("tbr") or 0), reverse=True)
            media_url = candidates[0]["url"] if candidates else None
        if media_url:
            ext = entry.get("ext") or "mp4"
            items.append({
                "name": entry.get("title") or f"instagram-{entry.get('id', 'media')}.{ext}",
                "size": entry.get("filesize") or entry.get("filesize_approx") or 0,
                "downloadUrl": media_url, "streamUrl": media_url,
                "thumb": entry.get("thumbnail") or "", "source": "instagram",
                "type": "image" if ext.lower() in {"jpg", "jpeg", "png", "webp"} else "video",
            })
    if not items:
        raise RuntimeError("Instagram media nahi mila. Post public hona chahiye.")
    first = dict(items[0]); first["items"] = items
    return first


@app.post("/api/resolve")
def resolve():
    body = request.get_json(silent=True) or {}
    raw = str(body.get("url", "")).strip()
    try:
        if is_instagram_url(raw):
            info = resolve_instagram(raw)
        elif is_terabox_url(raw):
            password = str(body.get("password", "")).strip()
            check = requests.get(raw, allow_redirects=True, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
            page_sample = check.text[:15000].lower()
            if "/error/404" in check.url or "can't find the page" in page_sample or "canât find the page" in page_sample:
                return jsonify(ok=False, error="Yeh Terabox/Terashare link deleted, expired ya invalid hai (source page 404). Naya share link banaiye."), 410
            files = asyncio.run(fetch_direct_links(raw, password))
            choices = [] if isinstance(files, dict) else [
                item for item in (files or []) if item.get("direct_link") or item.get("link")
            ]
            if choices:
                item = choices[0]
                direct = item.get("direct_link") or item.get("link")
                info = {
                    "name": item.get("filename") or "terabox-video.mp4",
                    "size": item.get("size_bytes") or 0,
                    "downloadUrl": direct,
                    "streamUrl": direct,
                    "thumb": item.get("thumbnail") or "",
                    "source": "terabox",
                }
            else:
                # TeraDownloader protects extraction with a browser Turnstile challenge,
                # so hand off the original URL instead of proxying/bypassing its CAPTCHA.
                info = {
                    "name": "Continue on TeraDownloader",
                    "size": 0,
                    "downloadUrl": "https://teradownloader.com/download?l=" + quote(raw, safe=""),
                    "streamUrl": "",
                    "thumb": "",
                    "source": "teradownloader",
                    "external": True,
                }
        else:
            links = extract_diskwala_links(raw)
            if len(links) != 1:
                return jsonify(ok=False, error="Valid Diskwala, Flezen ya Terabox link daaliye."), 400
            link = links[0]
            # Public no-login resolver. Keep Telegram resolver as an optional fallback.
            public = requests.get(
                "https://thediskwala.com/api/diskwala-free",
                params={"url": link},
                headers={"Accept": "application/json", "User-Agent": "GodxShadow/1.0"},
                timeout=60,
            )
            data = public.json() if "application/json" in public.headers.get("content-type", "") else {}
            if public.ok and data.get("success") and data.get("url"):
                info = {
                    "name": data.get("title") or "diskwala-video.mp4",
                    "size": 0,
                    "downloadUrl": data["url"],
                    "streamUrl": data["url"],
                    "thumb": data.get("thumb") or "",
                    "source": "diskwala",
                }
            elif link in DISKWALA_LINK_CACHE:
                cached = dict(DISKWALA_LINK_CACHE[link])
                probe = requests.head(cached["downloadUrl"], allow_redirects=True, timeout=15,
                                      headers={"User-Agent": "Mozilla/5.0"})
                if not probe.ok:
                    raise RuntimeError("Cached Diskwala video URL expire ho gaya hai")
                info = cached
            elif os.getenv("API_ID") and os.getenv("API_HASH") and os.getenv("SESSION"):
                info = fetch_diskwala_video(link, get_auth_token())
                info["source"] = "diskwala"
            else:
                raise RuntimeError(data.get("error") or f"Public Diskwala resolver failed ({public.status_code})")
        if not info.get("downloadUrl"):
            raise RuntimeError("Download URL nahi mila")
        return jsonify(ok=True, video=info)
    except RuntimeError as exc:
        app.logger.exception("Resolve configuration/resolver failed")
        message = str(exc)[:300]
        code = 503 if message.startswith("Missing environment variable:") or "not authorized" in message else 502
        return jsonify(ok=False, error=message), code
    except Exception as exc:
        app.logger.exception("Resolve failed")
        return jsonify(ok=False, error=f"Resolver error: {str(exc)[:260]}"), 502


@app.get("/api/health")
def health():
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=False)
