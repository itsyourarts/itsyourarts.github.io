'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/session';
import { fullDate } from '@/lib/format';

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [me, setMe] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState(null); // {type:'ok'|'err', text}
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch('/api/me', { cache: 'no-store' });
        if (!r.ok) return router.replace('/login');
        const d = await r.json();
        setMe(d.user);
        setDisplayName(d.user.displayName || '');
        setUsername(d.user.username || '');
      } catch {
        setLoadError(true);
      }
    })();
  }, [router]);

  async function uploadDp(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMsg(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const r = await apiFetch('/api/me/avatar', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        setMe((prev) => ({ ...prev, avatarUrl: d.avatarUrl }));
        setMsg({ type: 'ok', text: 'DP updated ✨' });
      } else {
        setMsg({ type: 'err', text: d.error || 'Upload failed' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    }
    setUploading(false);
    e.target.value = '';
  }

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const r = await apiFetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          username,
          newPassword: newPassword || undefined,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        setMe(d.user);
        setNewPassword('');
        setMsg({ type: 'ok', text: 'Profile saved ✅' });
      } else {
        setMsg({ type: 'err', text: d.error || 'Save failed' });
      }
    } catch {
      setMsg({ type: 'err', text: 'Network error' });
    }
    setSaving(false);
  }

  if (loadError) {
    return (
      <div className="loader">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div className="err-box" style={{ maxWidth: 340 }}>
            Could not connect to the server. Check your internet and try again.
          </div>
          <button className="btn-neon" onClick={() => window.location.reload()}>🔄 Retry</button>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="loader">
        <div>
          <div className="spinner" />
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <main className="page-wrap">
      <div className="profile-card glass">
        <h1 className="gradient-text">My Profile</h1>

        <div className="dp-picker">
          {me.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="dp-preview" src={me.avatarUrl} alt="DP" />
          ) : (
            <div className="dp-preview-fallback">
              {(me.displayName || me.username)[0]?.toUpperCase()}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={uploadDp}
          />
          <button
            className="btn-ghost"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : '📷 Change DP'}
          </button>
        </div>

        <div className="profile-meta">
          @{me.username}
          {me.isAdmin && <span className="tag">ADMIN</span>}
          <br />
          Joined: {fullDate(me.createdAt)}
        </div>

        <form onSubmit={save} className="auth-form">
          <label className="field">
            Username (you sign in with this too)
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="a-z, 0-9, _"
              autoComplete="username"
            />
          </label>
          <label className="field">
            Display name
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label className="field">
            New password (leave blank to keep the current one)
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="min 6 characters"
              autoComplete="new-password"
            />
          </label>
          {msg && <div className={msg.type === 'ok' ? 'ok-box' : 'err-box'}>{msg.text}</div>}
          <button className="btn-neon" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        <Link href="/chat" className="link-neon">
          ← Back to chats
        </Link>
      </div>
    </main>
  );
}
