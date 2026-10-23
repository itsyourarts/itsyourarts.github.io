import { load } from 'cheerio';
import { openPublic, PublicUrlError, readLimited } from './network.js';

const MAX_MANIFEST_BYTES = 2_000_000;

export function mediaKind(url, contentType = '') {
  const type = String(contentType).toLowerCase().split(';')[0].trim();
  if (/mpegurl|vnd\.apple\.mpegurl/.test(type)) return 'hls';
  if (type === 'application/dash+xml') return 'dash';
  if (type === 'video/mp4' || type === 'application/mp4') return 'mp4';
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const values = [...parsed.searchParams.values()].map((value) => value.toLowerCase());
    if (path.endsWith('.m3u8') || values.some((value) => value.endsWith('.m3u8'))) return 'hls';
    if (path.endsWith('.mpd') || values.some((value) => value.endsWith('.mpd'))) return 'dash';
    if (path.endsWith('.mp4') || values.some((value) => value.endsWith('.mp4'))) return 'mp4';
  } catch { /* Invalid links are rejected by URL validation elsewhere. */ }
  return null;
}

export function qualityLabel(height) {
  const n = Number(height);
  if (!Number.isFinite(n) || n <= 0) return 'Source';
  if (n >= 4320) return '8K';
  if (n >= 2160) return '4K';
  if (n >= 1440) return '2K';
  return `${Math.round(n)}p`;
}

// A source MP4 reports its actual byte length; adaptive streams usually do
// not. The helpers below provide clearly marked estimates only when the
// source declares both a duration and a bitrate. Never invent a file size.
export function hlsDurationSeconds(contents) {
  const body = String(contents);
  if (!/^#EXT-X-ENDLIST\s*$/m.test(body)) return null;
  let total = 0;
  for (const match of body.matchAll(/^#EXTINF:\s*([0-9]+(?:\.[0-9]+)?)/gm)) total += Number(match[1]);
  return total > 0 && total <= 24 * 3600 ? total : null;
}

export function parseIsoDuration(value) {
  const match = /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i.exec(String(value || ''));
  if (!match || !match.slice(1).some(Boolean)) return null;
  const seconds = (Number(match[1] || 0) * 86400) + (Number(match[2] || 0) * 3600)
    + (Number(match[3] || 0) * 60) + Number(match[4] || 0);
  return seconds > 0 && seconds <= 24 * 3600 ? seconds : null;
}

export function dashDurationSeconds(contents) {
  const $ = load(String(contents), { xmlMode: true });
  const root = $('MPD').first();
  if (!root.length) return null;
  const overall = parseIsoDuration(root.attr('mediaPresentationDuration'));
  if (overall) return overall;
  const periods = root.children('Period').toArray();
  if (!periods.length) return null;
  const durations = periods.map((period) => parseIsoDuration($(period).attr('duration')));
  return durations.every(Boolean) ? durations.reduce((sum, seconds) => sum + seconds, 0) : null;
}

export function estimatedSizeBytes(duration, bitrate) {
  if (!Number.isFinite(duration) || !Number.isFinite(bitrate) || duration <= 0 || bitrate <= 0) return null;
  const bytes = Math.round(duration * bitrate / 8);
  return bytes > 0 && bytes <= 200_000_000_000 ? bytes : null;
}

export function isLikelyFragmentUrl(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    if (/\.(?:m4s|ts|m4a|cmfv|cmfa|aac)(?:$)/.test(path)) return true;
    if (/(?:^|[\/_-])(?:init|segment|chunk|frag|part|seg|sq)[-_]?\d*(?:[_.-]|$)/.test(path.split('/').pop() || '') && /\.(?:mp4|m4s)$/.test(path)) return true;
    if ([...parsed.searchParams.keys()].some((key) => /^(?:segment|chunk|part|fragment|sq|bytestart|byteend)$/i.test(key))) return true;
  } catch { /* Not a usable media URL. */ }
  return false;
}

function parseAttributes(line) {
  const attributes = {};
  for (const match of line.matchAll(/([A-Za-z0-9-]+)=(?:"([^"]*)"|([^,]*))(?:,|$)/g)) {
    attributes[match[1].toUpperCase()] = match[2] ?? match[3];
  }
  return attributes;
}

export function parseHlsManifest(contents, baseUrl) {
  const lines = String(contents).replace(/^\uFEFF/, '').split(/\r?\n/).map((line) => line.trim());
  if (lines[0] !== '#EXTM3U') throw new PublicUrlError('The video host did not return a valid HLS playlist.', 422);
  const variants = [];
  const children = new Set();
  let mediaGroup = null;
  let drm = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#EXT-X-(?:KEY|SESSION-KEY):/.test(line)) {
      const attrs = parseAttributes(line.slice(line.indexOf(':') + 1));
      if (attrs.METHOD === 'SAMPLE-AES' || (attrs.KEYFORMAT && attrs.KEYFORMAT !== 'identity')) drm = true;
    }
    if (line.startsWith('#EXT-X-MEDIA:')) {
      const attrs = parseAttributes(line.slice(13));
      if (attrs.TYPE === 'AUDIO' && attrs.URI) {
        try { children.add(new URL(attrs.URI, baseUrl).toString()); } catch { /* skip bad link */ }
      }
    }
    if (line.startsWith('#EXT-X-STREAM-INF:')) {
      const attrs = parseAttributes(line.slice(18));
      let j = i + 1;
      while (j < lines.length && (!lines[j] || lines[j].startsWith('#'))) j += 1;
      if (j >= lines.length) continue;
      let variantUrl;
      try { variantUrl = new URL(lines[j], baseUrl).toString(); }
      catch { continue; }
      children.add(variantUrl);
      const [width, height] = String(attrs.RESOLUTION || '').split('x').map(Number);
      const nameHeight = Number(String(attrs.NAME || '').match(/(\d{3,4})p?/)?.[1]) || 0;
      variants.push({
        index: variants.length,
        url: variantUrl,
        width: width || null,
        height: height || nameHeight || null,
        bandwidth: Number(attrs.BANDWIDTH) || null,
        averageBandwidth: Number(attrs['AVERAGE-BANDWIDTH']) || null,
        codecs: attrs.CODECS || null,
        audioGroup: attrs.AUDIO || null,
        quality: qualityLabel(height || nameHeight),
      });
      i = j;
    }
    if (line && !line.startsWith('#')) {
      try { children.add(new URL(line, baseUrl).toString()); } catch { /* invalid segment */ }
    }
  }
  mediaGroup = variants.length ? 'master' : 'media';
  const complete = mediaGroup === 'master' || lines.includes('#EXT-X-ENDLIST');
  if (!variants.length && !drm && complete) {
    variants.push({ index: 0, url: baseUrl, width: null, height: null, bandwidth: null, quality: 'Source' });
  }
  return { type: mediaGroup, variants, children: [...children], complete, drm };
}

