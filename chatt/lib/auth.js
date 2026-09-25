import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { findUserById } from './db';

const COOKIE_NAME = 'chat_token';

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
}

export function cookieOpts() {
  const prod = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    // production me 'none' + secure: iframe/preview (cross-site) me bhi kaam kare
    sameSite: prod ? 'none' : 'lax',
    secure: prod,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export async function createSessionToken(userId) {
  return await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.uid || null;
  } catch {
    return null;
  }
}

// Triple-transport auth: cookie -> Authorization header -> custom X-GX-Token header
// (proxies/browsers alag-alag cheezein block karte hain — teeno me se koi ek kaafi hai)
export async function getSessionUserId(req) {
  let token = cookies().get(COOKIE_NAME)?.value;
  if (!token && req) {
    const h = req.headers.get('authorization') || '';
    if (h.startsWith('Bearer ')) token = h.slice(7).trim();
  }
  if (!token && req) {
    token = req.headers.get('x-gx-token') || '';
  }
  if (!token) return null;
  return await verifyToken(token);
}

export async function getCurrentUser(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return null;
  return await findUserById(uid);
}

export { COOKIE_NAME };
