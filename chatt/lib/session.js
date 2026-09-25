// Client-side session helper
// 3-layer fallback: memory -> localStorage -> cookie
// (kuch browsers/previews cookies + localStorage dono block karte hain —
//  tab bhi in-page navigation me session kaam karta rahega)
'use client';

const KEY = 'gx-token';
let memToken = '';

export function getToken() {
  if (memToken) return memToken;
  try {
    const t = localStorage.getItem(KEY) || '';
    if (t) memToken = t;
    return t;
  } catch {
    return '';
  }
}

export function setToken(t) {
  memToken = t || '';
  try {
    if (t) localStorage.setItem(KEY, t);
    else localStorage.removeItem(KEY);
  } catch {}
}

export async function apiFetch(url, opts = {}) {
  const token = getToken();
  const headers = { ...(opts.headers || {}) };
  if (token) {
    // teen raaste: cookie (browser khud bhejta hai) + Authorization + custom header
    // (kuch proxies Authorization strip kar dete hain, custom header nahi karte)
    headers['authorization'] = `Bearer ${token}`;
    headers['x-gx-token'] = token;
  }

  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401) {
    setToken('');
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }
  return res;
}