function isVideoAdaptation($, adaptation) {
  const type = String($(adaptation).attr('contentType') || '').toLowerCase();
  const mime = String($(adaptation).attr('mimeType') || '').toLowerCase();
  if (type === 'video') return mime !== 'video/webm';
  if (mime === 'video/mp4') return true;
  if (mime === 'video/webm') return false;
  return $(adaptation).children('Representation').toArray().some((rep) => {
    const repMime = String($(rep).attr('mimeType') || '').toLowerCase();
    return repMime === 'video/mp4' || (!repMime && Number($(rep).attr('height')) > 0);
  });
}

function isAudioAdaptation($, adaptation) {
  const type = String($(adaptation).attr('contentType') || '').toLowerCase();
  const mime = String($(adaptation).attr('mimeType') || '').toLowerCase();
  return type === 'audio' || mime.startsWith('audio/');
}

export function dashAudioBandwidth(contents) {
  const $ = load(String(contents), { xmlMode: true });
  let bandwidth = 0;
  $('MPD').first().children('Period').first().children('AdaptationSet').each((_index, adaptation) => {
    if (bandwidth || !isAudioAdaptation($, adaptation)) return;
    const mime = String($(adaptation).attr('mimeType') || '').toLowerCase();
    if (mime && mime !== 'audio/mp4') return;
    const rep = $(adaptation).children('Representation').first();
    bandwidth = Number(rep.attr('bandwidth') || $(adaptation).attr('bandwidth')) || 0;
  });
  return bandwidth;
}

