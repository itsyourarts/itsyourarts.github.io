'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import Logo from '@/components/Logo';
import { apiFetch, setToken } from '@/lib/session';
import { isOnline, lastSeenLabel, fullDate } from '@/lib/format';

// User-Agent se chhota sa readable summary nikalta hai
function uaSummary(ua) {
  if (!ua || ua === 'unknown') return '—';
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Chrome\//.test(ua) && !/Chromium/.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : /Chromium/.test(ua) ? 'Chromium'
    : 'Unknown browser';
  const os =
    /Windows NT 10/.test(ua) ? 'Windows 10/11'
    : /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown OS';
  const device = /Mobile|Android|iPhone/.test(ua) ? '📱 Mobile' : '💻 Desktop';
  return `${device} • ${browser} • ${os}`;
}

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('users');
  const [chats, setChats] = useState([]);
  const [filterUser, setFilterUser] = useState('');
  const [q, setQ] = useState('');
  const [expandedUA, setExpandedUA] = useState({});
  const [error, setError] = useState('');
  const [pwShow, setPwShow] = useState({}); // per-user password reveal
  const [vwUser, setVwUser] = useState(null); // profile popup
  // alag admin login screen (gate)
  const [gate, setGate] = useState(false);
  const [gateUser, setGateUser] = useState('');
  const [gatePass, setGatePass] = useState('');
  const [gateBusy, setGateBusy] = useState(false);
  const [gateErr, setGateErr] = useState('');
  // delete-user modal state
  const [delUser, setDelUser] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState('');
  const [modBusy, setModBusy] = useState(null);

  // user ko display-admin banao (real power nahi — sirf green neon badge)
  async function doPromote(u) {
    if (modBusy) return;
    setModBusy(u.id);
    try {
      const r = await apiFetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'promote' }),
      });
      if (r.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                users: prev.users.map((x) => (x.id === u.id ? { ...x, isAdmin: true } : x)),
              }
            : prev
        );
      }
    } catch {}
    setModBusy(null);
  }

  async function doDeleteUser() {
    if (!delUser || delBusy) return;
    setDelBusy(true);
    try {
      const r = await apiFetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: delUser.id }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setDelErr(d.error || 'Delete failed');
      } else {
        // list se turant hatao + count ghatao
        setData((prev) =>
          prev
            ? {
                ...prev,
                users: prev.users.filter((x) => x.id !== delUser.id),
                stats: {
                  ...prev.stats,
                  totalUsers: Math.max(0, (prev.stats.totalUsers || 1) - 1),
                },
              }
            : prev
        );
        setChats((prev) => prev.filter((m) => m.from !== delUser.id && m.to !== delUser.id));
        setDelUser(null);
      }
    } catch {
      setDelErr('Network error — try again.');
    }
    setDelBusy(false);
  }

  const loadOverview = useCallback(async () => {
    const o = await apiFetch('/api/admin/overview', { cache: 'no-store' });
    if (o.ok) setData(await o.json());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch('/api/me', { cache: 'no-store' });
        if (!r.ok) {
          // login hi nahi hai → alag admin login screen dikhao (redirect nahi)
          setGate(true);
          return;
        }
        const d = await r.json();
        if (!d.user.isAdmin) {
          setGate(true);
          setGateErr(`Logged in as @${d.user.username} — this account is not an admin.`);
          return;
        }
        setMe(d.user);
        await loadOverview();
      } catch {
        setError('Could not connect to the server. Please reload the page.');
      }
    })();
  }, [router, loadOverview]);

  // admin panel se logout → wapas gate screen pe
  async function adminLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setToken('');
    setMe(null);
    setData(null);
    setChats([]);
    setVwUser(null);
    setGate(true);
    setGateUser('');
    setGatePass('');
    setGateErr('');
  }

  async function adminLogin(e) {    e?.preventDefault();
    if (gateBusy) return;
    setGateBusy(true);
    setGateErr('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: gateUser.trim().toLowerCase(), password: gatePass }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setGateErr(d.error || 'Invalid username or password');
      } else if (!d.user?.isAdmin) {
        setGateErr('This account is not an admin.');
      } else {
        setToken(d.token);
        setMe(d.user);
        setData(null);
        await loadOverview();
        setGate(false);
      }
    } catch {
      setGateErr('Network error — try again.');
    }
    setGateBusy(false);
  }

  const loadChats = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterUser) params.set('userId', filterUser);
    if (q.trim()) params.set('q', q.trim());
    const r = await apiFetch(`/api/admin/messages?${params.toString()}`, { cache: 'no-store' });
    if (r.ok) {
      const d = await r.json();
      setChats(d.messages);
    }
  }, [filterUser, q]);

  useEffect(() => {
    if (me && tab === 'chats') {
      loadChats();
      const t = setInterval(loadChats, 5000);
      return () => clearInterval(t);
    }
  }, [me, tab, loadChats]);

  // 🔐 alag admin login screen — /admin kholo to pehle yahi dikhta hai
  if (gate) {
    return (
      <main className="auth-wrap">
        <div className="auth-card glass admin-gate">
          <Logo />
          <h2 className="gradient-text">🛡️ Admin Access</h2>
          <p className="sub">
            This panel is owner-only. Sign in with the admin account.
            <br />
            <b style={{ opacity: 0.7 }}>v2.4 · Sep 25</b>
          </p>
          {gateErr && (
            <p className="err-box" style={{ textAlign: 'left' }}>
              {gateErr}
            </p>
          )}
          <form onSubmit={adminLogin}>
            <input
              className="input"
              placeholder="Admin username"
              value={gateUser}
              onChange={(e) => setGateUser(e.target.value)}
              autoComplete="username"
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={gatePass}
              onChange={(e) => setGatePass(e.target.value)}
              autoComplete="current-password"
            />
            <button className="btn-neon" disabled={gateBusy}>
              {gateBusy ? 'Checking…' : 'Unlock panel →'}
            </button>
          </form>
          <Link href="/chat" className="link-neon">
            ← Back to chats
          </Link>
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={adminLogout} title="Clear the current session">
            Sign out current session
          </button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="auth-wrap">
        <div className="auth-card glass">
          <Logo />
          <p className="err-box">{error}</p>
          <Link href="/chat" className="link-neon">← Back to chats</Link>
        </div>
      </main>
    );
  }

  if (!me || !data) {
    return (
      <div className="loader">
        <div>
          <div className="spinner" />
          Loading admin panel…
        </div>
      </div>
    );
  }

  const { users, stats } = data;

  return (
    <main className="admin-wrap">
      <div className="admin-head">
        <Logo size={56} boxed />
        <h1 className="gradient-text">Admin Panel</h1>
        <span className="tag">ADMIN</span>
        <span className="tag" title="build version" style={{ opacity: 0.75 }}>v2.4 · Sep 25</span>
        <div className="spacer" />
        <Link href="/chat" className="btn-ghost" style={{ textDecoration: 'none' }}>
          ← Back to chats
        </Link>
        <button className="btn-ghost" onClick={adminLogout} title="Logout of admin panel">
          ⎋ Logout
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card glass">
          <div className="num gradient-text">{stats.totalUsers}</div>
          <div className="lbl">Total Users</div>
        </div>
        <div className="stat-card glass">
          <div className="num gradient-text">{stats.onlineNow}</div>
          <div className="lbl">Online Now</div>
        </div>
        <div className="stat-card glass">
          <div className="num gradient-text">{stats.totalMessages}</div>
          <div className="lbl">Total Messages</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          👥 Users ({users.length})
        </button>
        <button className={`tab ${tab === 'chats' ? 'active' : ''}`} onClick={() => setTab('chats')}>
          💬 All Chats
        </button>
      </div>

      {tab === 'users' && (
        <div className="table-wrap glass">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User (tap → profile)</th>
                <th>Password</th>
                <th>Status</th>
                <th>IP Address</th>
                <th>User-Agent (full detail)</th>
                <th>Joined</th>
                <th>Chats</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const online = u.lastSeen && isOnline(u.lastSeen);
                return (
                  <tr key={u.id}>
                    <td data-label="User">
                      <div
                        className="user-cell user-link"
                        title="Tap to open full profile"
                        onClick={() => setVwUser(u)}
                      >
                        <Avatar user={u} size={38} />
                        <div>
                          <b>
                            {u.displayName}
                            {u.isAdmin && <span className="admin-chip">🛡 ADMIN</span>}
                          </b>
                          <span>@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Password">
                      <span className="mono pw-cell">
                        {pwShow[u.id] ? u.password || '—' : '••••••••'}
                      </span>
                      <button
                        className="pw-eye"
                        title={pwShow[u.id] ? 'Hide password' : 'Show password'}
                        onClick={() => setPwShow((p) => ({ ...p, [u.id]: !p[u.id] }))}
                      >
                        {pwShow[u.id] ? '🙈' : '👁️'}
                      </button>
                    </td>
                    <td data-label="Status">
                      {online ? (
                        <span className="tag green">● online</span>
                      ) : (
                        <span className="ua-short">{lastSeenLabel(u.lastSeen)}</span>
                      )}
                    </td>
                    <td data-label="IP Address">
                      <span className="ip-pill mono">{u.lastIp || '—'}</span>
                    </td>
                    <td className="ua-cell" data-label="User-Agent">
                      <div className="ua-short">{uaSummary(u.lastUa)}</div>
                      <button
                        className="btn-ghost"
                        style={{ padding: '4px 10px', fontSize: 11.5, marginTop: 5 }}
                        onClick={() => setExpandedUA((p) => ({ ...p, [u.id]: !p[u.id] }))}
                      >
                        {expandedUA[u.id] ? 'Hide full ▲' : 'Show full ▼'}
                      </button>
                      {expandedUA[u.id] && <div className="ua-full mono">{u.lastUa || '—'}</div>}
                    </td>
                    <td className="ua-short" data-label="Joined">{fullDate(u.createdAt)}</td>
                    <td data-label="Chats">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-ghost"
                          style={{ padding: '5px 12px', fontSize: 12.5 }}
                          onClick={() => {
                            setFilterUser(u.id);
                            setTab('chats');
                          }}
                        >
                          View 💬
                        </button>
                        {!u.isAdmin && !u.moderator && (
                          <button
                            className="icon-btn mod-btn"
                            title="Make this user an Admin"
                            disabled={modBusy === u.id}
                            onClick={() => doPromote(u)}
                          >
                            {modBusy === u.id ? '⏳' : '🛡️'}
                          </button>
                        )}
                        {u.isAdmin && u.id !== me?.id && (
                          <span className="admin-chip" title="Real admin — panel power enabled">
                            🛡 ADMIN
                          </span>
                        )}
                        <button
                          className="icon-btn bucket-btn"
                          title="Delete this user"
                          onClick={() => {
                            setDelUser(u);
                            setDelErr('');
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'chats' && (
        <>
          <div className="filters">
            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
              <option value="">— All users —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  @{u.username}
                </option>
              ))}
            </select>
            <input
              className="input"
              style={{ maxWidth: 320 }}
              placeholder="Search in message content…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="chat-log">
            {chats.length === 0 && (
              <div className="list-empty">No messages found for this filter.</div>
            )}
            {chats.map((m) => (
              <div key={m.id} className="chat-log-item glass">
                <Avatar user={m.sender} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="route mono">
                    <b>@{m.sender?.username || '?'}</b> → <b>@{m.recipient?.username || '?'}</b>
                    {m.read ? '  ✓✓ read' : '  ✓ sent'}
                    {!!Object.keys(m.reactions || {}).length &&
                      '  ' + Object.entries(m.reactions).map(([em, us]) => `${em}×${us.length}`).join(' ')}
                  </div>
                  <div className="content">
                    {m.deletedForEveryone ? (
                      <i style={{ opacity: 0.65 }}>🚫 Deleted for everyone</i>
                    ) : (
                      <>
                        {!!m.replyTo && (
                          <span style={{ display: 'block', fontSize: 11.5, color: '#67e8f9' }}>
                            ↩ reply to: {m.replyTo.text}
                          </span>
                        )}
                        {m.content}
                        {m.imageUrl && (
                          <a href={m.imageUrl} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.imageUrl}
                              alt="attachment"
                              style={{ maxWidth: 140, maxHeight: 140, borderRadius: 10, display: 'block', marginTop: 6 }}
                            />
                          </a>
                        )}
                        {m.audioUrl && (
                          // eslint-disable-next-line jsx-a11y/media-has-caption
                          <audio
                            controls
                            preload="metadata"
                            src={m.audioUrl}
                            style={{ height: 36, maxWidth: 220, display: 'block', marginTop: 6 }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="when">{fullDate(m.createdAt)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- user profile popup (tap a user row) ---------- */}
      {vwUser && (
        <div className="call-overlay" onClick={() => setVwUser(null)}>
          <div className="call-card glass admin-profile" onClick={(e) => e.stopPropagation()}>
            <Avatar user={vwUser} size={92} />
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              {vwUser.displayName}
              {vwUser.isAdmin && <span className="admin-chip">🛡 ADMIN</span>}
            </h2>
            <p className="call-status" style={{ marginTop: 4 }}>
              @{vwUser.username} •{' '}
              {vwUser.lastSeen && isOnline(vwUser.lastSeen) ? (
                <b className="status-line online">online</b>
              ) : (
                lastSeenLabel(vwUser.lastSeen)
              )}
            </p>

            <div className="ap-rows">
              <div className="ap-row">
                <span>Password</span>
                <span className="mono pw-cell">
                  {pwShow['p' + vwUser.id] ? vwUser.password || '—' : '••••••••'}
                  <button
                    className="pw-eye"
                    onClick={() => setPwShow((p) => ({ ...p, ['p' + vwUser.id]: !p['p' + vwUser.id] }))}
                  >
                    {pwShow['p' + vwUser.id] ? '🙈' : '👁️'}
                  </button>
                </span>
              </div>
              <div className="ap-row">
                <span>User ID</span>
                <span className="mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{vwUser.id}</span>
              </div>
              <div className="ap-row">
                <span>IP Address</span>
                <span className="mono">{vwUser.lastIp || '—'}</span>
              </div>
              <div className="ap-row">
                <span>Joined</span>
                <span>{fullDate(vwUser.createdAt)}</span>
              </div>
              <div className="ap-row">
                <span>Last seen</span>
                <span>{lastSeenLabel(vwUser.lastSeen)}</span>
              </div>
              <div className="ap-row ua">
                <span>User-Agent</span>
                <p className="ua-full mono" style={{ margin: 0, wordBreak: 'break-all' }}>
                  {vwUser.lastUa || '—'}
                </p>
              </div>
            </div>

            <div className="ap-stats">
              {[
                ['📨 Sent', vwUser.stats?.sent],
                ['📥 Received', vwUser.stats?.received],
                ['📷 Photos', vwUser.stats?.photos],
                ['🎙️ Voice notes', vwUser.stats?.voice],
                ['😍 Reactions', vwUser.stats?.reactions],
                ['📞 Calls made', vwUser.stats?.callsMade],
                ['📲 Calls got', vwUser.stats?.callsGot],
                ['🚫 Deleted', vwUser.stats?.deleted],
              ].map(([lbl, n]) => (
                <span key={lbl} className="ap-stat">
                  {lbl} <b>{n || 0}</b>
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-ghost" onClick={() => setVwUser(null)}>
                Close
              </button>
              <button
                className="btn-neon"
                onClick={() => {
                  setFilterUser(vwUser.id);
                  setTab('chats');
                  setVwUser(null);
                }}
              >
                View 💬 chats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- delete user confirm popup ---------- */}
      {delUser && (
        <div className="call-overlay" onClick={() => !delBusy && setDelUser(null)}>
          <div className="call-card glass confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-ic">🗑️</div>
            <h2 style={{ margin: 0 }}>Delete this user?</h2>
            <p className="call-status" style={{ maxWidth: 330 }}>
              Are you sure you want to delete <b>@{delUser.username}</b>? Their account, all
              messages and call history will be removed permanently. This cannot be undone.
            </p>
            {delErr && (
              <p className="err-box" style={{ textAlign: 'left' }}>
                {delErr}
              </p>
            )}
            <div className="confirm-actions">
              <button className="btn-ghost" disabled={delBusy} onClick={() => setDelUser(null)}>
                Cancel
              </button>
              <button className="btn-danger" disabled={delBusy} onClick={doDeleteUser}>
                {delBusy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
