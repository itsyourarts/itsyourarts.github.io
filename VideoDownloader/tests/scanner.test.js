import test from 'node:test';
import assert from 'node:assert/strict';
import { assertPublicUrl, isMp4Url, isPublicIp, normalizeUrl } from '../lib/network.js';
import { __testing } from '../lib/scanner.js';

test('accepts public HTTP(S) links and normalizes a URL without a scheme', () => {
  assert.equal(normalizeUrl('example.com/watch?v=2'), 'https://example.com/watch?v=2');
  assert.equal(normalizeUrl('https://cdn.example.com/a.mp4#part'), 'https://cdn.example.com/a.mp4');
  assert.throws(() => normalizeUrl('file:///etc/passwd'), /HTTP and HTTPS/);
  assert.throws(() => normalizeUrl('https://user:pass@example.com/'), /passwords/);
});

test('blocks local, private, and link-local IP addresses, including IPv6-mapped ones', async () => {
  for (const ip of ['127.0.0.1', '10.5.2.1', '192.168.1.3', '169.254.169.254', '::1', '::ffff:127.0.0.1']) {
    assert.equal(isPublicIp(ip), false, ip);
  }
  assert.equal(isPublicIp('1.1.1.1'), true);
  assert.equal(isPublicIp('2606:4700:4700::1111'), true);
  await assert.rejects(assertPublicUrl('http://127.0.0.1/'), /Private or local/);
  await assert.rejects(assertPublicUrl('http://[::1]/'), /Private or local/);
  await assert.rejects(assertPublicUrl('https://localhost/'), /Private or local/);
});

test('recognizes MP4 URLs even when the filename is in a query parameter', () => {
  assert.equal(isMp4Url('https://cdn.example.com/clip.MP4?t=123'), true);
  assert.equal(isMp4Url('https://cdn.example.com/download?file=clip.mp4'), true);
  assert.equal(isMp4Url('https://cdn.example.com/clip.m3u8'), false);
});

test('extracts MP4 links from video elements, metadata, links, and escaped scripts', () => {
  const html = `<!doctype html><html><head>
    <title>My public video</title>
    <meta property="og:video" content="https://cdn.example.com/metadata.mp4">
    </head><body>
    <video><source src="/assets/flower.mp4?token=a&amp;quality=hd" type="video/mp4"></video>
    <a href="/files/lesson.mp4">Save</a>
    <script>var data = { file: "https:\\/\\/cdn.example.com\\/embedded.mp4" };</script>
    </body></html>`;
  const found = __testing.collectFromMarkup(html, 'https://example.com/watch', 'Example');
  assert.equal(found.pageTitle, 'My public video');
  const urls = found.candidates.map((item) => item.url);
  assert.ok(urls.some((url) => url.includes('/assets/flower.mp4?token=a&quality=hd')));
  assert.ok(urls.includes('https://cdn.example.com/metadata.mp4'));
  assert.ok(urls.includes('https://example.com/files/lesson.mp4'));
  assert.ok(urls.includes('https://cdn.example.com/embedded.mp4'));
});

test('refuses HTML or streaming manifests even when their URL ends in .mp4', () => {
  assert.equal(__testing.validMp4Response({ statusCode: 200, headers: { 'content-type': 'text/html' } }, 'https://example.com/clip.mp4'), false);
  assert.equal(__testing.validMp4Response({ statusCode: 200, headers: { 'content-type': 'application/vnd.apple.mpegurl' } }, 'https://example.com/clip.mp4'), false);
  assert.equal(__testing.validMp4Response({ statusCode: 206, headers: { 'content-type': 'video/mp4' } }, 'https://example.com/media?id=1'), true);
  assert.equal(__testing.validMp4Response({ statusCode: 200, headers: { 'content-type': 'application/octet-stream' } }, 'https://example.com/clip.mp4'), true);
});

test('keeps only safe headers from an actual browser media request', () => {
  const selected = __testing.pickBrowserMediaHeaders({
    referer: 'https://example.com/',
    'sec-fetch-dest': 'video',
    'sec-fetch-mode': 'no-cors',
    'sec-fetch-site': 'cross-site',
    cookie: 'session=secret',
    authorization: 'Bearer secret',
    'user-agent': 'not copied',
    host: 'internal.host',
  });
  assert.deepEqual(selected, {
    Referer: 'https://example.com/',
    'Sec-Fetch-Dest': 'video',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'cross-site',
  });
  assert.deepEqual(__testing.pickBrowserMediaHeaders({ 'sec-fetch-dest': 'document', referer: 'file:///etc/passwd' }), {});
});

test('HTTP and HTTPS player links resolving to the same MP4 become one measured-quality result', () => {
  const file = 'https://cdn.example.com/video.mp4';
  const duplicate = __testing.deduplicateDirectVideos([
    { kind: 'mp4', url: file, source: 'Browser video player', size: 1000, requestHeaders: null,
      quality: '480p', variants: [{ index: 0, url: file, quality: '480p', width: 854, height: 480 }] },
    { kind: 'mp4', url: file, source: 'Browser media response', size: 1000,
      requestHeaders: { 'Sec-Fetch-Dest': 'video' }, quality: 'Source',
      variants: [{ index: 0, url: file, quality: 'Source', width: null, height: null }] },
  ]);
  assert.equal(duplicate.length, 1);
  assert.equal(duplicate[0].quality, '480p');
  assert.equal(duplicate[0].variants[0].width, 854);
  assert.equal(duplicate[0].variants[0].height, 480);
  assert.equal(duplicate[0].requestHeaders['Sec-Fetch-Dest'], 'video');
});

test('recovers browser Fetch Metadata for a real extensionless MP4 media request', () => {
  const media = {
    resourceType: () => 'media',
    frame: () => ({ url: () => 'https://watch.example.com/video' }),
    url: () => 'https://media.example.net/api/stream/123',
  };
  assert.deepEqual(__testing.mediaHeadersForRequest(media, { referer: 'https://watch.example.com/' }, 'https://watch.example.com/video'), {
    Referer: 'https://watch.example.com/',
    'Sec-Fetch-Dest': 'video',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'cross-site',
  });
  const sameSite = { ...media, url: () => 'https://cdn.example.com/stream' };
  assert.equal(__testing.mediaHeadersForRequest(sameSite, {}, 'https://watch.example.com/video')['Sec-Fetch-Site'], 'same-site');
  const manifestFetch = { ...media, resourceType: () => 'fetch' };
  assert.deepEqual(__testing.mediaHeadersForRequest(manifestFetch, {}, 'https://watch.example.com/video'), {
    'Sec-Fetch-Dest': 'empty', 'Sec-Fetch-Mode': 'cors', 'Sec-Fetch-Site': 'cross-site',
  });
  const notMedia = { ...media, resourceType: () => 'document' };
  assert.deepEqual(__testing.mediaHeadersForRequest(notMedia, {}, 'https://watch.example.com/video'), {});
  assert.equal(__testing.isBrowserMediaRequest(media), true, 'extensionless browser video requests must be probed');
  assert.equal(__testing.isBrowserMediaRequest(notMedia), false);
});