export function parseDashManifest(contents) {
  const $ = load(String(contents), { xmlMode: true, decodeEntities: false });
  const root = $('MPD').first();
  if (!root.length) throw new PublicUrlError('The video host did not return a valid DASH manifest.', 422);
  const complete = String(root.attr('type') || 'static').toLowerCase() !== 'dynamic';
  const drm = $('ContentProtection').toArray().some((node) => {
    const scheme = String($(node).attr('schemeIdUri') || '').toLowerCase();
    return /widevine|playready|fairplay|clearkey|cenc|mp4protection|adobe/.test(scheme) || !!$(node).attr('cenc:default_KID');
  });
  const period = root.children('Period').first();
  const variants = [];
  const children = new Set();
  period.children('AdaptationSet').each((adaptationIndex, adaptation) => {
    if (!isVideoAdaptation($, adaptation)) return;
    $(adaptation).children('Representation').each((_index, representation) => {
      const mime = String($(representation).attr('mimeType') || $(adaptation).attr('mimeType') || 'video/mp4').toLowerCase();
      if (mime !== 'video/mp4') return;
      const width = Number($(representation).attr('width') || $(adaptation).attr('maxWidth')) || null;
      const height = Number($(representation).attr('height') || $(adaptation).attr('maxHeight')) || null;
      const variant = {
        index: variants.length,
        adaptationIndex,
        representationId: String($(representation).attr('id') || ''),
        width,
        height,
        bandwidth: Number($(representation).attr('bandwidth')) || null,
        codecs: $(representation).attr('codecs') || null,
        quality: qualityLabel(height),
      };
      variants.push(variant);
      $(representation).children('BaseURL').each((_i, base) => {
        if ($(base).text()) children.add($(base).text().trim());
      });
    });
  });
  return { type: 'dash', variants, children: [...children], complete, drm };
}

export function collapseQualities(variants) {
  const bestByHeight = new Map();
  for (const variant of variants) {
    const key = variant.height || `unknown-${variant.index}`;
    const previous = bestByHeight.get(key);
    if (!previous || (variant.bandwidth || 0) > (previous.bandwidth || 0)) bestByHeight.set(key, variant);
  }
  return [...bestByHeight.values()].sort((a, b) => (a.height || 0) - (b.height || 0));
}

export async function fetchManifest(url, headers = {}) {
  const { response, finalUrl } = await openPublic(url, { headers, timeoutMs: 9000 });
  if (response.statusCode < 200 || response.statusCode >= 300) {
    response.resume();
    throw new PublicUrlError(`The stream host returned HTTP ${response.statusCode}.`, 422);
  }
  const body = (await readLimited(response, MAX_MANIFEST_BYTES)).toString('utf8');
  const kind = mediaKind(finalUrl, response.headers['content-type']) ||
    (body.startsWith('#EXTM3U') ? 'hls' : body.includes('<MPD') ? 'dash' : null);
  if (!['hls', 'dash'].includes(kind)) throw new PublicUrlError('This URL is not a supported HLS or DASH manifest.', 422);
  return { url: finalUrl, kind, body };
}

export async function inspectManifest(candidate) {
  const headers = candidate.requestHeaders || (candidate.referrer ? { Referer: candidate.referrer } : {});
  const manifest = await fetchManifest(candidate.url, headers);
  const parsed = manifest.kind === 'hls'
    ? parseHlsManifest(manifest.body, manifest.url)
    : parseDashManifest(manifest.body);
  if (parsed.drm || !parsed.complete || !parsed.variants.length) return null;
  let duration = null;
  if (manifest.kind === 'hls') {
    if (parsed.type === 'media') duration = hlsDurationSeconds(manifest.body);
    else if (parsed.variants.some((variant) => variant.bandwidth || variant.averageBandwidth)) {
      // A master has bitrates but no running time. Inspect only ONE child
      // playlist for duration; never request/download every video segment.
      try {
        const child = await fetchManifest(parsed.variants[0].url, headers);
        if (child.kind === 'hls') duration = hlsDurationSeconds(child.body);
      } catch { /* Display "size unavailable" rather than a guessed number. */ }
    }
  } else duration = dashDurationSeconds(manifest.body);
  const audioBitrate = manifest.kind === 'dash' ? dashAudioBandwidth(manifest.body) : 0;
  const variants = collapseQualities(parsed.variants).map((variant) => {
    const bitrate = variant.averageBandwidth || variant.bandwidth || 0;
    const size = estimatedSizeBytes(duration, bitrate ? bitrate + audioBitrate : 0);
    return { ...variant, size, sizeEstimated: Boolean(size) };
  });
  const title = String(candidate.pageTitle || 'Video').replace(/\s+/g, ' ').slice(0, 100);
  return {
    kind: manifest.kind,
    url: manifest.url,
    referrer: candidate.referrer || '',
    requestHeaders: candidate.requestHeaders || null,
    title,
    filename: 'video.mp4',
    size: null,
    quality: variants.length > 1 ? `${variants.length} qualities` : variants[0].quality,
    source: manifest.kind === 'hls' ? 'HLS stream' : 'DASH stream',
    domain: new URL(manifest.url).hostname.replace(/^www\./, ''),
    variants,
    childUrls: parsed.children,
  };
}

