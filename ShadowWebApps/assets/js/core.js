/* ShadowWebApps — core helpers (no dependencies) */
(function(){
  'use strict';

  const SWA = window.SWA = {};

  /* ---------- tiny DOM helpers ---------- */
  SWA.$ = (s, r=document) => r.querySelector(s);
  SWA.$$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  SWA.esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  SWA.bytes = function(n){
    if (!n && n !== 0) return '';
    const u = ['B','KB','MB','GB'];
    let i = 0; while (n >= 1024 && i < u.length-1){ n /= 1024; i++; }
    return (n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)) + ' ' + u[i];
  };
  SWA.clock = function(sec){
    if (!isFinite(sec)) sec = 0;
    sec = Math.max(0, sec);
    const m = Math.floor(sec/60), s = Math.floor(sec%60), cs = Math.floor((sec*10)%10);
    return `${m}:${String(s).padStart(2,'0')}.${cs}`;
  };
  SWA.stem = f => (typeof f === 'string' ? f : f.name || 'file').replace(/\.[^.]+$/, '');
  SWA.ext  = f => { const m = (typeof f === 'string' ? f : f.name || '').match(/\.([^.]+)$/); return m ? m[1].toLowerCase() : ''; };

  SWA.toast = function(msg, ms=2400){
    let t = document.getElementById('toast');
    if (!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
  };

  SWA.download = function(blob, name){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  /* ---------- file reading ---------- */
  SWA.readBuffer = file => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error); fr.readAsArrayBuffer(file);
  });
  SWA.readText = file => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error); fr.readAsText(file);
  });
  SWA.objectURL = file => URL.createObjectURL(file);
  SWA.loadImg = function(src){
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img); img.onerror = () => rej(new Error('Could not decode this image.'));
      img.src = src;
    });
  };
  SWA.loadMedia = function(src, tag='video'){
    return new Promise((res, rej) => {
      const m = document.createElement(tag);
      m.preload = 'auto'; m.src = src; m.crossOrigin = 'anonymous';
      const ok = () => res(m);
      m.onloadedmetadata = ok;
      m.onerror = () => rej(new Error('This file could not be decoded by your browser.'));
      setTimeout(() => { if (m.readyState >= 1) ok(); }, 4000);
    });
  };

  /* ---------- canvas -> blob ---------- */
  SWA.canvasBlob = function(canvas, type='image/png', quality){
    return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('Canvas export failed')), type, quality));
  };

  /* ---------- audio decode ---------- */
  SWA.audioCtx = function(){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error('WebAudio is not supported in this browser.');
    if (!SWA._ac || SWA._ac.state === 'closed') SWA._ac = new AC();
    if (SWA._ac.state === 'suspended') SWA._ac.resume();
    return SWA._ac;
  };
  SWA.decodeAudio = async function(file){
    const ac = SWA.audioCtx();
    const buf = await SWA.readBuffer(file);
    try { return await ac.decodeAudioData(buf.slice(0)); }
    catch(e){ throw new Error('Could not decode this audio file. Try MP3, WAV, OGG, M4A or FLAC.'); }
  };

  /* ---------- WAV encoder ---------- */
  SWA.encodeWAV = function(audioBuffer){
    const ch = audioBuffer.numberOfChannels, len = audioBuffer.length, sr = audioBuffer.sampleRate;
    const bytes = 44 + len * ch * 2;
    const ab = new ArrayBuffer(bytes), v = new DataView(ab);
    const w = (o, s) => { for (let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
    w(0,'RIFF'); v.setUint32(4, bytes-8, true); w(8,'WAVE'); w(12,'fmt ');
    v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,ch,true);
    v.setUint32(24,sr,true); v.setUint32(28,sr*ch*2,true); v.setUint16(32,ch*2,true);
    v.setUint16(34,16,true); w(36,'data'); v.setUint32(40, len*ch*2, true);
    const chans = []; for (let c=0;c<ch;c++) chans.push(audioBuffer.getChannelData(c));
    let off = 44;
    for (let i=0;i<len;i++) for (let c=0;c<ch;c++){
      let s = Math.max(-1, Math.min(1, chans[c][i]));
      v.setInt16(off, s < 0 ? s*0x8000 : s*0x7FFF, true); off += 2;
    }
    return new Blob([ab], {type:'audio/wav'});
  };

  /* ---------- MP3 encoder (lamejs, loaded on demand) ---------- */
  SWA.mp3Encoder = function(audioBuffer, kbps){
    const lame = window.lamejs;
    if (!lame) throw new Error('MP3 encoder not loaded');
    const ch = Math.min(2, audioBuffer.numberOfChannels);
    const enc = new lame.Mp3Encoder(ch, audioBuffer.sampleRate, kbps || 192);
    const L = audioBuffer.getChannelData(0);
    const R = ch > 1 ? audioBuffer.getChannelData(1) : L;
    const toInt = (f) => { const a = new Int16Array(f.length); for (let i=0;i<f.length;i++){ const s = Math.max(-1, Math.min(1, f[i])); a[i] = s < 0 ? s*0x8000 : s*0x7FFF; } return a; };
    const l = toInt(L), r = toInt(R);
    const block = 1152, chunks = [];
    for (let i=0;i<l.length;i+=block){
      const lb = l.subarray(i, i+block);
      const out = ch > 1 ? enc.encodeBuffer(lb, r.subarray(i, i+block)) : enc.encodeBuffer(lb);
      if (out.length) chunks.push(new Int8Array(out));
    }
    const end = enc.flush();
    if (end.length) chunks.push(new Int8Array(end));
    return new Blob(chunks, {type:'audio/mpeg'});
  };

  SWA.encodeAudio = function(audioBuffer, format, kbps){
    if (format === 'wav') return SWA.encodeWAV(audioBuffer);
    return SWA.mp3Encoder(audioBuffer, kbps);
  };

  /* ---------- resample by ratio (linear) ---------- */
  SWA.resample = function(buffer, ratio){
    const sr = buffer.sampleRate, ch = buffer.numberOfChannels;
    const outLen = Math.max(1, Math.floor(buffer.length / ratio));
    const out = SWA.audioCtx().createBuffer(ch, outLen, sr);
    for (let c=0;c<ch;c++){
      const src = buffer.getChannelData(c), dst = out.getChannelData(c);
      for (let i=0;i<outLen;i++){
        const p = i * ratio, i0 = Math.floor(p), frac = p - i0;
        const a = src[i0] || 0, b = src[Math.min(i0+1, src.length-1)] || 0;
        dst[i] = a + (b-a)*frac;
      }
    }
    return out;
  };

  /* ---------- WSOLA time-stretch (preserves pitch) ----------
     tempo > 1  -> shorter output, same pitch                       */
  SWA.timeStretch = function(buffer, tempo){
    tempo = Math.max(0.25, Math.min(4, tempo));
    const sr = buffer.sampleRate, ch = buffer.numberOfChannels;
    const win = 1024, hopA = 512, hopS = Math.max(128, Math.round(hopA / tempo));
    const search = 256;
    const outLen = Math.max(win, Math.floor(buffer.length / tempo) + win);
    const out = SWA.audioCtx().createBuffer(ch, outLen, sr);

    for (let c=0;c<ch;c++){
      const src = buffer.getChannelData(c), dst = out.getChannelData(c);
      const winArr = new Float32Array(win);
      for (let i=0;i<win;i++) winArr[i] = 0.5 - 0.5*Math.cos(2*Math.PI*i/(win-1));
      let inPos = 0, outPos = 0, prevEnd = null;
      while (outPos + win < outLen && inPos + win + search < src.length){
        let best = inPos, bestScore = -Infinity;
        if (prevEnd){
          for (let d=-search; d<=search; d+=8){
            const p = inPos + d;
            if (p < 0 || p + 256 > src.length) continue;
            let score = 0;
            for (let i=0;i<256;i+=4) score += src[p+i] * prevEnd[i];
            if (score > bestScore){ bestScore = score; best = p; }
          }
        }
        for (let i=0;i<win;i++){
          const o = outPos + i;
          if (o < outLen) dst[o] += src[best+i] * winArr[i];
        }
        prevEnd = new Float32Array(256);
        const endStart = best + hopA;
        for (let i=0;i<256;i++) prevEnd[i] = src[Math.min(endStart+i, src.length-1)] || 0;
        inPos = best + hopA; outPos += hopS;
      }
    }
    return out;
  };

  /* ---------- pitch shift (resample + stretch) ---------- */
  SWA.pitchShift = function(buffer, semitones){
    const r = Math.pow(2, semitones/12);
    if (Math.abs(r-1) < 0.001) return buffer;
    const resampled = SWA.resample(buffer, r);          // pitch*r, length/r
    const out = SWA.timeStretch(resampled, r);          // back to original length
    // trim/pad to original length
    const sr = buffer.sampleRate, ch = buffer.numberOfChannels;
    const fin = SWA.audioCtx().createBuffer(ch, buffer.length, sr);
    for (let c=0;c<ch;c++){
      const s = out.getChannelData(c), d = fin.getChannelData(c);
      for (let i=0;i<d.length;i++) d[i] = s[i] || 0;
    }
    return fin;
  };

  /* ---------- generic fade / gain ---------- */
  SWA.applyGain = function(buffer, gain){
    const out = SWA.audioCtx().createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let c=0;c<buffer.numberOfChannels;c++){
      const s = buffer.getChannelData(c), d = out.getChannelData(c);
      for (let i=0;i<s.length;i++){ const v = s[i]*gain; d[i] = v > 1 ? 1 : (v < -1 ? -1 : v); }
    }
    return out;
  };
  SWA.sliceAudio = function(buffer, start, end){
    const sr = buffer.sampleRate;
    const s = Math.max(0, Math.floor(start*sr));
    const e = Math.min(buffer.length, Math.floor(end*sr));
    const len = Math.max(1, e - s);
    const out = SWA.audioCtx().createBuffer(buffer.numberOfChannels, len, sr);
    for (let c=0;c<buffer.numberOfChannels;c++)
      out.getChannelData(c).set(buffer.getChannelData(c).subarray(s, s+len));
    return out;
  };
  SWA.concatAudio = function(buffers){
    const sr = buffers[0].sampleRate, ch = Math.max(...buffers.map(b => b.numberOfChannels));
    const total = buffers.reduce((a,b) => a + b.length, 0);
    const out = SWA.audioCtx().createBuffer(ch, total, sr);
    let off = 0;
    for (const b of buffers){
      for (let c=0;c<ch;c++){
        const src = b.getChannelData(Math.min(c, b.numberOfChannels-1));
        out.getChannelData(c).set(src, off);
      }
      off += b.length;
    }
    return out;
  };
  SWA.reverseAudio = function(buffer){
    const out = SWA.audioCtx().createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let c=0;c<buffer.numberOfChannels;c++){
      const s = buffer.getChannelData(c), d = out.getChannelData(c);
      for (let i=0;i<s.length;i++) d[i] = s[s.length-1-i];
    }
    return out;
  };
  /* 3-band EQ-ish shelf/cut approximation using biquads on OfflineAudioContext */
  SWA.eqAudio = async function(buffer, {low=0, mid=0, high=0}){
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const off = new OAC(Math.max(1, Math.min(2, buffer.numberOfChannels)), buffer.length, buffer.sampleRate);
    const src = off.createBufferSource(); src.buffer = buffer;
    const l = off.createBiquadFilter(); l.type='lowshelf'; l.frequency.value=200; l.gain.value=low;
    const m = off.createBiquadFilter(); m.type='peaking'; m.frequency.value=1200; m.Q.value=1; m.gain.value=mid;
    const h = off.createBiquadFilter(); h.type='highshelf'; h.frequency.value=4000; h.gain.value=high;
    src.connect(l); l.connect(m); m.connect(h); h.connect(off.destination);
    src.start();
    return await off.startRendering();
  };
  /* speed change keeping pitch == time stretch + resample back to new length */
  SWA.changeSpeedAudio = function(buffer, speed){
    speed = Math.max(0.25, Math.min(4, speed));
    // We want duration/speed with the same pitch.
    // Resample by 1/speed then time-compress by 1/speed...
    const stretched = SWA.timeStretch(buffer, 1/speed); // length * speed  (slower-lengthened)
    if (speed === 1) return buffer;
    // stretched already has original pitch and target-ish length
    return stretched;
  };

  /* ---------- waveform drawing ---------- */
  SWA.drawWave = function(canvas, buffer, opts={}){
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 600, h = canvas.clientHeight || 110;
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0,0,w,h);
    const amp = (buffer.getChannelData ? buffer.getChannelData(0) : buffer);
    const step = Math.max(1, Math.floor(amp.length / w));
    const mid = h/2;
    ctx.fillStyle = 'rgba(139,92,246,.75)';
    for (let x=0;x<w;x++){
      let min = 1, max = -1;
      for (let i=0;i<step;i++){
        const v = amp[x*step+i] || 0;
        if (v < min) min = v; if (v > max) max = v;
      }
      const y1 = mid - max*mid*0.92, y2 = mid - min*mid*0.92;
      ctx.fillRect(x, y1, 1, Math.max(1, y2-y1));
    }
    if (opts.selStart != null && opts.selEnd != null){
      const x1 = opts.selStart*w, x2 = opts.selEnd*w;
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.fillRect(0,0,x1,h); ctx.fillRect(x2,0,w-x2,h);
      ctx.fillStyle = 'rgba(34,211,238,.9)';
      ctx.fillRect(x1,0,2,h); ctx.fillRect(x2-2,0,2,h);
    }
  };
  SWA.peaksFromBuffer = function(buffer, n){
    const d = buffer.getChannelData(0), out = new Float32Array(n), step = d.length/n;
    for (let i=0;i<n;i++){
      let mx = 0;
      for (let j=Math.floor(i*step); j<Math.floor((i+1)*step); j++){ const v = Math.abs(d[j]||0); if (v>mx) mx=v; }
      out[i] = mx;
    }
    return out;
  };

  /* ---------- misc ---------- */
  SWA.sleep = ms => new Promise(r => setTimeout(r, ms));
  SWA.clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  SWA.safeName = n => n.replace(/[\\/:*?"<>|]+/g, '-');
})();
