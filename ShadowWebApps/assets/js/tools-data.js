/* ShadowWebApps — tool catalog
   live: true  -> fully working, runs 100% in the browser
   live: false -> catalogued for parity, shows "Soon" badge
*/
const SWA_CATEGORIES = [
  { id: 'all',       name: 'All tools',     icon: 'grid' },
  { id: 'video',     name: 'Video tools',   icon: 'video' },
  { id: 'audio',     name: 'Audio tools',   icon: 'wave' },
  { id: 'pdf',       name: 'PDF tools',     icon: 'pdf' },
  { id: 'image',     name: 'Image tools',   icon: 'image' },
  { id: 'convert',   name: 'Converters',    icon: 'swap' }
];

const SWA_TOOLS = [
  /* ---------------- VIDEO ---------------- */
  { slug:'trim-video', name:'Trim Video', cat:'video', icon:'scissors', live:true,
    blurb:'Cut your clip down to the exact seconds you need — re-encoded right in your browser.',
    accept:'video/*', kind:'video' },
  { slug:'video-to-mp3', name:'Video to MP3', cat:'video', icon:'music', live:true,
    blurb:'Pull the audio track out of any video and save it as an MP3.',
    accept:'video/*,audio/*', kind:'video' },
  { slug:'mute-video', name:'Mute Video', cat:'video', icon:'mute', live:true,
    blurb:'Strip the sound from a video and keep the picture untouched.',
    accept:'video/*', kind:'video' },
  { slug:'change-video-speed', name:'Change Video Speed', cat:'video', icon:'speed', live:true,
    blurb:'Slow-mo or timelapse — speed a video up or down with one slider.',
    accept:'video/*', kind:'video' },
  { slug:'rotate-video', name:'Rotate Video', cat:'video', icon:'rotate', live:true,
    blurb:'Turn a sideways phone clip the right way up (90°, 180°, 270°).',
    accept:'video/*', kind:'video' },
  { slug:'screen-recorder', name:'Screen Recorder', cat:'video', icon:'monitor', live:true,
    blurb:'Record your screen, a tab or a window and download the file instantly.',
    accept:'', kind:'recorder',
    steps:[['Allow capture','Your browser asks which screen, window or tab to share.'],
           ['Record','Hit start — a live preview and timer run while you work.'],
           ['Download','Stop and the WebM file is ready to save.']] },
  { slug:'video-recorder', name:'Video Recorder', cat:'video', icon:'camera', live:true,
    blurb:'Record yourself with the webcam — no plugin, no upload.',
    accept:'', kind:'recorder',
    steps:[['Allow the camera','Pick "Webcam" and accept the permission prompt.'],
           ['Record','Your face previews live; the timer keeps track.'],
           ['Download','Stop to get a ready-to-share WebM file.']] },
  { slug:'merge-videos', name:'Merge Videos', cat:'video', icon:'layers', live:false,
    blurb:'Join several clips into one file.', accept:'video/*', kind:'video' },
  { slug:'add-audio-to-video', name:'Add Audio to Video', cat:'video', icon:'music', live:false,
    blurb:'Lay a music track over your footage.', accept:'video/*', kind:'video' },
  { slug:'crop-video', name:'Crop Video', cat:'video', icon:'crop', live:false,
    blurb:'Frame your shot and cut away the edges.', accept:'video/*', kind:'video' },
  { slug:'resize-video', name:'Resize Video', cat:'video', icon:'expand', live:false,
    blurb:'Change resolution for any platform.', accept:'video/*', kind:'video' },
  { slug:'video-editor', name:'Video Editor', cat:'video', icon:'film', live:false,
    blurb:'A full timeline editor in the browser.', accept:'video/*', kind:'video' },

  /* ---------------- AUDIO ---------------- */
  { slug:'trim-audio', name:'Trim Audio', cat:'audio', icon:'scissors', live:true,
    blurb:'Cut MP3s and WAVs on a waveform — pick the region, export instantly.',
    accept:'audio/*', kind:'audio' },
  { slug:'audio-joiner', name:'Audio Joiner', cat:'audio', icon:'layers', live:true,
    blurb:'Combine several tracks into one seamless file.',
    accept:'audio/*', kind:'audio', multiple:true },
  { slug:'change-volume', name:'Change Volume', cat:'audio', icon:'volume', live:true,
    blurb:'Boost quiet recordings or tame loud ones with a dB slider.',
    accept:'audio/*', kind:'audio' },
  { slug:'change-speed', name:'Change Speed', cat:'audio', icon:'speed', live:true,
    blurb:'Speed up or slow down audio without the chipmunk effect.',
    accept:'audio/*', kind:'audio' },
  { slug:'change-pitch', name:'Change Pitch', cat:'audio', icon:'tune', live:true,
    blurb:'Shift a track up or down in semitones, keeping its length.',
    accept:'audio/*', kind:'audio' },
  { slug:'equalizer', name:'Equalizer', cat:'audio', icon:'sliders', live:true,
    blurb:'Sculpt bass, mids and treble with a 3-band EQ.',
    accept:'audio/*', kind:'audio' },
  { slug:'reverse-audio', name:'Reverse Audio', cat:'audio', icon:'reverse', live:true,
    blurb:'Play a track backwards — perfect for risers and reveals.',
    accept:'audio/*', kind:'audio' },
  { slug:'voice-recorder', name:'Voice Recorder', cat:'audio', icon:'mic', live:true,
    blurb:'Record from your microphone and export MP3 or WAV.',
    accept:'', kind:'recorder',
    steps:[['Allow the mic','Accept the browser permission — audio stays in the tab.'],
           ['Record','A live waveform shows your level.'],
           ['Download','Stop and choose MP3 or WAV.']] },
  { slug:'audio-converter', name:'Audio Converter', cat:'audio', icon:'swap', live:true,
    blurb:'Convert between MP3, WAV and OGG with a bitrate of your choice.',
    accept:'audio/*', kind:'audio' },
  { slug:'text-to-speech', name:'Text to Speech', cat:'audio', icon:'chat', live:false,
    blurb:'Read any text aloud with natural voices.', accept:'', kind:'audio' },

  /* ---------------- PDF ---------------- */
  { slug:'pdf-merge', name:'Merge PDF', cat:'pdf', icon:'layers', live:true,
    blurb:'Combine PDFs in the order you want — drag to rearrange.',
    accept:'application/pdf', kind:'pdf', multiple:true },
  { slug:'pdf-split', name:'Split PDF', cat:'pdf', icon:'split', live:true,
    blurb:'Pull out page ranges into separate documents.',
    accept:'application/pdf', kind:'pdf' },
  { slug:'pdf-rotate', name:'Rotate PDF', cat:'pdf', icon:'rotate', live:true,
    blurb:'Turn pages by 90°, 180° or 270° and save.',
    accept:'application/pdf', kind:'pdf' },
  { slug:'pdf-delete-pages', name:'Delete Pages', cat:'pdf', icon:'trash', live:true,
    blurb:'Remove the pages you do not need.',
    accept:'application/pdf', kind:'pdf' },
  { slug:'pdf-page-numbers', name:'Add Page Numbers', cat:'pdf', icon:'hash', live:true,
    blurb:'Stamp clean page numbers in any corner.',
    accept:'application/pdf', kind:'pdf' },
  { slug:'pdf-compress', name:'Compress PDF', cat:'pdf', icon:'archive', live:true,
    blurb:'Shrink heavy PDFs by re-rendering pages at a lower quality.',
    accept:'application/pdf', kind:'pdf' },
  { slug:'pdf-to-jpg', name:'PDF to JPG', cat:'pdf', icon:'image', live:true,
    blurb:'Turn every page into a high-quality JPG.',
    accept:'application/pdf', kind:'pdf' },
  { slug:'pdf-to-png', name:'PDF to PNG', cat:'pdf', icon:'image', live:true,
    blurb:'Export pages as lossless PNG images.',
    accept:'application/pdf', kind:'pdf' },
  { slug:'pdf-to-text', name:'PDF to Text', cat:'pdf', icon:'text', live:true,
    blurb:'Extract all selectable text from a PDF.',
    accept:'application/pdf', kind:'pdf' },
  { slug:'jpg-to-pdf', name:'JPG to PDF', cat:'pdf', icon:'pdf', live:true,
    blurb:'Bundle JPG or PNG images into a single PDF.',
    accept:'image/*', kind:'image', multiple:true },
  { slug:'pdf-protect', name:'Protect PDF', cat:'pdf', icon:'lock', live:false,
    blurb:'Add a password to your document.', accept:'application/pdf', kind:'pdf' },
  { slug:'pdf-unlock', name:'Unlock PDF', cat:'pdf', icon:'unlock', live:false,
    blurb:'Remove a password you already know.', accept:'application/pdf', kind:'pdf' },
  { slug:'word-to-pdf', name:'Word to PDF', cat:'pdf', icon:'text', live:false,
    blurb:'Convert DOCX documents to PDF.', accept:'.docx', kind:'pdf' },
  { slug:'pdf-to-word', name:'PDF to Word', cat:'pdf', icon:'text', live:false,
    blurb:'Turn a PDF back into an editable document.', accept:'application/pdf', kind:'pdf' },

  /* ---------------- IMAGE ---------------- */
  { slug:'image-converter', name:'Image Converter', cat:'image', icon:'swap', live:true,
    blurb:'Convert between JPG, PNG and WebP in a click.',
    accept:'image/*', kind:'image' },
  { slug:'image-resize', name:'Resize Image', cat:'image', icon:'expand', live:true,
    blurb:'Set exact pixels or a percentage, keeping the aspect ratio.',
    accept:'image/*', kind:'image' },
  { slug:'image-compress', name:'Compress Image', cat:'image', icon:'archive', live:true,
    blurb:'Drop the weight of a photo with a quality slider.',
    accept:'image/*', kind:'image' },
  { slug:'image-rotate', name:'Rotate Image', cat:'image', icon:'rotate', live:true,
    blurb:'Rotate and flip photos losslessly.',
    accept:'image/*', kind:'image' },
  { slug:'image-watermark', name:'Image Watermark', cat:'image', icon:'stamp', live:true,
    blurb:'Stamp your name or logo text onto a picture.',
    accept:'image/*', kind:'image' },
  { slug:'image-crop', name:'Crop Image', cat:'image', icon:'crop', live:false,
    blurb:'Trim photos to the perfect frame.', accept:'image/*', kind:'image' },

  /* ---------------- CONVERTERS ---------------- */
  { slug:'audio-converter-2', name:'Audio Converter', cat:'convert', icon:'swap', live:true,
    blurb:'MP3, WAV and OGG — pick any direction.', accept:'audio/*', kind:'audio' },
  { slug:'document-converter', name:'Document Converter', cat:'convert', icon:'text', live:false,
    blurb:'Between DOC, ODT, RTF and TXT.', accept:'', kind:'pdf' },
  { slug:'font-converter', name:'Font Converter', cat:'convert', icon:'text', live:false,
    blurb:'TTF, OTF and WOFF conversions.', accept:'', kind:'image' },
  { slug:'archive-converter', name:'Archive Converter', cat:'convert', icon:'archive', live:false,
    blurb:'Repackage ZIP, TAR and 7Z archives.', accept:'', kind:'image' },
  { slug:'ebook-converter', name:'Ebook Converter', cat:'convert', icon:'book', live:false,
    blurb:'EPUB, MOBI and PDF conversions.', accept:'', kind:'pdf' },
  { slug:'archive-extractor', name:'Archive Extractor', cat:'convert', icon:'archive', live:false,
    blurb:'Open any archive and grab the files.', accept:'', kind:'image' }
];

/* alias so both "audio-converter" entries resolve */
const SWA_ALIASES = { 'audio-converter-2': 'audio-converter' };

const SWA_TOOL_MAP = Object.fromEntries(SWA_TOOLS.map(t => [t.slug, t]));

function swaGetTool(slug) {
  if (SWA_TOOL_MAP[slug]) return SWA_TOOL_MAP[slug];
  const alias = SWA_ALIASES[slug];
  if (alias && SWA_TOOL_MAP[alias]) return SWA_TOOL_MAP[alias];
  return null;
}

function swaToolUrl(tool) {
  return tool.live ? `tool.html?t=${encodeURIComponent(tool.slug)}` : '#';
}

function swaLiveCount() { return SWA_TOOLS.filter(t => t.live).length; }