// Limit a HLS master to one requested quality. Audio groups stay attached, so
// ffmpeg downloads both video and audio rather than only video segments.
export function selectedHlsMaster(contents, manifestUrl, selected) {
  const lines = String(contents).split(/\r?\n/);
  const kept = ['#EXTM3U'];
  const group = selected.audioGroup;
  let variantIndex = 0;
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || line === '#EXTM3U') continue;
    if (line.startsWith('#EXT-X-I-FRAME-STREAM-INF:')) continue;
    if (line.startsWith('#EXT-X-MEDIA:')) {
      const attrs = parseAttributes(line.slice(13));
      if (attrs.TYPE === 'AUDIO' && attrs['GROUP-ID'] === group) {
        kept.push(line.replace(/URI="([^"]+)"/g, (_all, relative) => `URI="${new URL(relative, manifestUrl).toString()}"`));
      }
      continue;
    }
    if (line.startsWith('#EXT-X-STREAM-INF:')) {
      let j = i + 1;
      while (j < lines.length && (!lines[j].trim() || lines[j].trim().startsWith('#'))) j += 1;
      if (variantIndex === selected.index && j < lines.length) {
        kept.push(line);
        kept.push(new URL(lines[j].trim(), manifestUrl).toString());
      }
      variantIndex += 1;
      i = j;
      continue;
    }
    if (line.startsWith('#')) kept.push(line);
  }
  if (!kept.some((line) => line.startsWith('#EXT-X-STREAM-INF:'))) {
    throw new PublicUrlError('That HLS quality is no longer available. Scan the page again.', 422);
  }
  return `${kept.join('\n')}\n`;
}

// Limit DASH to one video Representation plus the first MP4 audio track.
// Ensure relative BaseURLs resolve against the original public manifest.
export function selectedDashManifest(contents, manifestUrl, selected) {
  const $ = load(String(contents), { xmlMode: true, decodeEntities: false });
  const root = $('MPD').first();
  if (!root.length) throw new PublicUrlError('This DASH manifest is no longer available.', 422);
  root.children('BaseURL').slice(1).remove();
  const base = root.children('BaseURL').first();
  const rootUrl = new URL('./', manifestUrl).toString();
  if (base.length) base.text(new URL(base.text().trim(), manifestUrl).toString());
  else root.prepend(`<BaseURL>${rootUrl.replace(/&/g, '&amp;')}</BaseURL>`);
  root.children('Period').each((_periodIndex, period) => {
    let keptAudio = false;
    $(period).children('AdaptationSet').each((adaptationIndex, adaptation) => {
      if (isVideoAdaptation($, adaptation)) {
        if (adaptationIndex !== selected.adaptationIndex) { $(adaptation).remove(); return; }
        $(adaptation).children('Representation').each((_index, rep) => {
          if (String($(rep).attr('id') || '') !== selected.representationId) $(rep).remove();
        });
      } else if (isAudioAdaptation($, adaptation)) {
        const mime = String($(adaptation).attr('mimeType') || '').toLowerCase();
        if (!keptAudio && (mime === 'audio/mp4' || !mime)) {
          keptAudio = true;
          $(adaptation).children('Representation').slice(1).remove();
        } else $(adaptation).remove();
      } else $(adaptation).remove();
    });
  });
  if (!root.find('AdaptationSet Representation[width]').length) {
    throw new PublicUrlError('That DASH quality is no longer available. Scan the page again.', 422);
  }
  return $.xml();
}
