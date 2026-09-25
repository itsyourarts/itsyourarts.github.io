'use client';

// Audio/Video calls — WebRTC peer-to-peer + free Google STUN server
// Signaling polling se hoti hai (calls.txt file), koi paid service nahi.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Avatar from './Avatar';
import { apiFetch } from '@/lib/session';

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const JSON_HEADERS = { 'Content-Type': 'application/json' };

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const CallManager = forwardRef(function CallManager(_, ref) {
  const [view, setView] = useState(null); // {mode: 'incoming'|'outgoing'|'active', call, peer, type}
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [notice, setNotice] = useState('');

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandRef = useRef([]);
  const callIdRef = useRef(null);
  const roleRef = useRef(null);
  const candIdxRef = useRef(0);
  const answerAppliedRef = useRef(false);
  const viewRef = useRef(null);
  viewRef.current = view;

  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localVideoRef = useRef(null);

  // media elements ko streams attach karo
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
    if (remoteAudioRef.current && remoteStream) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream, view]);
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [view, localStreamRef.current]);

  const cleanup = useCallback((msg) => {
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    try { localStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    localStreamRef.current = null;
    setRemoteStream(null);
    callIdRef.current = null;
    roleRef.current = null;
    candIdxRef.current = 0;
    answerAppliedRef.current = false;
    pendingCandRef.current = [];
    setMuted(false);
    setCamOff(false);
    setSeconds(0);
    setView(null);
    if (msg) {
      setNotice(msg);
      setTimeout(() => setNotice(''), 2600);
    }
  }, []);

  function sendCandidate(candidate) {
    if (!callIdRef.current) {
      pendingCandRef.current.push(candidate);
      return;
    }
    apiFetch('/api/calls', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ action: 'candidate', id: callIdRef.current, candidate }),
    }).catch(() => {});
  }

  async function makePC(type) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: type === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
    });
    localStreamRef.current = stream;
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.onicecandidate = (e) => {
      if (e.candidate) sendCandidate(e.candidate.toJSON ? e.candidate.toJSON() : e.candidate);
    };
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    return pc;
  }

  async function start(peer, type) {
    if (viewRef.current) return;
    roleRef.current = 'caller';
    setView({ mode: 'outgoing', peer, type, call: null });
    try {
      const pc = await makePC(type);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const r = await apiFetch('/api/calls', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ action: 'start', to: peer.id, type, offer: pc.localDescription }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return cleanup(d.error || 'Could not start the call');
      callIdRef.current = d.call.id;
      setView((v) => (v ? { ...v, call: d.call } : v));
      pendingCandRef.current.forEach(sendCandidate);
      pendingCandRef.current = [];
    } catch (e) {
      cleanup(
        e?.name === 'NotAllowedError' || e?.name === 'NotFoundError'
          ? 'Mic/camera permission denied'
          : 'Could not start the call'
      );
    }
  }

  async function accept() {
    const call = viewRef.current?.call;
    if (!call) return;
    roleRef.current = 'callee';
    try {
      const pc = await makePC(call.type);
      await pc.setRemoteDescription(call.offer);
      const ans = await pc.createAnswer();
      await pc.setLocalDescription(ans);
      const r = await apiFetch('/api/calls', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ action: 'answer', id: call.id, answer: pc.localDescription }),
      });
      if (!r.ok) return cleanup('Could not answer');
      callIdRef.current = call.id;
      setView((v) => (v ? { ...v, mode: 'active', type: call.type } : v));
      pendingCandRef.current.forEach(sendCandidate);
      pendingCandRef.current = [];
    } catch (e) {
      await apiFetch('/api/calls', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ action: 'end', id: call.id }),
      }).catch(() => {});
      cleanup(e?.name === 'NotAllowedError' ? 'Mic/camera permission denied' : 'Could not answer');
    }
  }

  async function reject() {
    const id = viewRef.current?.call?.id;
    if (id) {
      await apiFetch('/api/calls', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ action: 'reject', id }),
      }).catch(() => {});
    }
    cleanup('');
  }

  async function hangup(msg = 'Call ended') {
    const id = callIdRef.current || viewRef.current?.call?.id;
    if (id) {
      await apiFetch('/api/calls', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ action: 'end', id }),
      }).catch(() => {});
    }
    cleanup(msg);
  }

  // ---------- polling ----------
  useEffect(() => {
    let busy = false;
    const t = setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        const v = viewRef.current;

        // koi call UI nahi — incoming ringing dhundo
        if (!v) {
          const r = await apiFetch('/api/calls', { cache: 'no-store' });
          if (r.ok) {
            const d = await r.json();
            if (d.incoming) {
              setView({ mode: 'incoming', call: d.incoming, peer: d.incoming.fromUser, type: d.incoming.type });
            }
          }
          return;
        }

        const id = callIdRef.current || v.call?.id;
        if (!id) return; // outgoing abhi POST ho rahi hai

        const r = await apiFetch(`/api/calls?id=${id}`, { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        const call = d.call;

        if (call.state === 'ended') return cleanup('Call ended');
        if (call.state === 'rejected') return cleanup('Call declined');

        if (roleRef.current === 'caller' && call.state === 'ringing') {
          if (Date.now() - new Date(call.updatedAt).getTime() > 45000) {
            await apiFetch('/api/calls', {
              method: 'POST',
              headers: JSON_HEADERS,
              body: JSON.stringify({ action: 'end', id }),
            }).catch(() => {});
            return cleanup('No answer');
          }
        }

        if (
          roleRef.current === 'caller' &&
          call.state === 'active' &&
          call.answer &&
          !answerAppliedRef.current
        ) {
          answerAppliedRef.current = true;
          try {
            await pcRef.current?.setRemoteDescription(call.answer);
          } catch {}
          setView((vv) => (vv ? { ...vv, mode: 'active' } : vv));
        }

        // naye ICE candidates lo (caller: candTo, callee: candFrom)
        const list = roleRef.current === 'caller' ? call.candTo : call.candFrom;
        const fresh = (list || []).slice(candIdxRef.current);
        candIdxRef.current = (list || []).length;
        for (const c of fresh) {
          try {
            await pcRef.current?.addIceCandidate(c);
          } catch {}
        }
        setView((vv) => (vv ? { ...vv, call } : vv));
      } catch {
        // network hiccup — next poll pe theek
      } finally {
        busy = false;
      }
    }, 2000);
    return () => clearInterval(t);
  }, [cleanup]);

  // call timer
  useEffect(() => {
    if (view?.mode !== 'active') return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [view?.mode]);

  useImperativeHandle(ref, () => ({ start, busy: () => !!viewRef.current }));

  function toggleMute() {
    const s = localStreamRef.current;
    if (!s) return;
    s.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted(!muted);
  }

  function toggleCam() {
    const s = localStreamRef.current;
    if (!s) return;
    s.getVideoTracks().forEach((t) => (t.enabled = camOff));
    setCamOff(!camOff);
  }

  const peer = view?.peer;
  const isVideo = view?.type === 'video';

  return (
    <>
      {notice && <div className="call-notice glass">{notice}</div>}
      <audio ref={remoteAudioRef} autoPlay hidden />

      {view && (
        <div className="call-overlay">
          <div className="call-card glass">
            {view.mode !== 'active' || !isVideo ? (
              <>
                <div className="call-avatar-pulse">
                  <Avatar user={peer} size={86} />
                </div>
                <h2 style={{ margin: 0 }}>{peer?.displayName || 'Unknown'}</h2>
                <p className="call-status">
                  {view.mode === 'incoming' &&
                    `Incoming ${isVideo ? 'video' : 'audio'} call…`}
                  {view.mode === 'outgoing' &&
                    `Calling${isVideo ? ' (video)' : ''}…`}
                  {view.mode === 'active' && fmt(seconds)}
                </p>
              </>
            ) : (
              <>
                <div className="call-video-wrap">
                  <video ref={remoteVideoRef} className="remote-video" autoPlay playsInline />
                  <video ref={localVideoRef} className="local-video" autoPlay playsInline muted />
                </div>
                <div className="call-timer">
                  {peer?.displayName} • {fmt(seconds)}
                </div>
              </>
            )}

            <div className="call-actions">
              {view.mode === 'incoming' && (
                <>
                  <button className="call-btn reject" onClick={reject} title="Decline">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 9c-1.6 0-3.2.4-4.6 1.1v2.4c0 .6-.4 1.2-1 1.4-1.2.6-2.2 1.4-3 2.5-.3.4-.9.5-1.3.2l-1.6-1.6c-.4-.4-.4-1 0-1.3C4.3 10 8 8 12 8s7.7 2 11.5 5.7c.4.4.4 1 0 1.3l-1.6 1.6c-.4.4-1 .3-1.3-.2-.8-1.1-1.8-1.9-3-2.5-.6-.3-1-.8-1-1.4v-2.4C15.2 9.4 13.6 9 12 9Z" />
                    </svg>
                  </button>
                  <button className="call-btn accept" onClick={accept} title="Accept">
                    {isVideo ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 8-6 4 6 4V8Z" />
                        <rect x="2" y="6" width="14" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                      </svg>
                    )}
                  </button>
                </>
              )}

              {view.mode === 'outgoing' && (
                <button className="call-btn hang" onClick={() => hangup('')} title="Cancel">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 9c-1.6 0-3.2.4-4.6 1.1v2.4c0 .6-.4 1.2-1 1.4-1.2.6-2.2 1.4-3 2.5-.3.4-.9.5-1.3.2l-1.6-1.6c-.4-.4-.4-1 0-1.3C4.3 10 8 8 12 8s7.7 2 11.5 5.7c.4.4.4 1 0 1.3l-1.6 1.6c-.4.4-1 .3-1.3-.2-.8-1.1-1.8-1.9-3-2.5-.6-.3-1-.8-1-1.4v-2.4C15.2 9.4 13.6 9 12 9Z" />
                  </svg>
                </button>
              )}

              {view.mode === 'active' && (
                <>
                  <button
                    className={`call-btn ctrl ${muted ? 'off' : ''}`}
                    onClick={toggleMute}
                    title={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="m3 3 18 18" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                        <path d="M12 18v4" />
                      </svg>
                    )}
                  </button>
                  {isVideo && (
                    <button
                      className={`call-btn ctrl ${camOff ? 'off' : ''}`}
                      onClick={toggleCam}
                      title={camOff ? 'Camera on' : 'Camera off'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 8-6 4 6 4V8Z" />
                        <rect x="2" y="6" width="14" height="12" rx="2" />
                        {camOff && <path d="m4 4 16 16" />}
                      </svg>
                    </button>
                  )}
                  <button className="call-btn hang" onClick={() => hangup()} title="End call">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 9c-1.6 0-3.2.4-4.6 1.1v2.4c0 .6-.4 1.2-1 1.4-1.2.6-2.2 1.4-3 2.5-.3.4-.9.5-1.3.2l-1.6-1.6c-.4-.4-.4-1 0-1.3C4.3 10 8 8 12 8s7.7 2 11.5 5.7c.4.4.4 1 0 1.3l-1.6 1.6c-.4.4-1 .3-1.3-.2-.8-1.1-1.8-1.9-3-2.5-.6-.3-1-.8-1-1.4v-2.4C15.2 9.4 13.6 9 12 9Z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default CallManager;
