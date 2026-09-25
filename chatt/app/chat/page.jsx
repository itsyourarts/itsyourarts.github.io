'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import CallManager from '@/components/CallManager';
import { apiFetch, setToken } from '@/lib/session';
import { isOnline, lastSeenLabel, msgTime, shortTime, dateLabel } from '@/lib/format';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// naya message aane pe chhota ping (WebAudio — koi file nahi chahiye)
let audioCtx = null;
function playPing() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(880, t);
    o.frequency.setValueAtTime(660, t + 0.09);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.start(t);
    o.stop(t + 0.3);
  } catch {}
}

function fmtSec(s) {
  return `${String(Math.floor(s / 60)).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ---- browser notifications ----
// Permission pehli tap/click pe maangte hain (Android Chrome/Safari ko gesture chahiye hota hai)
function askNotifyOnGesture() {
  try {
    if (!('Notification' in window) || Notification.permission !== 'default') return;
    const go = () => {
      try {
        Notification.requestPermission();
      } catch {}
      window.removeEventListener('click', go);
      window.removeEventListener('touchstart', go);
      document.removeEventListener('keydown', go);
    };
    window.addEventListener('click', go, { passive: true });
    window.addEventListener('touchstart', go, { passive: true });
    document.addEventListener('keydown', go);
  } catch {}
}

function notifyMsg(who, body, tag) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const n = new Notification(`New message • ${who}`, {
      body: (body || '').slice(0, 140),
      tag: `gx-${tag}`, // ek sender se pehla wala replace hoga, spam nahi
      renotify: false,
      silent: true, // ping app khud bajati hai
    });
    n.onclick = () => {
      try {
        window.focus();
      } catch {}
      n.close();
    };
    setTimeout(() => {
      try {
        n.close();
      } catch {}
    }, 5000);
  } catch {}
}

function Tick({ read }) {
  return (
    <span className={`ticks ${read ? 'read' : ''}`} title={read ? 'Read' : 'Sent'}>
      <svg width="16" height="11" viewBox="0 0 18 12" fill="none">
        <path d="M1 6.5 4.5 10 12 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 6.8 10 10.2 17.5 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const PhoneIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </svg>
);
const VideoIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
);
const MicIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <path d="M12 18v4" />
  </svg>
);
const SendIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export default function ChatPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [convos, setConvos] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [peer, setPeer] = useState(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [sendErr, setSendErr] = useState('');
  const [peerModal, setPeerModal] = useState(false);
  const [rec, setRec] = useState(false);
  const [recSec, setRecSec] = useState(0);

  const peerRef = useRef(null);
  const lastIdRef = useRef(0);
  const lastTypingSentRef = useRef(0);
  const bottomRef = useRef(null);
  const imgRef = useRef(null);
  const callRef = useRef(null);
  const recorderRef = useRef(null);
  const recChunksRef = useRef([]);
  const recTimerRef = useRef(null);
  const recStreamRef = useRef(null);
  const recCancelledRef = useRef(false);
  const prevUnreadRef = useRef(new Map()); // notification ke liye unread tracker
  const convosHydratedRef = useRef(false);

  const scrollBottom = useCallback(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  }, []);

  const showErr = (msg) => {
    setSendErr(msg);
    setTimeout(() => setSendErr(''), 3500);
  };

  // ---------- initial load + presence heartbeat ----------
  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch('/api/me', { cache: 'no-store' });
        if (!r.ok) return router.replace('/login');
        const d = await r.json();
        setMe(d.user);
      } catch {
        setLoadError(true);
      }
    })();

    const beat = () => apiFetch('/api/presence', { method: 'POST' }).catch(() => {});
    beat();
    const hb = setInterval(beat, 20000);
    return () => clearInterval(hb);
  }, [router]);

  // ---------- conversations polling ----------
  const loadConvos = useCallback(async () => {
    try {
      const r = await apiFetch('/api/conversations', { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        if (!convosHydratedRef.current) {
          // pehla poll: sirf baseline set karo (purane unread pe notify spam nahi)
          const map = new Map();
          for (const c of d.conversations) map.set(c.peer.id, c.unread);
          prevUnreadRef.current = map;
          convosHydratedRef.current = true;
        } else {
          for (const c of d.conversations) {
            const before = prevUnreadRef.current.get(c.peer.id) || 0;
            if (c.unread > before) {
              const openVisible =
                peerRef.current?.id === c.peer.id && document.visibilityState === 'visible';
              if (!openVisible) {
                const who = c.peer.displayName || c.peer.username;
                const lm = c.lastMessage || {};
                const txt = lm.deletedForEveryone
                  ? '🚫 Message deleted'
                  : lm.content ||
                    (lm.imageUrl ? '📷 Photo' : lm.audioUrl ? '🎙️ Voice message' : 'New message');
                notifyMsg(who, txt, c.peer.id);
              }
            }
            prevUnreadRef.current.set(c.peer.id, c.unread);
          }
        }
        setConvos(d.conversations);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadConvos();
    const t = setInterval(loadConvos, 5000);
    return () => clearInterval(t);
  }, [loadConvos]);

  // browser notification permission — pehli user interaction pe
  useEffect(() => {
    if (me) askNotifyOnGesture();
  }, [me]);

  // ticks/tombstones/reactions meta ko purane messages pe merge karo
  const applyMeta = (list, readIds, deletedIds, reactMeta) => {
    const hasRead = readIds?.length;
    const hasDel = deletedIds?.length;
    const hasRx = reactMeta?.length;
    if (!hasRead && !hasDel && !hasRx) return list;
    const rset = new Set(readIds || []);
    const dset = new Set(deletedIds || []);
    const rmap = new Map((reactMeta || []).map((x) => [x.id, x.reactions]));
    return list.map((m) => {
      const del = dset.has(m.id);
      if (!del && !rset.has(m.id) && !rmap.has(m.id)) return m;
      return {
        ...m,
        read: m.read || rset.has(m.id),
        reactions: rmap.has(m.id) ? rmap.get(m.id) : m.reactions,
        deletedForEveryone: m.deletedForEveryone || del,
        content: del ? '' : m.content,
        imageUrl: del ? null : m.imageUrl,
        audioUrl: del ? null : m.audioUrl,
      };
    });
  };

  // ---------- messages polling (deduped + typing) ----------
  const loadMessages = useCallback(
    async (initial = false) => {
      const p = peerRef.current;
      if (!p) return;
      try {
        const url = `/api/messages?peer=${p.id}${initial ? '' : `&after=${lastIdRef.current}`}`;
        const r = await apiFetch(url, { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        if (d.peer) {
          setPeer((prev) => (prev && prev.id === d.peer.id ? { ...prev, ...d.peer } : prev));
          peerRef.current = { ...p, ...d.peer };
        }
        setPeerTyping(!!d.typing);
        const ms = d.messages || [];
        if (initial) {
          setMessages(applyMeta(ms, d.readIds, d.deletedIds, d.reactMeta));
          lastIdRef.current = ms.length ? Math.max(...ms.map((m) => m.id)) : 0;
          setLoadingChat(false);
          scrollBottom();
        } else {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const fresh = ms.filter((m) => !seen.has(m.id));
            if (fresh.length) {
              scrollBottom();
              lastIdRef.current = Math.max(lastIdRef.current, ...fresh.map((m) => m.id));
              if (fresh.some((m) => m.from === p.id)) playPing(); // incoming message
            }
            return applyMeta(fresh.length ? [...prev, ...fresh] : prev, d.readIds, d.deletedIds, d.reactMeta);
          });
        }
      } catch {}
    },
    [scrollBottom]
  );

  useEffect(() => {
    const t = setInterval(() => loadMessages(false), 2500);
    return () => clearInterval(t);
  }, [loadMessages]);

  // ---------- username search (debounced) ----------
  useEffect(() => {
    const q = searchQ.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await apiFetch(`/api/users/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
        if (r.ok) {
          const d = await r.json();
          setSearchResults(d.users);
        }
      } catch {}
    }, 300);
    return () => clearInterval(t);
  }, [searchQ]);

  async function openChat(u) {
    peerRef.current = u;
    lastIdRef.current = 0;
    setPeer(u);
    setMessages([]);
    setMenuFor(null);
    setPendingImage(null);
    setReplyingTo(null);
    setPeerTyping(false);
    setLoadingChat(true);
    setSearchQ('');
    setSearchResults(null);
    await loadMessages(true);
    loadConvos();
  }

  function onInputChange(e) {
    setText(e.target.value);
    if (!peerRef.current) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2500) {
      lastTypingSentRef.current = now;
      apiFetch('/api/typing', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ to: peerRef.current.id }),
      }).catch(() => {});
    }
  }

  function pickImage(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      showErr('Image must be under 5MB');
      return;
    }
    setPendingImage({ file: f, preview: URL.createObjectURL(f) });
  }

  async function send(e) {
    e?.preventDefault();
    const content = text.trim();
    if ((!content && !pendingImage) || !peer || sending) return;
    setSending(true);
    setText('');
    try {
      let r;
      if (pendingImage) {
        const fd = new FormData();
        fd.append('to', peer.id);
        fd.append('content', content);
        fd.append('image', pendingImage.file);
        if (replyingTo) fd.append('replyToId', String(replyingTo.id));
        r = await apiFetch('/api/messages', { method: 'POST', body: fd });
        setPendingImage(null);
      } else {
        r = await apiFetch('/api/messages', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({ to: peer.id, content, replyToId: replyingTo?.id }),
        });
      }
      setReplyingTo(null);
      if (r.ok) {
        const d = await r.json();
        setMessages((prev) => (prev.some((m) => m.id === d.message.id) ? prev : [...prev, d.message]));
        lastIdRef.current = Math.max(lastIdRef.current, d.message.id);
        scrollBottom();
        loadConvos();
      } else {
        const d = await r.json().catch(() => ({}));
        showErr(d.error || 'Could not send');
      }
    } catch {
      showErr('Network error');
    }
    setSending(false);
  }

  async function doDelete(id, scope) {
    setMenuFor(null);
    const r = await apiFetch('/api/messages', {
      method: 'DELETE',
      headers: JSON_HEADERS,
      body: JSON.stringify({ id, scope }),
    });
    if (r.ok) {
      if (scope === 'me') {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, deletedForEveryone: true, content: '', imageUrl: null, audioUrl: null }
              : m
          )
        );
      }
      loadConvos();
    }
  }

  async function putReaction(id, emoji) {
    setMenuFor(null);
    // optimistic update
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const rx = { ...(m.reactions || {}) };
        const had = (rx[emoji] || []).includes(me.id);
        for (const k of Object.keys(rx)) {
          rx[k] = rx[k].filter((u) => u !== me.id);
          if (!rx[k].length) delete rx[k];
        }
        if (!had) rx[emoji] = [me.id];
        return { ...m, reactions: rx };
      })
    );
    await apiFetch('/api/messages', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ id, emoji }),
    }).catch(() => {});
  }

  function copyMessage(m) {
    setMenuFor(null);
    try {
      navigator.clipboard?.writeText(m.content || '');
    } catch {}
  }

  const meBlockedPeer = me && peer && (me.blocked || []).includes(peer.id);

  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  async function toggleBlock() {
    if (!peer) return;
    const r = await apiFetch('/api/me/block', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ id: peer.id, block: !meBlockedPeer }),
    });
    if (r.ok) {
      const d = await r.json();
      setMe(d.user);
      setPeerModal(false);
      if (!meBlockedPeer) {
        // block karte hi unke messages mujhse chhup jayenge (next poll)
        loadMessages(true);
      } else {
        loadMessages(true);
      }
    }
  }

  // ---------- voice recording ----------
  async function startRec() {
    if (rec) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recStreamRef.current = stream;
      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;
      recChunksRef.current = [];
      recCancelledRef.current = false;
      mr.ondataavailable = (e) => {
        if (e.data.size) recChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        try {
          recStreamRef.current?.getTracks().forEach((t) => t.stop());
        } catch {}
        if (recCancelledRef.current) return;
        const type = mr.mimeType || 'audio/webm';
        const blob = new Blob(recChunksRef.current, { type });
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
        const fd = new FormData();
        fd.append('to', peerRef.current.id);
        if (replyingTo) fd.append('replyToId', String(replyingTo.id));
        fd.append('voice', blob, `voice.${ext}`);
        setReplyingTo(null);
        const r = await apiFetch('/api/messages', { method: 'POST', body: fd });
        if (r.ok) {
          const d = await r.json();
          setMessages((prev) => (prev.some((m) => m.id === d.message.id) ? prev : [...prev, d.message]));
          lastIdRef.current = Math.max(lastIdRef.current, d.message.id);
          scrollBottom();
        } else {
          const d = await r.json().catch(() => ({}));
          showErr(d.error || 'Voice note failed');
        }
      };
      mr.start();
      setRec(true);
      setRecSec(0);
      recTimerRef.current = setInterval(() => setRecSec((s) => s + 1), 1000);
    } catch {
      showErr('Mic permission denied');
    }
  }

  function stopRec(cancel) {
    clearInterval(recTimerRef.current);
    recCancelledRef.current = cancel;
    try {
      recorderRef.current?.stop();
    } catch {}
    setRec(false);
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setToken('');
    router.replace('/login');
    router.refresh();
  }

  function backToList() {
    setPeer(null);
    peerRef.current = null;
  }

  if (loadError) {
    return (
      <div className="loader">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div className="err-box" style={{ maxWidth: 340 }}>
            Could not connect to the server. Check your internet and try again.
          </div>
          <button className="btn-neon" onClick={() => window.location.reload()}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="loader">
        <div>
          <div className="spinner" />
          Loading GodxShadow…
        </div>
      </div>
    );
  }

  const online = peer?.lastSeen && isOnline(peer.lastSeen);

  const snippetOf = (c) => {
    if (c.lastMessage.deletedForEveryone) return '🚫 This message was deleted';
    const prefix = c.lastMessage.from === me.id ? 'You: ' : '';
    const body =
      c.lastMessage.content ||
      (c.lastMessage.imageUrl ? '📷 Photo' : c.lastMessage.audioUrl ? '🎙️ Voice message' : '');
    return prefix + body;
  };

  return (
    <div className={`chat-shell ${peer ? 'chat-open' : ''}`}>
      {/* ---------- sidebar ---------- */}
      <aside className="sidebar">
        <div className="side-head">
          <Avatar user={me} size={42} showStatus />
          <div className="names">
            <b>{me.displayName}</b>
            <span>@{me.username}</span>
          </div>
          <ThemeToggle icon />
          <a className="icon-btn" href="/profile" title="Profile / DP change">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </a>
          {me.isAdmin && (
            <a className="icon-btn" href="/admin" title="Admin panel">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4 5v6c0 5.5 3.8 9.7 8 11 4.2-1.3 8-5.5 8-11V5l-8-3Z" />
              </svg>
            </a>
          )}
          <button className="icon-btn" onClick={logout} title="Logout">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>

        <div className="search-wrap">
          <svg className="search-ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            className="input search-input"
            placeholder="Search username…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>

        <div className="list-scroll">
          {searchResults ? (
            <>
              <div className="list-title">Users</div>
              {searchResults.length === 0 && (
                <div className="list-empty">No users found for “{searchQ}”</div>
              )}
              {searchResults.map((u) => (
                <div key={u.id} className="convo-item" onClick={() => openChat(u)}>
                  <Avatar user={u} size={44} showStatus />
                  <div className="convo-meta">
                    <div className="convo-top">
                      <b>
                        {u.displayName}
                        {(u.isAdmin || u.moderator) && <span className="admin-chip">🛡️ Admin</span>}
                      </b>
                    </div>
                    <div className="convo-bottom">
                      <span className="snippet">@{u.username} • {lastSeenLabel(u.lastSeen)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="list-title">Chats</div>
              {convos.length === 0 && (
                <div className="list-empty">
                  No chats yet.
                  <br />
                  Search a username above to send your first message ✨
                </div>
              )}
              {convos.map((c) => (
                <div
                  key={c.peer.id}
                  className={`convo-item ${peer?.id === c.peer.id ? 'active' : ''}`}
                  onClick={() => openChat(c.peer)}
                >
                  <Avatar user={c.peer} size={46} showStatus />
                  <div className="convo-meta">
                    <div className="convo-top">
                      <b>
                        {c.peer.displayName}
                        {(c.peer.isAdmin || c.peer.moderator) && (
                          <span className="admin-chip">🛡️ Admin</span>
                        )}
                      </b>
                      <span className="time-mini">{shortTime(c.lastMessage.createdAt)}</span>
                    </div>
                    <div className="convo-bottom">
                      <span className="snippet">{snippetOf(c)}</span>
                      {c.unread > 0 && <span className="unread-badge">{c.unread}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        {/* build version — customer ko pata chal jaye naya build hai ya nahi */}
        <div
          style={{
            padding: '8px 14px calc(8px + env(safe-area-inset-bottom, 0px))',
            fontSize: 11,
            color: 'var(--muted)',
            opacity: 0.7,
            textAlign: 'center',
          }}
        >
          GodxShadow v2.4 · Sep 25
        </div>
      </aside>

      {/* ---------- chat pane ---------- */}
      {peer ? (
        <section className="chat-pane">
          <div className="chat-head">
            <button className="icon-btn back-btn" onClick={backToList} title="Back">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="peer-open" onClick={() => setPeerModal(true)} title="View profile">
              <Avatar user={peer} size={42} showStatus />
            </div>
            <div className="names peer-open" onClick={() => setPeerModal(true)}>
              <b>
                {peer.displayName}
                {(peer.isAdmin || peer.moderator) && <span className="admin-chip">🛡️ Admin</span>}
              </b>
              <div className={`status-line ${peerTyping ? 'typing-text' : online ? 'online' : ''}`}>
                {peerTyping ? 'typing…' : online ? 'online' : lastSeenLabel(peer.lastSeen)}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            {!meBlockedPeer && (
              <>
                <button className="icon-btn" title="Audio call" onClick={() => callRef.current?.start(peer, 'audio')}>
                  {PhoneIcon}
                </button>
                <button className="icon-btn" title="Video call" onClick={() => callRef.current?.start(peer, 'video')}>
                  {VideoIcon}
                </button>
              </>
            )}
          </div>

          <div className="chat-body" onClick={() => setMenuFor(null)}>
            {loadingChat && <div className="list-empty">Loading chat…</div>}
            {!loadingChat && messages.length === 0 && (
              <div className="list-empty">Say hi to @{peer.username} 👋</div>
            )}
            {messages.map((m, i) => {
              const mine = m.from === me.id;
              const d = new Date(m.createdAt).toDateString();
              const prevD = i > 0 ? new Date(messages[i - 1].createdAt).toDateString() : null;
              const rxList = Object.entries(m.reactions || {});
              return (
                <Fragment key={m.id}>
                  {d !== prevD && (
                    <div className="date-sep">
                      <span>{dateLabel(m.createdAt)}</span>
                    </div>
                  )}
                  <div className={`msg-row ${mine ? 'mine' : ''}`}>
                    <div className="msg-cell">
                      <div
                        className={`bubble ${mine ? 'mine' : ''} ${m.deletedForEveryone ? 'deleted' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!m.deletedForEveryone) setMenuFor(menuFor === m.id ? null : m.id);
                        }}
                      >
                        {m.deletedForEveryone ? (
                          <span className="tombstone">🚫 This message was deleted</span>
                        ) : (
                          <>
                            {m.replyTo && (
                              <div className={`quote-box ${mine ? 'mine' : ''}`}>
                                <b>
                                  {m.replyTo.from === me.id
                                    ? 'You'
                                    : m.replyTo.from === peer.id
                                      ? peer.displayName
                                      : 'Unknown'}
                                </b>
                                <span>{m.replyTo.text}</span>
                              </div>
                            )}
            {m.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                className="bubble-img zoomable"
                                src={m.imageUrl}
                                alt="Photo"
                                loading="lazy"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightbox(m.imageUrl);
                                }}
                              />
                            )}
                            {m.audioUrl && (
                              // eslint-disable-next-line jsx-a11y/media-has-caption
                              <audio
                                className="voice-player"
                                controls
                                preload="metadata"
                                src={m.audioUrl}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            {!!m.content && <p>{m.content}</p>}
                            {rxList.length > 0 && (
                              <div className="reaction-row display">
                                {rxList.map(([emoji, users]) => (
                                  <button
                                    key={emoji}
                                    className={`reaction-pill ${users.includes(me.id) ? 'mine' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      putReaction(m.id, emoji);
                                    }}
                                  >
                                    {emoji}
                                    {users.length > 1 && <span>{users.length}</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                        <span className="bubble-meta">
                          {msgTime(m.createdAt)}
                          {mine && !m.deletedForEveryone && <Tick read={m.read} />}
                        </span>
                      </div>
                      {menuFor === m.id && (
                        <div className={`bubble-menu glass ${mine ? 'right' : 'left'}`} onClick={(e) => e.stopPropagation()}>
                          <div className="reaction-row">
                            {REACTION_EMOJIS.map((em) => (
                              <button key={em} className="reaction-btn" onClick={() => putReaction(m.id, em)}>
                                {em}
                              </button>
                            ))}
                          </div>
                          <button
                            className="menu-item"
                            onClick={() => {
                              setReplyingTo(m);
                              setMenuFor(null);
                            }}
                          >
                            ↩️ Reply
                          </button>
                          {!!m.content && (
                            <button className="menu-item" onClick={() => copyMessage(m)}>
                              📋 Copy
                            </button>
                          )}
                          <button className="menu-item" onClick={() => doDelete(m.id, 'me')}>
                            🗑 Delete for me
                          </button>
                          {mine && (
                            <button className="menu-item danger" onClick={() => doDelete(m.id, 'everyone')}>
                              🗑 Delete for everyone
                            </button>
                          )}
                          <button className="menu-item" onClick={() => setMenuFor(null)}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Fragment>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {sendErr && <div className="send-err">{sendErr}</div>}

          {replyingTo && (
            <div className="pending-img-bar reply-strip">
              <span className="reply-bar" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b className="reply-name">{replyingTo.from === me.id ? 'You' : peer.displayName}</b>
                <div className="reply-text">
                  {replyingTo.content ||
                    (replyingTo.imageUrl ? '📷 Photo' : replyingTo.audioUrl ? '🎙️ Voice message' : '')}
                </div>
              </div>
              <button className="icon-btn" onClick={() => setReplyingTo(null)} title="Cancel reply">
                ✕
              </button>
            </div>
          )}

          {pendingImage && (
            <div className="pending-img-bar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingImage.preview} className="pending-img" alt="preview" />
              <span className="pending-name">{pendingImage.file.name}</span>
              <button className="icon-btn" onClick={() => setPendingImage(null)} title="Remove">
                ✕
              </button>
            </div>
          )}

          <div className="chat-inputbar">
            {meBlockedPeer ? (
              <div className="blocked-banner">
                <span>You blocked this user.</span>
                <button className="btn-ghost" onClick={toggleBlock}>
                  Unblock
                </button>
              </div>
            ) : rec ? (
              <div className="rec-bar">
                <span className="rec-dot" />
                <span className="rec-time">{fmtSec(recSec)}</span>
                <span className="rec-label">recording…</span>
                <div style={{ flex: 1 }} />
                <button className="icon-btn" onClick={() => stopRec(true)} title="Cancel">
                  ✕
                </button>
                <button className="send-btn" onClick={() => stopRec(false)} title="Send voice message">
                  {SendIcon}
                </button>
              </div>
            ) : (
              <form onSubmit={send}>
                <input
                  ref={imgRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={pickImage}
                />
                <button type="button" className="icon-btn attach-btn" title="Send an image" onClick={() => imgRef.current?.click()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-4.5-4.5L7 20" />
                  </svg>
                </button>
                <input
                  className="input chat-input"
                  placeholder="Type a message…"
                  value={text}
                  onChange={onInputChange}
                  autoFocus
                />
                {text.trim() || pendingImage ? (
                  <button className="send-btn" disabled={sending} title="Send">
                    {SendIcon}
                  </button>
                ) : (
                  <button type="button" className="send-btn" onClick={startRec} title="Record a voice message">
                    {MicIcon}
                  </button>
                )}
              </form>
            )}
          </div>
        </section>
      ) : (
        <section className="chat-pane">
          <div className="empty-pane">
            <Logo size={96} boxed />
            <h2 className="wordmark">GodxShadow</h2>
            <p>
              Select a chat, or <b>search a username</b> above to start a new conversation.
            </p>
          </div>
        </section>
      )}

      {peerModal && peer && (
        <div className="call-overlay" onClick={() => setPeerModal(false)}>
          <div className="call-card glass" onClick={(e) => e.stopPropagation()}>
            <Avatar user={peer} size={92} />
            <h2 style={{ margin: 0 }}>
              {peer.displayName}
              {(peer.isAdmin || peer.moderator) && <span className="admin-chip">🛡️ Admin</span>}
            </h2>
            <p className="call-status">
              @{peer.username} • <span className={online ? 'status-line online' : ''}>{online ? 'online' : lastSeenLabel(peer.lastSeen)}</span>
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-ghost" onClick={() => setPeerModal(false)}>
                Close
              </button>
              <button
                className="btn-neon"
                style={meBlockedPeer ? undefined : { background: 'linear-gradient(135deg,#f43f5e,#b91c1c)' }}
                onClick={toggleBlock}
              >
                {meBlockedPeer ? '✅ Unblock user' : '🚫 Block user'}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Full view" />
          <button className="icon-btn lightbox-close" onClick={() => setLightbox(null)} title="Close (Esc)">
            ✕
          </button>
          <a
            className="btn-ghost lightbox-open"
            href={lightbox}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            ↗ Open original
          </a>
        </div>
      )}

      <CallManager ref={callRef} />
    </div>
  );
}
