import test from 'node:test';
import assert from 'node:assert/strict';
import { mediaKind, qualityLabel, isLikelyFragmentUrl, parseHlsManifest, parseDashManifest, collapseQualities, selectedHlsMaster, selectedDashManifest, hlsDurationSeconds, parseIsoDuration, dashDurationSeconds, dashAudioBandwidth, estimatedSizeBytes } from '../lib/streams.js';
import { absolutizeHlsMedia } from '../lib/mux.js';

const HLS_URL = 'https://cdn.example.com/video/master.m3u8';
const HLS_MASTER = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="English",DEFAULT=YES,URI="audio/en.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=850000,RESOLUTION=854x480,AUDIO="audio",CODECS="avc1.42e01e,mp4a.40.2"
480/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2300000,RESOLUTION=1280x720,AUDIO="audio",CODECS="avc1.64001f,mp4a.40.2"
720/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4400000,RESOLUTION=1920x1080,AUDIO="audio"
1080/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=9000000,RESOLUTION=2560x1440,AUDIO="audio"
1440/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=18000000,RESOLUTION=3840x2160,AUDIO="audio"
2160/playlist.m3u8
`;

test('recognizes HLS and DASH by URL or MIME, including extensionless links', () => {
  assert.equal(mediaKind('https://cdn.example.com/path/master.m3u8'), 'hls');
  assert.equal(mediaKind('https://cdn.example.com/watch?id=1', 'application/vnd.apple.mpegurl'), 'hls');
  assert.equal(mediaKind('https://cdn.example.com/watch?id=1', 'application/dash+xml'), 'dash');
  assert.equal(mediaKind('https://cdn.example.com/watch?id=1', 'video/mp4'), 'mp4');
  assert.equal(mediaKind('https://cdn.example.com/seg-0001.m4s'), null);
});

test('lists only real HLS qualities and keeps selected video with its separate audio', () => {
  const parsed = parseHlsManifest(HLS_MASTER, HLS_URL);
  assert.equal(parsed.type, 'master');
  assert.deepEqual(parsed.variants.map((v) => v.quality), ['480p', '720p', '1080p', '2K', '4K']);
  assert.equal(parsed.children.includes('https://cdn.example.com/video/audio/en.m3u8'), true);
  const selected = selectedHlsMaster(HLS_MASTER, HLS_URL, parsed.variants[1]);
  assert.ok(selected.includes('https://cdn.example.com/video/720/playlist.m3u8'));
  assert.ok(selected.includes('https://cdn.example.com/video/audio/en.m3u8'));
  assert.ok(!selected.includes('480/playlist.m3u8'));
  assert.ok(!selected.includes('2160/playlist.m3u8'));
});

test('shows the full 240p-to-4K ladder only when every level is present in the source', () => {
  const sourceHeights = [240, 360, 480, 720, 1080, 1440, 2160];
  const master = '#EXTM3U\n' + sourceHeights.map((height, index) =>
    `#EXT-X-STREAM-INF:BANDWIDTH=${(index + 1) * 700000},RESOLUTION=${Math.round(height * 16 / 9)}x${height}\n${height}/media.m3u8\n`).join('');
  assert.deepEqual(parseHlsManifest(master, HLS_URL).variants.map((variant) => variant.quality),
    ['240p', '360p', '480p', '720p', '1080p', '2K', '4K']);
  const only4K = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=18000000,RESOLUTION=3840x2160\n4k/media.m3u8\n';
  assert.deepEqual(parseHlsManifest(only4K, HLS_URL).variants.map((variant) => variant.quality), ['4K']);
});

