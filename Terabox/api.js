// Terabox link resolver — browser version (no Telegram).
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const TERABOX_HOSTS = [
  "terabox.com","teraboxapp.com","1024terabox.com","4funbox.com","mirrobox.com","nephobox.com",
  "momerybox.com","tibibox.com","terabox.app","freeterabox.com","1024tera.com","teraboxlink.com",
  "terasharelink.com","terasharefile.com","teraboxshare.com","gibibox.com","goaibox.com",
  "terafileshare.com","teraboxdownload.com","sharelink.terabox.com","teraboxs.com","tera.app",
];

function isTeraboxUrl(url) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    return TERABOX_HOSTS.some((d) => h === d || h.endsWith("." + d));
  } catch { return false; }
}

function human(bytes) {
  const b = Number(bytes) || 0;
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, n = b;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 2 : 0)} ${u[i]}`;
}

const VIDEO_RE = /\.(mp4|mkv|webm|mov|m4v|avi|ts)$/i;
const IMAGE_RE = /\.(jpe?g|png|gif|webp|bmp|heic)$/i;
const AUDIO_RE = /\.(mp3|m4a|aac|flac|wav|ogg|opus)$/i;

function kind(name = "") {
  if (VIDEO_RE.test(name)) return "video";
  if (IMAGE_RE.test(name)) return "image";
  if (AUDIO_RE.test(name)) return "audio";
  return "file";
}

function normCookie(raw) {
  if (!raw) return "";
  const s = raw.trim();
  if (!s) return "";
  // user may paste only the ndus value
  if (!s.includes("=")) return "ndus=" + s;
  return s;
}

/**
 * Resolve a Terabox share link.
 * @param {string} link
 * @param {string} userCookie  optional logged-in cookie (ndus=...) for direct download links
 */
async function getDetails(link, userCookie = "") {
  const extra = normCookie(userCookie);

  // 1) open the share page (follows short-domain redirect) and grab jsToken + cookies
  const page = await fetch(link, { redirect: "follow", headers: { "User-Agent": UA } });
  const html = await page.text();
  const finalUrl = page.url;
  const origin = new URL(finalUrl).origin;
  const jsToken = (html.match(/fn%28%22(.*?)%22%29/) || [])[1];
  const surl =
    new URL(finalUrl).searchParams.get("surl") ||
    (finalUrl.split("/s/")[1] || "").split("?")[0].replace(/^1/, "");
  if (!jsToken || !surl) {
    throw new Error("Could not read the share page token — the link may be expired or private.");
  }
  const jar = (page.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
  const cookie = [jar, extra].filter(Boolean).join("; ");
  const H = { "User-Agent": UA, Referer: finalUrl, Cookie: cookie };

  // 2) share metadata (sign/timestamp/shareid/uk + file list)
  const q = `app_id=250528&web=1&channel=dubox&clienttype=0&jsToken=${jsToken}`;
  const infoRes = await fetch(`${origin}/api/shorturlinfo?${q}&shorturl=1${surl}&root=1`, { headers: H });
  const info = await infoRes.json();
  if (info.errno !== 0 || !Array.isArray(info.list) || !info.list.length) {
    throw new Error("Terabox did not return file info (errno " + info.errno + ").");
  }
  const files = info.list.filter((f) => String(f.isdir) !== "1");
  if (!files.length) throw new Error("This link points to a folder, not a direct file.");

  // 3) direct download links
  const base = `${q}&sign=${info.sign}&timestamp=${info.timestamp}&shareid=${info.shareid}&uk=${info.uk}`;
  const fidList = encodeURIComponent(JSON.stringify(files.map((f) => Number(f.fs_id))));
  let dlinks = {};
  try {
    const dRes = await fetch(
      `${origin}/api/sharedownload?${base}&product=share&nozip=0&fid_list=${fidList}&primaryid=${info.shareid}`,
      { headers: H }
    );
    const d = await dRes.json();
    if (d.errno === 0 && Array.isArray(d.list)) {
      d.list.forEach((f) => { if (f.dlink) dlinks[String(f.fs_id)] = f.dlink; });
    }
  } catch { /* ignore */ }

  const out = files.map((f) => ({
    name: f.server_filename,
    size: Number(f.size),
    sizeText: human(f.size),
    kind: kind(f.server_filename),
    thumb: f.thumbs?.url3 || f.thumbs?.url2 || f.thumbs?.url1 || null,
    fs_id: String(f.fs_id),
    url: dlinks[String(f.fs_id)] || null,
  }));

  return {
    ok: true,
    needsCookie: out.some((f) => !f.url),
    referer: origin + "/",
    cookie,
    ctx: { origin, jsToken, sign: info.sign, timestamp: info.timestamp, shareid: info.shareid, uk: info.uk, cookie, referer: finalUrl },
    files: out,
  };
}

// HLS playlist (480p) — works without login
async function getPlaylist(ctx, fsId, type = "M3U8_AUTO_480") {
  const u = `${ctx.origin}/share/streaming?app_id=250528&web=1&channel=dubox&clienttype=0` +
    `&jsToken=${ctx.jsToken}&uk=${ctx.uk}&shareid=${ctx.shareid}&fid=${fsId}` +
    `&sign=${ctx.sign}&timestamp=${ctx.timestamp}&type=${type}&vip=0`;
  const r = await fetch(u, { headers: { "User-Agent": UA, Referer: ctx.referer, Cookie: ctx.cookie } });
  const txt = await r.text();
  if (!txt.startsWith("#EXTM3U")) {
    if (type !== "M3U8_FLV_264_480") return getPlaylist(ctx, fsId, "M3U8_FLV_264_480");
    throw new Error("Stream unavailable: " + txt.slice(0, 120));
  }
  return txt;
}

module.exports = { getDetails, getPlaylist, isTeraboxUrl, human, UA, normCookie };
