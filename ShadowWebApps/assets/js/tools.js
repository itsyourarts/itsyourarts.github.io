/* ShadowWebApps — tool implementations (all client-side) */
(function(){
  'use strict';
  const SWA = window.SWA, K = SWA.kit, I = n => swaIcon(n);
  const T = SWA.tools = {};

  /* =======================================================================
     AUDIO — shared player/waveform widget
     ======================================================================= */
  function audioWidget(ctx, {title='Preview', withWave=true} = {}){
    const card = document.createElement('div');
    card.className = 'panel';
    card.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim)">${SWA.esc(title)}</div>
        <div class="mono" style="color:var(--dim)">local · nothing uploaded</div>
      </div>
      <audio controls style="width:100%"></audio>
      ${withWave ? `<canvas class="wave" style="margin-top:12px"></canvas>` : ''}`;
    ctx.main.appendChild(card);
    const audio = card.querySelector('audio');
    const canvas = card.querySelector('canvas');
    return {
      card, audio, canvas,
      load(file){
        audio.src = SWA.objectURL(file);
        return audio;
      },
      setBuffer(buf){
        if (canvas) SWA.drawWave(canvas, buf);
      }
    };
  }
  T._audioWidget = audioWidget;

  function audioOut(ctx, label, desc){
    const ws = K.workspace(ctx, { accept:'audio/*', fmts:['MP3','WAV','OGG','M4A','FLAC'], icon:'wave', label: label || 'Drop an audio file' });
    return ws;
  }

  /* ---- TRIM AUDIO ---- */
  T['trim-audio'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'audio/*', icon:'wave', label:'Drop an audio file to trim'});
    const fmt = K.select({label:'Output format', options:[{v:'mp3',t:'MP3 (smaller)'},{v:'wav',t:'WAV (lossless)'}], value:'mp3'});
    const bitrate = K.select({label:'MP3 bitrate', options:[{v:'128',t:'128 kbps'},{v:'192',t:'192 kbps — recommended'},{v:'256',t:'256 kbps'},{v:'320',t:'320 kbps'}], value:'192'});
    ws.option(fmt); ws.option(bitrate);

    const tl = document.createElement('div');
    tl.className = 'timeline';
    tl.innerHTML = `
      <canvas class="wave"></canvas>
      <div class="wavetip"><span>drag the handles on the waveform to select</span><span class="dur"></span></div>
      <div class="row">
        <label class="field" style="margin:0"><span>Start</span><input type="text" class="t-start" value="0:00.0"></label>
        <label class="field" style="margin:0"><span>End</span><input type="text" class="t-end" value="0:00.0"></label>
      </div>
      <div class="timevals"><span class="t-sel">selection 0.0s</span><span class="t-warn"></span></div>`;
    ctx.main.appendChild(tl);
    const canvas = tl.querySelector('canvas');
    const sIn = tl.querySelector('.t-start'), eIn = tl.querySelector('.t-end');
    let buffer = null, start = 0, end = 0, drag = null;

    function parseTime(str, fallback){
      const m = String(str).trim().match(/^(\d+):(\d+(?:\.\d+)?)$/) || String(str).trim().match(/^(\d+(?:\.\d+)?)$/);
      if (!m) return fallback;
      return m.length === 3 ? (+m[1])*60 + (+m[2]) : (+m[1]);
    }
    function sync(from){
      if (!buffer) return;
      start = SWA.clamp(start, 0, end - 0.05);
      end = SWA.clamp(end, start + 0.05, buffer.duration);
      sIn.value = SWA.clock(start); eIn.value = SWA.clock(end);
      tl.querySelector('.t-sel').textContent = `selection ${(end-start).toFixed(2)}s`;
      SWA.drawWave(canvas, buffer, {selStart:start/buffer.duration, selEnd:end/buffer.duration});
    }
    ws.onFiles(async files => {
      buffer = await SWA.decodeAudio(files[0]);
      start = 0; end = buffer.duration;
      tl.querySelector('.dur').textContent = 'length ' + SWA.clock(buffer.duration);
      sync();
    });
    sIn.onchange = () => { start = parseTime(sIn.value, start); sync(); };
    eIn.onchange = () => { end = parseTime(eIn.value, end); sync(); };

    function pos(e){
      const r = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      return SWA.clamp(x / r.width, 0, 1) * (buffer ? buffer.duration : 0);
    }
    canvas.addEventListener('pointerdown', e => {
      if (!buffer) return;
      const t = pos(e);
      drag = Math.abs(t-start) < Math.abs(t-end) ? 's' : 'e';
      if (Math.abs(t-start) < 0.001) drag = 's';
      if (drag === 's') start = t; else end = t;
      sync(); canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (!drag || !buffer) return;
      const t = pos(e);
      if (drag === 's') start = Math.min(t, end-0.05); else end = Math.max(t, start+0.05);
      sync();
    });
    canvas.addEventListener('pointerup', () => drag = null);
    canvas.addEventListener('pointercancel', () => drag = null);

    ws.setRun('Trim audio', async (files, tick) => {
      tick(15, 'Decoding…');
      const buf = buffer || await SWA.decodeAudio(files[0]);
      tick(45, 'Cutting…');
      const cut = SWA.sliceAudio(buf, start, end);
      tick(70, 'Encoding ' + fmt.value().toUpperCase() + '…');
      await SWA.sleep(30);
      const blob = SWA.encodeAudio(cut, fmt.value(), +bitrate.value());
      const name = `${SWA.safeName(SWA.stem(files[0]))}-trimmed.${fmt.value()}`;
      tick(100, 'Done');
      return {title:`Trimmed ${(end-start).toFixed(2)} seconds`, desc:'The cut was made and encoded on your device.', files:[{blob, name}]};
    });
  };

  /* ---- AUDIO JOINER ---- */
  T['audio-joiner'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'audio/*', multiple:true, icon:'layers', label:'Drop two or more audio files', fmts:['MP3','WAV','OGG','M4A']});
    const fmt = K.select({label:'Output format', options:[{v:'mp3',t:'MP3'},{v:'wav',t:'WAV'}], value:'mp3'});
    const gap = K.range({label:'Gap between tracks', min:0, max:5, step:0.1, value:0, unit:'s'});
    ws.option(fmt); ws.option(gap);
    ws.option(K.note('Files are joined in the order shown above. Remove a row to change the order.'));
    ws.setRun('Join audio', async (files, tick) => {
      if (files.length < 2) throw new Error('Add at least two audio files.');
      const bufs = [];
      for (let i=0;i<files.length;i++){
        tick(10 + (i/files.length)*60, `Decoding ${files[i].name}…`);
        bufs.push(await SWA.decodeAudio(files[i]));
      }
      tick(75, 'Joining…');
      const sr = bufs[0].sampleRate, ch = Math.max(...bufs.map(b => b.numberOfChannels));
      const gapLen = Math.round(gap.value() * sr);
      const total = bufs.reduce((a,b) => a + b.length + gapLen, 0);
      const ac = SWA.audioCtx();
      const out = ac.createBuffer(ch, total, sr);
      let off = 0;
      bufs.forEach((b, i) => {
        for (let c=0;c<ch;c++) out.getChannelData(c).set(b.getChannelData(Math.min(c, b.numberOfChannels-1)), off);
        off += b.length + gapLen;
      });
      tick(88, 'Encoding…');
      const blob = SWA.encodeAudio(out, fmt.value(), 192);
      return {title:`Joined ${files.length} tracks`, desc:`Total length ${SWA.clock(out.duration)}.`,
        files:[{blob, name:`joined-audio.${fmt.value()}`}]};
    });
  };

  /* ---- CHANGE VOLUME ---- */
  T['change-volume'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'audio/*', icon:'volume', label:'Drop an audio file'});
    const db = K.range({label:'Volume change', min:-30, max:20, step:1, value:6, unit:' dB', hint:'+ boosts, − quietens. 0 dB keeps the original level.'});
    const fmt = K.select({label:'Output format', options:[{v:'mp3',t:'MP3'},{v:'wav',t:'WAV'}], value:'mp3'});
    ws.option(db); ws.option(fmt);
    ws.setRun('Apply volume', async (files, tick) => {
      tick(15, 'Decoding…');
      const buf = await SWA.decodeAudio(files[0]);
      tick(50, 'Applying gain…');
      const out = SWA.applyGain(buf, Math.pow(10, db.value()/20));
      tick(80, 'Encoding…');
      const blob = SWA.encodeAudio(out, fmt.value(), 192);
      return {title:`Volume ${db.value() >= 0 ? '+' : ''}${db.value()} dB applied`, desc:'Peaks were clamped to avoid clipping.', files:[{blob, name:`${SWA.stem(files[0])}-volume.${fmt.value()}`}]};
    });
  };

  /* ---- CHANGE SPEED (audio) ---- */
  T['change-speed'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'audio/*', icon:'speed', label:'Drop an audio file'});
    const sp = K.range({label:'Speed', min:0.5, max:2, step:0.05, value:1.25, unit:'×', hint:'Pitch is preserved using a WSOLA time-stretch.'});
    const fmt = K.select({label:'Output format', options:[{v:'mp3',t:'MP3'},{v:'wav',t:'WAV'}], value:'mp3'});
    ws.option(sp); ws.option(fmt);
    ws.setRun('Change speed', async (files, tick) => {
      tick(12, 'Decoding…');
      const buf = await SWA.decodeAudio(files[0]);
      tick(40, 'Time-stretching (this takes a moment)…');
      await SWA.sleep(40);
      const out = SWA.changeSpeedAudio(buf, sp.value());
      tick(85, 'Encoding…');
      const blob = SWA.encodeAudio(out, fmt.value(), 192);
      return {title:`Speed set to ${sp.value()}×`, desc:`New length ${SWA.clock(out.duration)}. Pitch unchanged.`, files:[{blob, name:`${SWA.stem(files[0])}-${sp.value()}x.${fmt.value()}`}]};
    });
  };

  /* ---- CHANGE PITCH ---- */
  T['change-pitch'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'audio/*', icon:'tune', label:'Drop an audio file'});
    const semi = K.range({label:'Pitch shift', min:-12, max:12, step:1, value:3, unit:' semitones'});
    const fmt = K.select({label:'Output format', options:[{v:'mp3',t:'MP3'},{v:'wav',t:'WAV'}], value:'mp3'});
    ws.option(semi); ws.option(fmt);
    ws.setRun('Shift pitch', async (files, tick) => {
      tick(12, 'Decoding…');
      const buf = await SWA.decodeAudio(files[0]);
      tick(40, 'Shifting pitch…');
      await SWA.sleep(40);
      const out = SWA.pitchShift(buf, semi.value());
      tick(85, 'Encoding…');
      const blob = SWA.encodeAudio(out, fmt.value(), 192);
      return {title:`Pitch shifted ${semi.value() > 0 ? '+' : ''}${semi.value()} semitones`, desc:'Length kept the same as the original.', files:[{blob, name:`${SWA.stem(files[0])}-pitch${semi.value()}.${fmt.value()}`}]};
    });
  };

  /* ---- EQUALIZER ---- */
  T['equalizer'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'audio/*', icon:'sliders', label:'Drop an audio file'});
    const low = K.range({label:'Bass (200 Hz)', min:-15, max:15, step:1, value:0, unit:' dB'});
    const mid = K.range({label:'Mids (1.2 kHz)', min:-15, max:15, step:1, value:0, unit:' dB'});
    const high = K.range({label:'Treble (4 kHz)', min:-15, max:15, step:1, value:0, unit:' dB'});
    const fmt = K.select({label:'Output format', options:[{v:'mp3',t:'MP3'},{v:'wav',t:'WAV'}], value:'mp3'});
    ws.option(low); ws.option(mid); ws.option(high); ws.option(fmt);
    ws.setRun('Apply EQ', async (files, tick) => {
      tick(15, 'Decoding…');
      const buf = await SWA.decodeAudio(files[0]);
      tick(50, 'Filtering…');
      const out = await SWA.eqAudio(buf, {low:low.value(), mid:mid.value(), high:high.value()});
      tick(82, 'Encoding…');
      const blob = SWA.encodeAudio(out, fmt.value(), 192);
      return {title:'Equalizer applied', desc:`Bass ${low.value()} dB · Mids ${mid.value()} dB · Treble ${high.value()} dB`,
        files:[{blob, name:`${SWA.stem(files[0])}-eq.${fmt.value()}`}]};
    });
  };

  /* ---- REVERSE AUDIO ---- */
  T['reverse-audio'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'audio/*', icon:'reverse', label:'Drop an audio file to reverse'});
    const fmt = K.select({label:'Output format', options:[{v:'mp3',t:'MP3'},{v:'wav',t:'WAV'}], value:'mp3'});
    ws.option(fmt);
    ws.setRun('Reverse audio', async (files, tick) => {
      tick(15, 'Decoding…');
      const buf = await SWA.decodeAudio(files[0]);
      tick(55, 'Reversing…');
      const out = SWA.reverseAudio(buf);
      tick(80, 'Encoding…');
      const blob = SWA.encodeAudio(out, fmt.value(), 192);
      return {title:'Audio reversed', desc:'Your track now plays backwards.', files:[{blob, name:`${SWA.stem(files[0])}-reversed.${fmt.value()}`}]};
    });
  };

  /* ---- AUDIO CONVERTER ---- */
  T['audio-converter'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'audio/*,video/*', icon:'swap', label:'Drop an audio (or video) file to convert', fmts:['MP3','WAV','M4A','OGG','FLAC']});
    const fmt = K.select({label:'Convert to', options:[{v:'mp3',t:'MP3 — universal'},{v:'wav',t:'WAV — lossless PCM'}], value:'mp3'});
    const br = K.select({label:'Quality', options:[{v:'128',t:'128 kbps — small'},{v:'192',t:'192 kbps — balanced'},{v:'256',t:'256 kbps — high'},{v:'320',t:'320 kbps — max'}], value:'192'});
    ws.option(fmt); ws.option(br);
    ws.option(K.note('Video files work too — the audio track is extracted and re-encoded.'));
    ws.setRun('Convert audio', async (files, tick) => {
      tick(12, 'Decoding…');
      const buf = await SWA.decodeAudio(files[0]);
      tick(70, `Encoding ${fmt.value().toUpperCase()}…`);
      await SWA.sleep(20);
      const blob = SWA.encodeAudio(buf, fmt.value(), +br.value());
      tick(100);
      return {title:`Converted to ${fmt.value().toUpperCase()}`, desc:`${SWA.clock(buf.duration)} of audio, ${SWA.bytes(blob.size)}.`,
        files:[{blob, name:`${SWA.stem(files[0])}.${fmt.value()}`}]};
    });
  };

  /* =======================================================================
     RECORDERS
     ======================================================================= */
  T._recorder = function(ctx, kind){
    const isVideo = kind === 'video';
    const card = document.createElement('div');
    card.className = 'panel';
    card.innerHTML = `
      <div class="playerbox" style="margin:0 0 16px;min-height:210px;display:grid;place-items:center;position:relative">
        <div class="rec-ph" style="display:grid;place-items:center;gap:12px;padding:46px 20px;color:var(--dim);font-size:13px;text-align:center">
          <span style="width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:var(--grad-soft);border:1px solid rgba(139,92,246,.3)">
            <span style="display:block;width:26px;height:26px;color:var(--violet)">${I(isVideo ? 'camera' : 'mic')}</span>
          </span>
          <span>${isVideo ? 'Live preview appears here once you start recording' : 'Microphone idle — press start to see the waveform'}</span>
        </div>
        ${isVideo ? '<video autoplay muted playsinline style="display:none;width:100%;max-height:380px"></video>' : ''}
      </div>
      <div class="row" style="align-items:end">
        <label class="field" style="margin:0"><span>${isVideo ? 'Source' : 'Microphone'}</span>
          <select class="src">
            ${isVideo ? `<option value="screen">Entire screen</option><option value="window">A window</option><option value="tab">A browser tab</option><option value="cam">Webcam</option>` : `<option value="mic">Default microphone</option>`}
          </select></label>
        <div style="flex:0 0 auto;display:flex;gap:9px">
          <button class="btn rec">${I('camera')} Start recording</button>
          <button class="btn ghost stop" disabled>${I('pause')} Stop</button>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px;font-family:var(--mono);font-size:13px;color:var(--muted)">
        <span class="dot-ind" style="display:none"><span class="rec-dot"></span></span>
        <span class="timer">00:00</span>
        <span class="state" style="color:var(--dim)"></span>
      </div>
      <div class="out-host" style="margin-top:16px"></div>`;
    ctx.main.appendChild(card);

    const video = card.querySelector('video');
    const viz = card.querySelector('#recViz');
    const srcSel = card.querySelector('.src');
    const recBtn = card.querySelector('.rec'), stopBtn = card.querySelector('.stop');
    const timerEl = card.querySelector('.timer'), stateEl = card.querySelector('.state');
    const dot = card.querySelector('.dot-ind'), outHost = card.querySelector('.out-host');

    let recorder = null, chunks = [], stream = null, t0 = 0, int = null, analyser = null, raf = null, audioCtx = null;

    function tickTimer(){
      const s = (Date.now() - t0)/1000;
      timerEl.textContent = `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
    }

    async function getStream(){
      const want = srcSel.value;
      if (!isVideo){
        return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true}, video:false});
      }
      const withAudio = !!(await new Promise(r => {
        r(true); // always attempt to include audio; browsers simply omit it when unavailable
      }));
      if (want === 'cam') return navigator.mediaDevices.getUserMedia({video:{width:1280,height:720}, audio:true});
      const base = {video:true, audio:withAudio};
      if (want === 'screen') return navigator.mediaDevices.getDisplayMedia({video:{frameRate:30}, audio:true});
      return navigator.mediaDevices.getDisplayMedia({video:{frameRate:30}, audio:true});
    }

    recBtn.onclick = async () => {
      try {
        stateEl.textContent = 'requesting permission…';
        stream = await getStream();
        const ph = card.querySelector('.rec-ph'); if (ph) ph.style.display = 'none';
        if (video && isVideo){ video.style.display = 'block'; video.srcObject = stream; video.muted = true; video.play().catch(()=>{}); }
        if (!isVideo){
          audioCtx = SWA.audioCtx();
          const src = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser(); analyser.fftSize = 512;
          src.connect(analyser);
          const phA = card.querySelector('.rec-ph');
          if (phA) phA.style.display = 'none';
          const cvs = document.createElement('canvas');
          cvs.className = 'wave';
          cvs.style.cssText = 'height:190px;width:100%;border:0;border-radius:0';
          card.querySelector('.playerbox').appendChild(cvs);
          const buf = new Uint8Array(analyser.frequencyBinCount);
          const draw = () => {
            analyser.getByteTimeDomainData(buf);
            const ctx2 = cvs.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            cvs.width = cvs.clientWidth*dpr; cvs.height = cvs.clientHeight*dpr;
            ctx2.scale(dpr,dpr);
            const w = cvs.clientWidth, h = cvs.clientHeight;
            ctx2.clearRect(0,0,w,h);
            ctx2.strokeStyle = 'rgba(34,211,238,.9)'; ctx2.lineWidth = 2; ctx2.beginPath();
            for (let i=0;i<buf.length;i++){
              const x = i/buf.length*w, y = h/2 + ((buf[i]-128)/128)*(h/2)*0.9;
              i ? ctx2.lineTo(x,y) : ctx2.moveTo(x,y);
            }
            ctx2.stroke();
            raf = requestAnimationFrame(draw);
          };
          draw();
        }
        const mime = isVideo
          ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm')
          : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm');

        chunks = [];
        recorder = new MediaRecorder(stream, {mimeType:mime, videoBitsPerSecond: isVideo ? 3_500_000 : undefined});
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        recorder.onstop = async () => {
          clearInterval(int); cancelAnimationFrame(raf);
          dot.style.display = 'none';
          stateEl.textContent = 'encoding…';
          const type = isVideo ? 'video/webm' : 'audio/webm';
          const raw = new Blob(chunks, {type});
          stream.getTracks().forEach(t => t.stop());
          if (isVideo){
            showVideoResult(raw);
          } else {
            /* transcode to mp3 + wav locally */
            try {
              const arr = await raw.arrayBuffer();
              const buf = await SWA.audioCtx().decodeAudioData(arr);
              const wav = SWA.encodeWAV(buf);
              stateEl.textContent = 'ready';
              showAudioResult(buf, raw, wav);
            } catch(e){
              stateEl.textContent = 'ready (raw webm)';
              outHost.innerHTML = `<div class="result"><h4>${I('check')} Recording saved</h4>
                <p>Could not decode for MP3 (${SWA.esc(e.message)}), but the original is ready.</p>
                <button class="btn small dl-raw">${I('download')} Download .webm</button></div>`;
              outHost.querySelector('.dl-raw').onclick = () => SWA.download(raw, 'recording.webm');
            }
          }
          recBtn.disabled = false; stopBtn.disabled = true; recBtn.innerHTML = `${I('camera')} Start recording`;
        };
        recorder.start(200);
        t0 = Date.now(); int = setInterval(tickTimer, 200);
        timerEl.textContent = '00:00'; dot.style.display = 'inline-flex';
        recBtn.disabled = true; stopBtn.disabled = false; stateEl.textContent = 'recording';
        if (isVideo) stream.getVideoTracks()[0].addEventListener('ended', () => recorder.state !== 'inactive' && recorder.stop());
      } catch(err){
        stateEl.textContent = '';
        outHost.innerHTML = `<div class="err"><b>Could not start recording.</b><br>${SWA.esc(err.message || err)}<br>
          <span style="color:var(--dim)">Screen/webcam capture needs permission, HTTPS (or localhost) and a desktop browser.</span></div>`;
      }
    };

    stopBtn.onclick = () => { if (recorder && recorder.state !== 'inactive'){ recorder.stop(); stateEl.textContent = 'finishing…'; } };

    function showVideoResult(blob){
      const url = SWA.objectURL(blob);
      outHost.innerHTML = `<div class="result">
        <h4>${I('check')} Recording complete — ${SWA.bytes(blob.size)}</h4>
        <p>WebM · plays in every modern browser. Convert to MP4 with any of our video tools.</p>
        <div class="playerbox" style="margin-bottom:14px"><video src="${url}" controls></video></div>
        <button class="btn small dl">${I('download')} Download WebM</button></div>`;
      outHost.querySelector('.dl').onclick = () => SWA.download(blob, 'shadow-recording.webm');
    }

    function showAudioResult(buf, rawWebm, wav){
      const mp3 = (() => { try { return SWA.mp3Encoder(buf, 192); } catch(e){ return null; } })();
      const mp3url = mp3 ? SWA.objectURL(mp3) : '';
      outHost.innerHTML = `<div class="result">
        <h4>${I('check')} Recording ready — ${SWA.clock(buf.duration)}</h4>
        <p>Encoded on your device. Nothing was uploaded.</p>
        ${mp3 ? `<audio controls src="${mp3url}" style="width:100%;margin-bottom:12px"></audio>` : ''}
        <div style="display:flex;gap:9px;flex-wrap:wrap">
          ${mp3 ? `<button class="btn small d-mp3">${I('download')} Download MP3</button>` : ''}
          <button class="btn ghost small d-wav">${I('download')} Download WAV</button>
        </div></div>`;
      if (mp3) outHost.querySelector('.d-mp3').onclick = () => SWA.download(mp3, 'recording.mp3');
      outHost.querySelector('.d-wav').onclick = () => SWA.download(wav, 'recording.wav');
    }
  };

  T['voice-recorder'] = ctx => T._recorder(ctx, 'audio');
  T['screen-recorder'] = ctx => T._recorder(ctx, 'video');
  T['video-recorder'] = ctx => T._recorder(ctx, 'video');

  /* =======================================================================
     VIDEO — shared pipeline
     ======================================================================= */
  function videoTool(ctx, {label, fmts=['MP4','WEBM'], controls, run, extraSetup}){
    const ws = K.workspace(ctx, {accept:'video/*', icon:'video', label, fmts});
    const player = document.createElement('div');
    player.className = 'playerbox';
    player.innerHTML = `<video controls playsinline></video>`;
    player.style.display = 'none';
    const meta = document.createElement('div');
    meta.className = 'wavetip';
    ctx.main.appendChild(player); ctx.main.appendChild(meta);
    const video = player.querySelector('video');
    const state = {};

    ws.onFiles(async files => {
      state.file = files[0];
      state.url = SWA.objectURL(state.file);
      player.style.display = 'block';
      video.src = state.url;
      await new Promise(r => { video.onloadedmetadata = r; setTimeout(r, 3000); });
      meta.textContent = `${video.videoWidth}×${video.videoHeight} · ${SWA.clock(video.duration)} · ${SWA.bytes(state.file.size)}`;
      if (extraSetup) extraSetup(state, video, ws);
    });

    const ui = controls ? controls(ws, state) : {};

    ws.setRun(ui.label || 'Process video', async (files, tick) => {
      const f = files[0]; if (!f) throw new Error('Choose a video first.');
      const v = document.createElement('video');
      v.src = SWA.objectURL(f); v.muted = true; v.playsInline = true;
      await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error('Unsupported video')); setTimeout(res, 5000); });

      const rec = await run({file:f, video:v, opts: ui, tick, state});
      return rec;
    });
    return {ws, state, video, meta};
  }

  /* generic clean capture recorder on canvas/audio */
  function makeRecorder(stream, mime){
    const types = [mime, 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const type = types.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';
    return new MediaRecorder(stream, {mimeType:type, videoBitsPerSecond: 4_000_000});
  }

  function pickVideoMime(){
    const c = [
      ['mp4','video/mp4;codecs=avc1.42E01E,mp4a.40.2'],
      ['mp4','video/mp4'],
      ['webm','video/webm;codecs=vp9,opus'],
      ['webm','video/webm;codecs=vp8,opus'],
      ['webm','video/webm']
    ];
    for (const [ext,t] of c) if (MediaRecorder.isTypeSupported(t)) return {ext, type:t};
    return {ext:'webm', type:'video/webm'};
  }

  async function renderVideo({video, start=0, end, speed=1, rotate=0, muted=false, onProgress, fps=30, scale=1}){
    const srcW = video.videoWidth, srcH = video.videoHeight;
    const swap = rotate === 90 || rotate === 270;
    const outW = Math.round((swap ? srcH : srcW) * scale);
    const outH = Math.round((swap ? srcW : srcH) * scale);

    const canvas = document.createElement('canvas');
    canvas.width = outW; canvas.height = outH;
    const g = canvas.getContext('2d', {alpha:false});

    const capture = canvas.captureStream(fps);
    /* audio: route through WebAudio so we can mute/speed and still keep sound */
    let audioCtx = null, dest = null;
    if (!muted){
      try {
        audioCtx = new AudioContext();
        const src = audioCtx.createMediaElementSource(video);
        const gain = audioCtx.createGain();
        gain.gain.value = 1;
        dest = audioCtx.createMediaStreamDestination();
        src.connect(gain); gain.connect(dest);
        gain.connect(audioCtx.destination);   /* so you hear it while it records */
        dest.stream.getAudioTracks().forEach(t => capture.addTrack(t));
      } catch(e){ /* video without audio */ }
    }
    if (!capture.getAudioTracks().length){
      /* silent audio track keeps players happy */
    }

    const rec = makeRecorder(capture, 'video/webm');
    const chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);

    video.currentTime = start;
    video.playbackRate = speed;
    video.muted = true;   /* element muted; audio flows through WebAudio */

    await new Promise(r => { video.onseeked = r; setTimeout(r, 1200); });
    rec.start(250);
    await video.play().catch(()=>{});

    const dur = ((end ?? video.duration) - start) / speed;
    const t0 = performance.now();

    await new Promise(resolve => {
      function frame(){
        const elapsed = (performance.now() - t0)/1000;
        if (onProgress) onProgress(Math.min(0.99, elapsed/dur));
        if (video.ended || video.currentTime >= (end ?? video.duration) - 0.02 || elapsed > dur + 3){
          return resolve();
        }
        g.save();
        g.translate(outW/2, outH/2);
        g.rotate(rotate * Math.PI/180);
        const dw = (swap ? outH : outW), dh = (swap ? outW : outH);
        g.drawImage(video, -dw/2, -dh/2, dw, dh);
        g.restore();
        requestAnimationFrame(frame);
      }
      frame();
    });

    video.pause();
    await new Promise(r => setTimeout(r, 260));
    rec.stop();
    await new Promise(r => rec.onstop = r);
    if (audioCtx) audioCtx.close();

    const mime = rec.mimeType || 'video/webm';
    const ext = mime.includes('mp4') ? 'mp4' : 'webm';
    return {blob:new Blob(chunks, {type:mime}), ext};
  }

  /* ---- TRIM VIDEO ---- */
  T['trim-video'] = function(ctx){
    const st = {};
    videoTool(ctx, {
      label:'Drop a video to trim',
      controls(ws, state){
        const tl = document.createElement('div');
        tl.className = 'timeline';
        tl.innerHTML = `
          <div class="row">
            <label class="field" style="margin:0"><span>Start (s)</span><input type="number" class="a" min="0" step="0.1" value="0"></label>
            <label class="field" style="margin:0"><span>End (s)</span><input type="number" class="b" min="0" step="0.1" value="0"></label>
          </div>
          <div class="wavetip"><span>Use the player above to check your cut points.</span><span class="len"></span></div>
          <label class="field" style="margin:0"><span>Quality</span>
            <select class="q"><option value="1">Original resolution</option><option value="0.75">75% (smaller file)</option><option value="0.5">50% (much smaller)</option></select></label>`;
        ctx.main.appendChild(tl);
        const a = tl.querySelector('.a'), b = tl.querySelector('.b'), q = tl.querySelector('.q'), len = tl.querySelector('.len');
        const upd = () => {
          const d = (state.duration || 0);
          if (!d) return;
          if (!state._init){ a.value = 0; b.value = d.toFixed(1); state._init = true; }
          len.textContent = `selection ${Math.max(0, (+b.value)-(+a.value)).toFixed(1)}s of ${d.toFixed(1)}s`;
        };
        state._upd = upd;
        return {label:'Trim video', a, b, q};
      },
      extraSetup(state, video){
        state.duration = video.duration;
        if (state._upd) state._upd();
        setTimeout(() => state._upd && state._upd(), 60);
      },
      async run({file, video, opts, tick}){
        const start = Math.max(0, +opts.a.value || 0);
        let end = +opts.b.value || video.duration;
        if (end <= start) end = Math.min(video.duration, start + 1);
        const scale = +opts.q.value;
        tick(5, 'Preparing…');
        const {blob, ext} = await renderVideo({
          video, start, end, scale,
          onProgress: p => tick(6 + p*88, 'Rendering ' + SWA.clock((end-start)*p) + ' of ' + SWA.clock(end-start) + '…')
        });
        tick(98);
        return {title:'Video trimmed', desc:`${(end-start).toFixed(1)}s clip · ${SWA.bytes(blob.size)}`,
          files:[{blob, name:`${SWA.safeName(SWA.stem(file))}-trimmed.${ext}`}]};
      }
    });
  };

  /* ---- VIDEO TO MP3 ---- */
  T['video-to-mp3'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'video/*,audio/*', icon:'music', label:'Drop a video to extract audio'});
    const br = K.select({label:'MP3 quality', options:[{v:'128',t:'128 kbps'},{v:'192',t:'192 kbps — recommended'},{v:'320',t:'320 kbps'}], value:'192'});
    ws.option(br);
    const player = document.createElement('div');
    player.className = 'playerbox';
    player.innerHTML = '<video controls playsinline></video>';
    player.style.display = 'none';
    ctx.main.appendChild(player);
    const video = player.querySelector('video');
    ws.onFiles(f => { player.style.display = 'block'; video.src = SWA.objectURL(f[0]); });
    ws.setRun('Extract MP3', async (files, tick) => {
      tick(10, 'Decoding audio track…');
      const buf = await SWA.decodeAudio(files[0]);
      tick(65, 'Encoding MP3…');
      await SWA.sleep(30);
      const blob = SWA.mp3Encoder(buf, +br.value());
      tick(100);
      return {title:'Audio extracted', desc:`${SWA.clock(buf.duration)} · ${SWA.bytes(blob.size)} MP3`,
        files:[{blob, name:`${SWA.stem(files[0])}.mp3`}]};
    });
  };

  /* ---- MUTE VIDEO ---- */
  T['mute-video'] = function(ctx){
    videoTool(ctx, {
      label:'Drop a video to remove its sound',
      fmts:['MP4','WEBM','MOV'],
      controls(){ return {label:'Mute video'}; },
      extraSetup(state, video){ state.duration = video.duration; },
      async run({file, video, tick}){
        tick(5, 'Preparing…');
        const {blob, ext} = await renderVideo({
          video, muted:true,
          onProgress: p => tick(6 + p*90, 'Re-rendering ' + Math.round(p*100) + '%')
        });
        return {title:'Audio removed', desc:'The picture was re-encoded without an audio track.',
          files:[{blob, name:`${SWA.stem(file)}-muted.${ext}`}]};
      }
    });
  };

  /* ---- CHANGE VIDEO SPEED ---- */
  T['change-video-speed'] = function(ctx){
    videoTool(ctx, {
      label:'Drop a video to speed up or slow down',
      controls(ws){
        const sp = K.range({label:'Playback speed', min:0.25, max:4, step:0.25, value:1.5, unit:'×', hint:'Time-lapse above 1×, slow motion below.'});
        ws.option(sp);
        return {label:'Change speed', speed:sp};
      },
      async run({file, video, opts, tick}){
        tick(5, 'Preparing…');
        const sp = opts.speed.value();
        const {blob, ext} = await renderVideo({
          video, speed:sp,
          onProgress: p => tick(6 + p*90, `${sp}× — ${Math.round(p*100)}%`)
        });
        return {title:`Speed changed to ${sp}×`, desc:`New length ${SWA.clock(video.duration/sp)}.`,
          files:[{blob, name:`${SWA.stem(file)}-${sp}x.${ext}`}]};
      }
    });
  };

  /* ---- ROTATE VIDEO ---- */
  T['rotate-video'] = function(ctx){
    videoTool(ctx, {
      label:'Drop a video to rotate',
      controls(ws){
        const r = K.select({label:'Rotation', options:[{v:'90',t:'90° clockwise'},{v:'180',t:'180°'},{v:'270',t:'90° counter-clockwise'},{v:'0',t:'No rotation (re-encode)'}], value:'90'});
        ws.option(r);
        return {label:'Rotate video', rot:r};
      },
      async run({file, video, opts, tick}){
        const deg = +opts.rot.value();
        tick(5, 'Preparing…');
        const {blob, ext} = await renderVideo({
          video, rotate:deg,
          onProgress: p => tick(6 + p*90, 'Rotating ' + Math.round(p*100) + '%')
        });
        return {title:`Rotated ${deg}°`, desc:'Frame size adjusted automatically.',
          files:[{blob, name:`${SWA.stem(file)}-rot${deg}.${ext}`}]};
      }
    });
  };

  /* =======================================================================
     PDF
     ======================================================================= */
  async function pdfLib(){ await K.loadScript('assets/js/vendor/pdf-lib.min.js'); return window.PDFLib; }
  let pdfjsReady = null;
  async function pdfjs(){
    if (!pdfjsReady){
      pdfjsReady = (async () => {
        await K.loadScript('assets/js/vendor/pdf.min.js');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/vendor/pdf.worker.min.js';
        return window.pdfjsLib;
      })();
    }
    return pdfjsReady;
  }
  async function pdfPageCount(bytes){
    const L = await pdfLib();
    const doc = await L.PDFDocument.load(bytes, {ignoreEncryption:true});
    return doc.getPageCount();
  }
  async function renderPdfThumbs(bytes, pages, target, scale=0.5){
    const lib = await pdfjs();
    const doc = await lib.getDocument({data:new Uint8Array(bytes.slice(0))}).promise;
    pages = pages || Array.from({length:doc.numPages}, (_,i) => i+1);
    const out = [];
    for (const p of pages){
      const page = await doc.getPage(p);
      const vp = page.getViewport({scale:1});
      const s = Math.min(1.4, 420 / Math.max(vp.width, vp.height));
      const v = page.getViewport({scale:s});
      const c = document.createElement('canvas');
      c.width = Math.round(v.width); c.height = Math.round(v.height);
      await page.render({canvasContext:c.getContext('2d'), viewport:v}).promise;
      out.push({page:p, canvas:c});
    }
    return out;
  }
  T._pdf = {pdfLib, pdfjs, pdfPageCount, renderPdfThumbs};

  /* ---- MERGE PDF ---- */
  T['pdf-merge'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'application/pdf', multiple:true, icon:'layers', label:'Drop PDFs in the order you want', fmts:['PDF']});
    ws.option(K.note('Files merge top-to-bottom in the list above. Remove and re-add to change the order.'));
    const pagesInfo = document.createElement('div');
    ctx.main.appendChild(pagesInfo);
    ws.setRun('Merge PDFs', async (files, tick) => {
      if (files.length < 2) throw new Error('Add at least two PDF files.');
      const L = await pdfLib();
      const out = await L.PDFDocument.create();
      for (let i=0;i<files.length;i++){
        tick(10 + (i/files.length)*70, `Adding ${files[i].name}…`);
        const bytes = await SWA.readBuffer(files[i]);
        const src = await L.PDFDocument.load(bytes, {ignoreEncryption:true});
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach(p => out.addPage(p));
      }
      tick(92, 'Saving…');
      const bytes = await out.save();
      const blob = new Blob([bytes], {type:'application/pdf'});
      return {title:`Merged ${files.length} documents`, desc:`${out.getPageCount()} pages · ${SWA.bytes(blob.size)}`,
        files:[{blob, name:'merged.pdf'}]};
    });
  };

  /* ---- SPLIT PDF ---- */
  T['pdf-split'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'application/pdf', icon:'split', label:'Drop a PDF to split'});
    let pageCount = 0;
    const mode = K.select({label:'Split mode', options:[
      {v:'range', t:'Extract a page range into one file'},
      {v:'each', t:'Every page as its own PDF'},
      {v:'chunks', t:'Every N pages'}
    ], value:'range'});
    const range = K.field({label:'Page range', value:'1-3', placeholder:'e.g. 1-3, 5'});
    const chunkSize = K.field({label:'Pages per file', value:'2', type:'number'});
    ws.option(mode); ws.option(range); ws.option(chunkSize);
    const info = K.note('Nothing selected yet.');
    ws.option(info);
    ws.onFiles(async files => {
      try {
        pageCount = await pdfPageCount(await SWA.readBuffer(files[0]));
        info.querySelector('div').innerHTML = `<b>${pageCount} pages</b> detected in ${SWA.esc(files[0].name)}.`;
        range.set && range.el && (range.el.value = `1-${pageCount}`);
      } catch(e){ info.querySelector('div').textContent = 'Could not read this PDF: ' + e.message; }
    });
    ws.setRun('Split PDF', async (files, tick) => {
      const L = await pdfLib();
      const bytes = await SWA.readBuffer(files[0]);
      const src = await L.PDFDocument.load(bytes, {ignoreEncryption:true});
      const n = src.getPageCount();
      const base = SWA.stem(files[0]);
      const outs = [];
      tick(20, 'Reading pages…');

      async function grab(idx){
        const doc = await L.PDFDocument.create();
        const pages = await doc.copyPages(src, idx);
        pages.forEach(p => doc.addPage(p));
        const bytes2 = await doc.save();
        return new Blob([bytes2], {type:'application/pdf'});
      }
      function parseRange(str, max){
        const idx = [];
        str.split(',').forEach(part => {
          part = part.trim(); if (!part) return;
          const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
          if (m){ for (let i=+m[1]; i<=+m[2]; i++) if (i>=1 && i<=max) idx.push(i-1); }
          else if (/^\d+$/.test(part)) { const i = +part; if (i>=1 && i<=max) idx.push(i-1); }
        });
        return idx.length ? idx : Array.from({length:max}, (_,i)=>i);
      }

      if (mode.value() === 'range'){
        const idx = parseRange(range.value(), n);
        tick(60, 'Extracting…');
        outs.push({blob: await grab(idx), name:`${base}-pages-${range.value().replace(/\s/g,'')}.pdf`});
      } else if (mode.value() === 'each'){
        for (let i=0;i<n;i++){
          tick(20 + (i/n)*70, `Page ${i+1} of ${n}…`);
          outs.push({blob: await grab([i]), name:`${base}-page-${i+1}.pdf`});
        }
      } else {
        const size = Math.max(1, +chunkSize.value() || 2);
        for (let i=0, part=1; i<n; i+=size, part++){
          const idx = Array.from({length:Math.min(size, n-i)}, (_,k) => i+k);
          tick(20 + (i/n)*70, `Part ${part}…`);
          outs.push({blob: await grab(idx), name:`${base}-part-${part}.pdf`, note:`pages ${i+1}-${i+idx.length}`});
        }
      }
      tick(100);
      return {title:`${outs.length} file${outs.length>1?'s':''} created`, desc:'Each result is a standalone PDF.', files:outs};
    });
  };

  /* ---- ROTATE PDF ---- */
  T['pdf-rotate'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'application/pdf', icon:'rotate', label:'Drop a PDF to rotate'});
    const deg = K.select({label:'Rotation', options:[{v:'90',t:'90° clockwise'},{v:'180',t:'180°'},{v:'270',t:'270°'}], value:'90'});
    const scope = K.select({label:'Apply to', options:[{v:'all',t:'All pages'},{v:'first',t:'First page only'},{v:'last',t:'Last page only'}], value:'all'});
    ws.option(deg); ws.option(scope);
    ws.setRun('Rotate PDF', async (files, tick) => {
      const L = await pdfLib();
      tick(20, 'Opening…');
      const doc = await L.PDFDocument.load(await SWA.readBuffer(files[0]), {ignoreEncryption:true});
      const pages = doc.getPages();
      const add = +deg.value().replace('-','');
      pages.forEach((p, i) => {
        const apply = scope.value() === 'all' || (scope.value()==='first' && i===0) || (scope.value()==='last' && i===pages.length-1);
        if (!apply) return;
        const cur = p.getRotation().angle || 0;
        p.setRotation(L.degrees((cur + add) % 360));
      });
      tick(80, 'Saving…');
      const blob = new Blob([await doc.save()], {type:'application/pdf'});
      return {title:`Rotated ${pages.length} page${pages.length>1?'s':''}`, desc:`${add}° applied.`, files:[{blob, name:`${SWA.stem(files[0])}-rotated.pdf`}]};
    });
  };

  /* ---- DELETE PAGES ---- */
  T['pdf-delete-pages'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'application/pdf', icon:'trash', label:'Drop a PDF to delete pages from'});
    let n = 0;
    const inp = K.field({label:'Pages to delete', value:'', placeholder:'e.g. 2, 5-7'});
    ws.option(inp);
    const thumbHost = document.createElement('div');
    thumbHost.className = 'pdfpages';
    ctx.main.appendChild(thumbHost);
    const sel = new Set();
    ws.onFiles(async files => {
      thumbHost.innerHTML = '<div style="color:var(--dim);font-size:13px">Rendering pages…</div>';
      try {
        const bytes = await SWA.readBuffer(files[0]);
        const thumbs = await renderPdfThumbs(bytes);
        n = thumbs.length;
        thumbHost.innerHTML = '';
        thumbs.forEach(({page, canvas}) => {
          const d = document.createElement('div');
          d.className = 'pg';
          d.dataset.p = page;
          canvas.style.width = '100%'; canvas.style.display = 'block';
          d.appendChild(canvas);
          const s = document.createElement('span'); s.textContent = page; d.appendChild(s);
          d.onclick = () => {
            if (sel.has(page)){ sel.delete(page); d.classList.remove('sel'); }
            else { sel.add(page); d.classList.add('sel'); }
            inp.el.value = [...sel].sort((a,b)=>a-b).join(', ');
          };
          thumbHost.appendChild(d);
        });
      } catch(e){ thumbHost.innerHTML = `<div class="err">${SWA.esc(e.message)}</div>`; }
    });
    ws.setRun('Delete pages', async (files, tick) => {
      const L = await pdfLib();
      const bytes = await SWA.readBuffer(files[0]);
      const src = await L.PDFDocument.load(bytes, {ignoreEncryption:true});
      const total = src.getPageCount();
      const del = new Set();
      String(inp.value()).split(',').forEach(part => {
        part = part.trim(); if (!part) return;
        const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (m){ for (let i=+m[1]; i<=+m[2]; i++) del.add(i); }
        else if (/^\d+$/.test(part)) del.add(+part);
      });
      if (!del.size) throw new Error('Type which pages to delete, or tap page thumbnails to select them.');
      const keep = [];
      for (let i=1;i<=total;i++) if (!del.has(i)) keep.push(i-1);
      if (!keep.length) throw new Error('You would delete every page — keep at least one.');
      tick(50, 'Rebuilding…');
      const out = await L.PDFDocument.create();
      (await out.copyPages(src, keep)).forEach(p => out.addPage(p));
      const blob = new Blob([await out.save()], {type:'application/pdf'});
      return {title:`${total - keep.length} page(s) removed`, desc:`${keep.length} pages left.`, files:[{blob, name:`${SWA.stem(files[0])}-edited.pdf`}]};
    });
  };

  /* ---- PAGE NUMBERS ---- */
  T['pdf-page-numbers'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'application/pdf', icon:'hash', label:'Drop a PDF to number'});
    const pos = K.select({label:'Position', options:[
      {v:'bc',t:'Bottom centre'},{v:'br',t:'Bottom right'},{v:'bl',t:'Bottom left'},
      {v:'tr',t:'Top right'},{v:'tl',t:'Top left'}
    ], value:'bc'});
    const startAt = K.field({label:'Start numbering at', value:'1', type:'number'});
    const fmtTxt = K.field({label:'Format', value:'{n} / {total}', hint:'Use {n} for the page number and {total} for the page count.'});
    const size = K.range({label:'Font size', min:6, max:24, step:1, value:10, unit:' pt'});
    ws.option(pos); ws.option(startAt); ws.option(fmtTxt); ws.option(size);
    ws.setRun('Add page numbers', async (files, tick) => {
      const L = await pdfLib();
      const doc = await L.PDFDocument.load(await SWA.readBuffer(files[0]), {ignoreEncryption:true});
      const font = await doc.embedFont(L.StandardFonts.Helvetica);
      const pages = doc.getPages();
      const start = +startAt.value() || 1;
      tick(50, 'Stamping…');
      pages.forEach((p, i) => {
        const {width, height} = p.getSize();
        const text = fmtTxt.value().replace('{n}', start+i).replace('{total}', pages.length);
        const fs = size.value();
        const tw = font.widthOfTextAtSize(text, fs);
        const margin = 26;
        let x = margin, y = margin - 2;
        if (pos.value() === 'bc') x = (width - tw)/2;
        if (pos.value() === 'br') x = width - tw - margin;
        if (pos.value() === 'bl') x = margin;
        if (pos.value() === 'tr'){ x = width - tw - margin; y = height - fs - margin; }
        if (pos.value() === 'tl'){ x = margin; y = height - fs - margin; }
        if (pos.value() === 'bc' || pos.value() === 'br' || pos.value() === 'bl') y = margin - 2;
        p.drawText(text, {x, y, size:fs, font, color:L.rgb(0.25,0.25,0.3)});
      });
      const blob = new Blob([await doc.save()], {type:'application/pdf'});
      return {title:'Page numbers added', desc:`${pages.length} pages numbered.`, files:[{blob, name:`${SWA.stem(files[0])}-numbered.pdf`}]};
    });
  };

  /* ---- COMPRESS PDF ---- */
  T['pdf-compress'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'application/pdf', icon:'archive', label:'Drop a PDF to compress'});
    const q = K.range({label:'Image quality', min:30, max:90, step:5, value:60, unit:'%', hint:'Lower = smaller file. Text stays sharp because pages are re-rasterised at this quality.'});
    const dpi = K.select({label:'Resolution', options:[{v:'1',t:'72 dpi — smallest'},{v:'1.5',t:'110 dpi'},{v:'2',t:'144 dpi — balanced'}], value:'1.5'});
    ws.option(q); ws.option(dpi);
    ws.option(K.note('Pages are re-drawn as JPEG images inside a new PDF. Great for scans; for text-only PDFs the size may not change much.'));
    ws.setRun('Compress PDF', async (files, tick) => {
      const L = await pdfLib();
      const bytes = await SWA.readBuffer(files[0]);
      const rendered = await renderPdfThumbs(bytes, null, null, 1);
      const scale = +dpi.value();
      const lib = await pdfjs();
      const doc2 = await lib.getDocument({data:new Uint8Array(bytes.slice(0))}).promise;
      const out = await L.PDFDocument.create();
      for (let i=1;i<=doc2.numPages;i++){
        tick(10 + (i/doc2.numPages)*78, `Compressing page ${i} of ${doc2.numPages}…`);
        const page = await doc2.getPage(i);
        const v0 = page.getViewport({scale:1});
        const v = page.getViewport({scale:scale});
        const c = document.createElement('canvas');
        c.width = Math.round(v.width); c.height = Math.round(v.height);
        await page.render({canvasContext:c.getContext('2d'), viewport:v}).promise;
        const jpg = await SWA.canvasBlob(c, 'image/jpeg', q.value()/100);
        const img = await out.embedJpg(await jpg.arrayBuffer());
        const p = out.addPage([v0.width, v0.height]);
        p.drawImage(img, {x:0, y:0, width:v0.width, height:v0.height});
      }
      tick(95, 'Saving…');
      const blob = new Blob([await out.save()], {type:'application/pdf'});
      const saved = ((1 - blob.size/files[0].size) * 100);
      return {title:`Compressed to ${SWA.bytes(blob.size)}`,
        desc: saved > 0 ? `That is ${saved.toFixed(0)}% smaller than the original ${SWA.bytes(files[0].size)}.`
                        : `This PDF was already tiny — the output is ${SWA.bytes(blob.size)}.`,
        files:[{blob, name:`${SWA.stem(files[0])}-compressed.pdf`}]};
    });
  };

  /* ---- PDF -> JPG / PNG ---- */
  function pdfToImage(ctx, type){
    const ws = K.workspace(ctx, {accept:'application/pdf', icon:'image', label:`Drop a PDF to convert to ${type.toUpperCase()}`});
    const scale = K.select({label:'Quality', options:[{v:'1',t:'72 dpi — web'},{v:'2',t:'144 dpi — good'},{v:'3',t:'216 dpi — print'}], value:'2'});
    ws.option(scale);
    const strip = document.createElement('div');
    strip.className = 'thumbstrip';
    ctx.main.appendChild(strip);
    ws.setRun(`Convert to ${type.toUpperCase()}`, async (files, tick) => {
      const bytes = await SWA.readBuffer(files[0]);
      const rendered = await renderPdfThumbs(bytes, null, null, +scale.value());
      const outs = [];
      for (let i=0;i<rendered.length;i++){
        tick(20 + (i/rendered.length)*70, `Page ${i+1} of ${rendered.length}…`);
        const blob = await SWA.canvasBlob(rendered[i].canvas, type === 'png' ? 'image/png' : 'image/jpeg', 0.92);
        outs.push({blob, name:`${SWA.stem(files[0])}-page-${rendered[i].page}.${type}`, note:`${rendered[i].canvas.width}×${rendered[i].canvas.height}`});
      }
      strip.innerHTML = rendered.slice(0,12).map(r => `<img src="${r.canvas.toDataURL('image/jpeg',0.6)}" alt="page ${r.page}">`).join('');
      tick(100);
      return {title:`${outs.length} image${outs.length>1?'s':''} exported`, desc:'Saved locally, no queue.', files:outs};
    });
  }
  T['pdf-to-jpg'] = ctx => pdfToImage(ctx, 'jpg');
  T['pdf-to-png'] = ctx => pdfToImage(ctx, 'png');

  /* ---- PDF -> TEXT ---- */
  T['pdf-to-text'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'application/pdf', icon:'text', label:'Drop a PDF to extract text'});
    const out = document.createElement('div');
    ctx.main.appendChild(out);
    ws.setRun('Extract text', async (files, tick) => {
      const lib = await pdfjs();
      const bytes = await SWA.readBuffer(files[0]);
      const doc = await lib.getDocument({data:new Uint8Array(bytes.slice(0))}).promise;
      let text = '';
      for (let i=1;i<=doc.numPages;i++){
        tick(10 + (i/doc.numPages)*80, `Reading page ${i} of ${doc.numPages}…`);
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it => it.str).join(' ').replace(/\s+/g, ' ') + '\n\n';
      }
      out.innerHTML = `<label class="field"><span>Extracted text (${text.trim().split(/\s+/).filter(Boolean).length} words)</span>
        <textarea class="textout" rows="12"></textarea></label>`;
      out.querySelector('textarea').value = text.trim();
      const blob = new Blob([text.trim()], {type:'text/plain'});
      tick(100);
      return {title:'Text extracted', desc:'Copy it above or download the .txt file.', files:[{blob, name:`${SWA.stem(files[0])}.txt`}]};
    });
  };

  /* ---- IMAGES -> PDF ---- */
  T['jpg-to-pdf'] = function(ctx){
    const ws = K.workspace(ctx, {accept:'image/*', multiple:true, icon:'pdf', label:'Drop images to build a PDF', fmts:['JPG','PNG','WEBP']});
    const size = K.select({label:'Page size', options:[{v:'fit',t:'Fit each image on its own page'},{v:'a4',t:'A4 portrait'},{v:'letter',t:'US Letter'}], value:'fit'});
    const margin = K.range({label:'Margin', min:0, max:60, step:4, value:0, unit:' pt'});
    ws.option(size); ws.option(margin);
    ws.setRun('Create PDF', async (files, tick) => {
      if (!files.length) throw new Error('Add at least one image.');
      const L = await pdfLib();
      const doc = await L.PDFDocument.create();
      for (let i=0;i<files.length;i++){
        tick(10 + (i/files.length)*80, `Adding ${files[i].name}…`);
        const buf = await SWA.readBuffer(files[i]);
        let img;
        try { img = files[i].type === 'image/png' ? await doc.embedPng(buf) : await doc.embedJpg(buf); }
        catch(e){
          /* re-encode via canvas (webp/gif/etc) */
          const im = await SWA.loadImg(SWA.objectURL(files[i]));
          const c = document.createElement('canvas');
          c.width = im.width; c.height = im.height;
          c.getContext('2d').drawImage(im, 0, 0);
          img = await doc.embedJpg(await (await SWA.canvasBlob(c, 'image/jpeg', 0.94)).arrayBuffer());
        }
        const m = margin.value();
        if (size.value() === 'fit'){
          const p = doc.addPage([img.width + m*2, img.height + m*2]);
          p.drawImage(img, {x:m, y:m, width:img.width, height:img.height});
        } else {
          const [pw, ph] = size.value() === 'a4' ? [595.28, 841.89] : [612, 792];
          const p = doc.addPage([pw, ph]);
          const availW = pw - m*2, availH = ph - m*2;
          const s = Math.min(availW/img.width, availH/img.height);
          const w = img.width*s, h = img.height*s;
          p.drawImage(img, {x:(pw-w)/2, y:(ph-h)/2, width:w, height:h});
        }
      }
      tick(95, 'Saving…');
      const blob = new Blob([await doc.save()], {type:'application/pdf'});
      return {title:`PDF with ${files.length} page${files.length>1?'s':''}`, desc:SWA.bytes(blob.size), files:[{blob, name:'images.pdf'}]};
    });
  };

  /* =======================================================================
     IMAGE
     ======================================================================= */
  function imageWorkspace(ctx, {label, fmts=['JPG','PNG','WEBP']}){
    const ws = K.workspace(ctx, {accept:'image/*', multiple:true, icon:'image', label, fmts});
    return ws;
  }
  async function decodeToCanvas(file){
    const im = await SWA.loadImg(SWA.objectURL(file));
    const c = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    c.getContext('2d').drawImage(im, 0, 0);
    return {canvas:c, img:im};
  }

  /* ---- IMAGE CONVERTER ---- */
  T['image-converter'] = function(ctx){
    const ws = imageWorkspace(ctx, {label:'Drop images to convert'});
    const fmt = K.select({label:'Convert to', options:[{v:'jpeg',t:'JPG — photos'},{v:'png',t:'PNG — transparency'},{v:'webp',t:'WebP — modern & small'}], value:'png'});
    const q = K.range({label:'Quality', min:40, max:100, step:5, value:90, unit:'%'});
    ws.option(fmt); ws.option(q);
    ws.setRun('Convert images', async (files, tick) => {
      const outs = [];
      for (let i=0;i<files.length;i++){
        tick(10 + (i/files.length)*80, `Converting ${files[i].name}…`);
        const {canvas} = await decodeToCanvas(files[i]);
        if (fmt.value() === 'jpeg'){
          const flat = document.createElement('canvas');
          flat.width = canvas.width; flat.height = canvas.height;
          const g = flat.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0,0,flat.width,flat.height);
          g.drawImage(canvas, 0, 0);
          outs.push({blob: await SWA.canvasBlob(flat, 'image/jpeg', q.value()/100), name:`${SWA.stem(files[i])}.jpg`});
        } else {
          outs.push({blob: await SWA.canvasBlob(canvas, `image/${fmt.value()}`, q.value()/100), name:`${SWA.stem(files[i])}.${fmt.value()==='jpeg'?'jpg':fmt.value()}`});
        }
      }
      tick(100);
      return {title:`${outs.length} image${outs.length>1?'s':''} converted`, desc:`Output: ${fmt.value().toUpperCase()}`, files:outs};
    });
  };

  /* ---- RESIZE IMAGE ---- */
  T['image-resize'] = function(ctx){
    const ws = imageWorkspace(ctx, {label:'Drop images to resize'});
    const pct = K.range({label:'Scale', min:5, max:100, step:5, value:50, unit:'%'});
    const w = K.field({label:'Or set exact width (px)', value:'', type:'number', hint:'Leave empty to use the percentage above. Height follows the aspect ratio.'});
    const fmt = K.select({label:'Format', options:[{v:'keep',t:'Keep original'},{v:'jpeg',t:'JPG'},{v:'png',t:'PNG'},{v:'webp',t:'WebP'}], value:'keep'});
    ws.option(pct); ws.option(w); ws.option(fmt);
    ws.setRun('Resize images', async (files, tick) => {
      const outs = [];
      for (let i=0;i<files.length;i++){
        tick(10 + (i/files.length)*80, `Resizing ${files[i].name}…`);
        const {canvas} = await decodeToCanvas(files[i]);
        const targetW = +w.value() > 0 ? +w.value() : Math.round(canvas.width * pct.value()/100);
        const targetH = Math.round(targetW * canvas.height / canvas.width);
        const c2 = document.createElement('canvas');
        c2.width = targetW; c2.height = targetH;
        const g2 = c2.getContext('2d');
        g2.imageSmoothingQuality = 'high';
        g2.drawImage(canvas, 0, 0, targetW, targetH);
        let type = fmt.value() === 'keep' ? (files[i].type || 'image/png') : 'image/' + fmt.value();
        if (type === 'image/jpg') type = 'image/jpeg';
        let ext = fmt.value() === 'keep' ? (SWA.ext(files[i]) || 'png') : fmt.value().replace('jpeg','jpg');
        if (!['image/jpeg','image/png','image/webp'].includes(type)){ type = 'image/png'; ext = 'png'; }
        outs.push({blob: await SWA.canvasBlob(c2, type, 0.92), name:`${SWA.stem(files[i])}-${targetW}x${targetH}.${ext}`, note:`${targetW}×${targetH}`});
      }
      tick(100);
      return {title:`${outs.length} image${outs.length>1?'s':''} resized`, desc:'Aspect ratio preserved.', files:outs};
    });
  };

  /* ---- COMPRESS IMAGE ---- */
  T['image-compress'] = function(ctx){
    const ws = imageWorkspace(ctx, {label:'Drop images to compress'});
    const q = K.range({label:'Quality', min:20, max:95, step:5, value:65, unit:'%'});
    const maxW = K.field({label:'Max width (optional)', value:'', type:'number', hint:'Leave blank to keep the original size.'});
    ws.option(q); ws.option(maxW);
    ws.setRun('Compress images', async (files, tick) => {
      const outs = [];
      for (let i=0;i<files.length;i++){
        tick(10 + (i/files.length)*80, `Compressing ${files[i].name}…`);
        const {canvas} = await decodeToCanvas(files[i]);
        let c = canvas;
        if (+maxW.value() > 0 && canvas.width > +maxW.value()){
          const r = +maxW.value()/canvas.width;
          c = document.createElement('canvas');
          c.width = +maxW.value(); c.height = Math.round(canvas.height*r);
          c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
        }
        const blob = await SWA.canvasBlob(c, 'image/jpeg', q.value()/100);
        const saved = Math.max(0, (1 - blob.size/files[i].size) * 100);
        outs.push({blob, name:`${SWA.stem(files[i])}-compressed.jpg`, note:`${saved.toFixed(0)}% smaller`});
      }
      tick(100);
      return {title:'Images compressed', desc:'JPEG output at your chosen quality.', files:outs};
    });
  };

  /* ---- ROTATE / FLIP IMAGE ---- */
  T['image-rotate'] = function(ctx){
    const ws = imageWorkspace(ctx, {label:'Drop images to rotate'});
    const rot = K.select({label:'Rotation', options:[{v:'0',t:'None'},{v:'90',t:'90° clockwise'},{v:'180',t:'180°'},{v:'270',t:'90° counter-clockwise'}], value:'90'});
    const flip = K.select({label:'Flip', options:[{v:'none',t:'None'},{v:'h',t:'Horizontal'},{v:'v',t:'Vertical'},{v:'both',t:'Both'}], value:'none'});
    ws.option(rot); ws.option(flip);
    ws.setRun('Rotate images', async (files, tick) => {
      const outs = [];
      for (let i=0;i<files.length;i++){
        tick(10 + (i/files.length)*80, `Working on ${files[i].name}…`);
        const {canvas} = await decodeToCanvas(files[i]);
        const deg = +rot.value();
        const swap = deg === 90 || deg === 270;
        const c = document.createElement('canvas');
        c.width = swap ? canvas.height : canvas.width;
        c.height = swap ? canvas.width : canvas.height;
        const g = c.getContext('2d');
        g.translate(c.width/2, c.height/2);
        g.rotate(deg*Math.PI/180);
        if (flip.value() === 'h' || flip.value() === 'both') g.scale(-1,1);
        if (flip.value() === 'v' || flip.value() === 'both') g.scale(1,-1);
        g.drawImage(canvas, -canvas.width/2, -canvas.height/2);
        let type = files[i].type || 'image/png';
        if (!['image/jpeg','image/png','image/webp'].includes(type)) type = 'image/png';
        let ext = type.split('/')[1].replace('jpeg','jpg');
        outs.push({blob: await SWA.canvasBlob(c, type, 0.94), name:`${SWA.stem(files[i])}-rotated.${ext}`});
      }
      tick(100);
      return {title:'Images rotated', desc:'Done locally.', files:outs};
    });
  };

  /* ---- WATERMARK ---- */
  T['image-watermark'] = function(ctx){
    const ws = imageWorkspace(ctx, {label:'Drop images to watermark'});
    const txt = K.field({label:'Watermark text', value:'© ShadowWebApps'});
    const pos = K.select({label:'Position', options:[
      {v:'br',t:'Bottom right'},{v:'bc',t:'Bottom centre'},{v:'bl',t:'Bottom left'},
      {v:'c',t:'Centre'},{v:'tr',t:'Top right'},{v:'tl',t:'Top left'}
    ], value:'br'});
    const opacity = K.range({label:'Opacity', min:10, max:100, step:5, value:45, unit:'%'});
    const sc = K.range({label:'Size', min:2, max:14, step:1, value:5, unit:'%', hint:'Relative to image width'});
    ws.option(txt); ws.option(pos); ws.option(opacity); ws.option(sc);
    ws.setRun('Apply watermark', async (files, tick) => {
      const outs = [];
      for (let i=0;i<files.length;i++){
        tick(10 + (i/files.length)*80, `Watermarking ${files[i].name}…`);
        const {canvas} = await decodeToCanvas(files[i]);
        const g = canvas.getContext('2d');
        const fs = Math.max(10, canvas.width * (sc.value()/100));
        g.font = `700 ${fs}px Inter, Arial, sans-serif`;
        g.globalAlpha = opacity.value()/100;
        g.fillStyle = '#ffffff';
        g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = fs*0.18;
        const tw = g.measureText(txt.value()).width;
        const pad = fs*0.6;
        let x = canvas.width - tw - pad, y = canvas.height - pad;
        if (pos.value() === 'bc'){ x = (canvas.width-tw)/2; }
        if (pos.value() === 'bl'){ x = pad; }
        if (pos.value() === 'c'){ x = (canvas.width-tw)/2; y = canvas.height/2; }
        if (pos.value() === 'tr'){ x = canvas.width-tw-pad; y = fs + pad; }
        if (pos.value() === 'tl'){ x = pad; y = fs + pad; }
        g.fillText(txt.value(), x, y);
        g.globalAlpha = 1; g.shadowBlur = 0;
        let type = files[i].type || 'image/png';
        if (!['image/jpeg','image/png','image/webp'].includes(type)) type = 'image/png';
        outs.push({blob: await SWA.canvasBlob(canvas, type, 0.93), name:`${SWA.stem(files[i])}-watermarked.${type.split('/')[1].replace('jpeg','jpg')}`});
      }
      tick(100);
      return {title:'Watermark added', desc:'Tip: use a JPG or PNG output for the best compatibility.', files:outs};
    });
  };
})();
