'use client';

import { Suspense, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import { setToken } from '@/lib/session';

function AuthInner() {
  const router = useRouter();
  const sp = useSearchParams();

  // flip state: false = login face, true = signup face
  const [flipped, setFlipped] = useState(sp.get('signup') === '1');
  const [created, setCreated] = useState(false); // green success overlay
  const [createdNote, setCreatedNote] = useState(false); // note on login face

  // login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [opening, setOpening] = useState(false);

  // signup form
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ username: '', displayName: '', password: '', confirm: '' });
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  function flip(toSignup) {
    setFlipped(toSignup);
    setLoginError('');
    setSignupError('');
  }

  async function submitLogin(e) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        setToken(d.token); // cookie ke saath-saath token fallback
        setOpening(true); // button me "Opening your chats…" dikhega
        router.replace('/chat');
        return;
      }
      setLoginError(d.error || 'Login failed');
    } catch {
      setLoginError('Network error — please try again');
    }
    setLoginLoading(false);
  }

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setSignupError('DP must be under 2MB');
      return;
    }
    setSignupError('');
    setPreview(URL.createObjectURL(f));
  }

  async function submitSignup(e) {
    e.preventDefault();
    setSignupError('');
    if (form.password !== form.confirm) {
      setSignupError('Password and confirm password do not match');
      return;
    }
    setSignupLoading(true);
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('displayName', form.displayName);
      fd.append('password', form.password);
      const f = fileRef.current?.files?.[0];
      if (f) fd.append('avatar', f);

      const r = await fetch('/api/auth/signup', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setSignupError(d.error || 'Signup failed');
        setSignupLoading(false);
        return;
      }

      // ✅ green success flash → flip back to login
      setCreated(true);
      setSignupLoading(false);
      setTimeout(() => {
        setCreated(false);
        setFlipped(false);
        setCreatedNote(true);
        setLoginForm((l) => ({ ...l, username: form.username }));
        setForm({ username: '', displayName: '', password: '', confirm: '' });
        setPreview(null);
      }, 1700);
    } catch {
      setSignupError('Network error — please try again');
      setSignupLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      <div className="flip-scene">
        <div className={`flip-card ${flipped ? 'flipped' : ''}`}>
          {/* ================= FRONT: LOGIN ================= */}
          <div className="auth-card glass flip-face flip-front">
            <Logo size={88} boxed />
            <h1 className="auth-title wordmark">GodxShadow</h1>
            <p className="auth-sub">Sign in to continue your conversations</p>
            <form onSubmit={submitLogin} className="auth-form">
              {createdNote && (
                <div className="ok-box">✅ Account created successfully — sign in to continue</div>
              )}
              <label className="field">
                Username
                <input
                  className="input"
                  value={loginForm.username}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, username: e.target.value });
                    setCreatedNote(false);
                  }}
                  placeholder="your_username"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="field">
                Password
                <input
                  className="input"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>
              {loginError && <div className="err-box">{loginError}</div>}
              <button className="btn-neon" style={{ width: '100%' }} disabled={loginLoading || opening}>
                {opening ? '⏳ Opening your chats…' : loginLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <p className="auth-switch">
              New here?{' '}
              <button type="button" className="flip-link" onClick={() => flip(true)}>
                Create an account
              </button>
            </p>
          </div>

          {/* ================= BACK: SIGNUP ================= */}
          <div className="auth-card glass flip-face flip-back">
            <h1 className="auth-title gradient-text" style={{ fontSize: 28 }}>
              Create Account
            </h1>
            <p className="auth-sub">Pick a username, password and a DP</p>
            <p className="auth-credit">© 2026 GodxShadow chat -- by Krishna chauhan UPX61</p>
            <form onSubmit={submitSignup} className="auth-form">
              <div className="dp-picker">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="dp-preview" src={preview} alt="DP preview" />
                ) : (
                  <div className="dp-preview-fallback">
                    {(form.displayName || form.username || '?')[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  hidden
                  onChange={pickFile}
                />
                <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>
                  📷 Choose a DP (optional)
                </button>
              </div>

              <label className="field">
                Username
                <input
                  className="input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  placeholder="e.g. arjun_07"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="field">
                Display name (optional)
                <input
                  className="input"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="e.g. Arjun"
                />
              </label>
              <label className="field">
                Password
                <input
                  className="input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="min 6 characters"
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="field">
                Confirm password
                <input
                  className="input"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="re-type your password"
                  autoComplete="new-password"
                  required
                />
              </label>
              {signupError && <div className="err-box">{signupError}</div>}
              <button className="btn-neon" style={{ width: '100%' }} disabled={signupLoading}>
                {signupLoading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" className="flip-link" onClick={() => flip(false)}>
                Sign in
              </button>
            </p>

            {created && (
              <div className="success-overlay">
                <div className="success-check">✓</div>
                <h3 style={{ margin: 0 }}>Account created!</h3>
                <p style={{ margin: 0, fontSize: 13.5, opacity: 0.8 }}>
                  Taking you to sign in…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="loader">
          <div>
            <div className="spinner" />
            Loading…
          </div>
        </div>
      }
    >
      <AuthInner />
    </Suspense>
  );
}
