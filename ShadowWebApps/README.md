# ShadowWebApps

A 123apps-style suite of **browser-native file tools** — video, audio, PDF and image utilities that run entirely
on the user's device. No uploads, no accounts, no size paywalls.

```
ShadowWebApps/
├── index.html              → hub / catalogue (search + category tabs)
├── tool.html?t=<slug>      → the tool workspace (one router for every tool)
└── assets/
    ├── css/app.css         → design system (dark, violet→cyan gradient)
    └── js/
        ├── icons.js        → inline SVG icon set (no external assets)
        ├── tools-data.js   → the catalogue (48 tools, 32 live)
        ├── core.js         → file IO, DSP (WSOLA stretch, pitch, EQ), WAV/MP3 encoders, canvas helpers
        ├── kit.js          → reusable workspace UI (dropzone, file rows, progress, results)
        ├── tools.js        → every tool implementation
        └── vendor/         → lamejs (MP3), pdf-lib (PDF), pdf.js (rendering) — bundled locally
```

## Running it

Any static server works — the app has **no backend**:

```bash
cd ShadowWebApps
python3 -m http.server 8080
# open http://localhost:8080
```

Opening `index.html` straight from disk also works for most tools, but the PDF renderer and
MediaRecorder APIs prefer a real origin (`http://localhost` or `https://`).

## The 32 working tools

| Category | Live tools |
|---|---|
| **Video (7)** | Trim Video, Video to MP3, Mute Video, Change Video Speed, Rotate Video, Screen Recorder, Video Recorder |
| **Audio (10)** | Trim Audio, Audio Joiner, Change Volume, Change Speed, Change Pitch, Equalizer, Reverse Audio, Voice Recorder, Audio Converter |
| **PDF (10)** | Merge, Split, Rotate, Delete Pages, Add Page Numbers, Compress, PDF→JPG, PDF→PNG, PDF→Text, JPG→PDF |
| **Image (5)** | Image Converter, Resize, Compress, Rotate/Flip, Watermark |

Another 16 tools (merge videos, add audio to video, PDF protect/unlock, Word↔PDF, ebook/font/archive
converters…) are catalogued with a **Soon** badge and a graceful fallback page, so the site already has
123apps-style breadth.

## How the heavy lifting is done (no servers involved)

- **Video** — decoded by the `<video>` element, frames drawn to a `<canvas>`, audio routed through
  **WebAudio**, and both streams recorded with `canvas.captureStream()` + `MediaRecorder`
  (MP4 where the browser supports H.264, otherwise WebM).
- **Audio** — decoded with `decodeAudioData`, processed with custom DSP: linear resampling,
  **WSOLA time-stretch** (speed/pitch without chipmunking), biquad EQ shelves, gain, reverse, concat.
  Encoded to WAV by hand and to **MP3 with lamejs**.
- **PDF** — `pdf-lib` for structural edits (merge, split, rotate, delete, page numbers, image→PDF) and
  `pdf.js` for rasterising pages (PDF→JPG/PNG, compression, thumbnails, text extraction).
- **Images** — `Image` → `canvas` → `toBlob()`, with white flattening for JPG transparency.

## Extending it

1. Add an entry to `SWA_TOOLS` in `assets/js/tools-data.js` (`live: true`).
2. Register an implementation in `assets/js/tools.js`:

```js
SWA.tools['my-tool'] = function(ctx){
  const ws = SWA.kit.workspace(ctx, {accept:'image/*', icon:'stamp', label:'Drop a file'});
  ws.option(SWA.kit.range({label:'Amount', min:0, max:100, value:50, unit:'%'}));
  ws.setRun('Process', async (files, progress) => {
    progress(50, 'Working…');
    return { files:[{ blob, name:'out.png' }] };
  });
};
```

The shell (breadcrumbs, sidebar, related tools, workspace chrome) is generated automatically.