test('media HLS playlist is one complete video rather than a list of segments', () => {
  const body = '#EXTM3U\n#EXT-X-MAP:URI="init.mp4"\n#EXTINF:4.0,\npart-1.m4s\n#EXTINF:4.0,\npart-2.m4s\n#EXT-X-ENDLIST\n';
  const parsed = parseHlsManifest(body, 'https://example.com/videos/720/index.m3u8');
  assert.equal(parsed.variants.length, 1);
  assert.equal(parsed.variants[0].quality, 'Source');
  assert.equal(parsed.complete, true);
  const absolute = absolutizeHlsMedia(body, 'https://example.com/videos/720/index.m3u8');
  assert.ok(absolute.includes('URI="https://example.com/videos/720/init.mp4"'));
  assert.ok(absolute.includes('https://example.com/videos/720/part-2.m4s'));
  assert.equal(isLikelyFragmentUrl('https://example.com/segment_001.mp4'), true);
  assert.equal(isLikelyFragmentUrl('https://example.com/video.m4s'), true);
  assert.equal(isLikelyFragmentUrl('https://example.com/full-video.mp4'), false);
  assert.throws(() => absolutizeHlsMedia('#EXTM3U\nfile:///etc/passwd', 'https://example.com/list.m3u8'), /unsupported media URL/);
});

test('DASH Representation selection retains one video plus audio in one MP4', () => {
  const manifest = `<?xml version="1.0"?><MPD xmlns="urn:mpeg:dash:schema:mpd:2011" type="static"><Period>
    <AdaptationSet mimeType="video/mp4"><Representation id="low" width="854" height="480" bandwidth="800000"><BaseURL>480.mp4</BaseURL></Representation><Representation id="high" width="1920" height="1080" bandwidth="4000000"><BaseURL>1080.mp4</BaseURL></Representation></AdaptationSet>
    <AdaptationSet mimeType="audio/mp4"><Representation id="audio" bandwidth="128000"><BaseURL>audio.mp4</BaseURL></Representation></AdaptationSet>
    </Period></MPD>`;
  const parsed = parseDashManifest(manifest);
  assert.deepEqual(parsed.variants.map((v) => v.quality), ['480p', '1080p']);
  const selected = selectedDashManifest(manifest, 'https://cdn.example.com/movie/manifest.mpd', parsed.variants[1]);
  assert.ok(selected.includes('id="high"'));
  assert.ok(selected.includes('id="audio"'));
  assert.ok(selected.includes('https://cdn.example.com/movie/'));
  assert.ok(!selected.includes('id="low"'));
  assert.equal(qualityLabel(1440), '2K');
  assert.equal(qualityLabel(2160), '4K');
  assert.equal(qualityLabel(4320), '8K');
});

test('quality sizes are measured for MP4 and clearly estimated for finite HLS/DASH', () => {
  assert.equal(hlsDurationSeconds('#EXTM3U\n#EXTINF:4.1,\na.ts\n#EXTINF:3.4,\nb.ts\n#EXT-X-ENDLIST\n'), 7.5);
  assert.equal(hlsDurationSeconds('#EXTM3U\n#EXTINF:4.1,\na.ts\n'), null, 'live HLS is not a complete video');
  assert.equal(parseIsoDuration('PT3M13.68S'), 193.68);
  const manifest = '<MPD type="static" mediaPresentationDuration="PT193.68S"><Period><AdaptationSet mimeType="audio/mp4"><Representation id="audio" bandwidth="128000"/></AdaptationSet></Period></MPD>';
  assert.equal(dashDurationSeconds(manifest), 193.68);
  assert.equal(dashAudioBandwidth(manifest), 128000);
  assert.equal(estimatedSizeBytes(10, 800000), 1000000);
  assert.equal(estimatedSizeBytes(null, 800000), null, 'unknown duration never becomes a fake size');
});

test('duplicate DASH bitrates at one resolution become one best-quality option', () => {
  const variants = [
    { height: 720, bandwidth: 2000000, index: 0 },
    { height: 720, bandwidth: 3000000, index: 1 },
    { height: 1080, bandwidth: 5000000, index: 2 },
  ];
  assert.deepEqual(collapseQualities(variants).map((v) => v.index), [1, 2]);
});
