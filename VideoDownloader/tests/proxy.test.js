import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { createSafeProxy } from '../lib/mux.js';

const hasFFmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;

test('FFmpeg cannot bypass the public-IP proxy via a localhost media segment', { skip: !hasFFmpeg, timeout: 10_000 }, async () => {
  let privateRequests = 0;
  const privateServer = http.createServer((_req, res) => { privateRequests += 1; res.end('PRIVATE'); });
  await new Promise((resolve) => privateServer.listen(0, '127.0.0.1', resolve));
  const playlist = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:4\n#EXTINF:4,\n'
    + `http://127.0.0.1:${privateServer.address().port}/private.ts\n#EXT-X-ENDLIST\n`;
  const proxy = await createSafeProxy({ requestHeaders: {} }, { extension: 'm3u8', content: playlist });
  try {
    const args = ['-hide_banner', '-nostdin', '-loglevel', 'warning',
      '-protocol_whitelist', 'http,https,tcp,tls,crypto,httpproxy',
      '-allowed_extensions', 'ALL', '-i', `${proxy.url}/manifest.m3u8`, '-f', 'null', '-'];
    const ff = spawn('ffmpeg', args, { env: {
      ...process.env, http_proxy: proxy.url, https_proxy: proxy.url,
      HTTP_PROXY: proxy.url, HTTPS_PROXY: proxy.url, no_proxy: '', NO_PROXY: '',
    } });
    let stderr = '';
    ff.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    const exitCode = await new Promise((resolve, reject) => {
      ff.once('error', reject);
      ff.once('close', resolve);
    });
    assert.notEqual(exitCode, 0);
    assert.match(stderr, /HTTP error 502 Bad Gateway/);
    assert.equal(privateRequests, 0, 'Local service must never receive FFmpeg requests');
  } finally {
    proxy.close();
    privateServer.close();
  }
});
