import { NextResponse } from 'next/server';
import { patchUser } from '@/lib/db';
import { getSessionUserId, cookieOpts, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const uid = await getSessionUserId(req);
  if (uid) {
    // on logout, backdate last_seen so they show offline immediately
    await patchUser(uid, { lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString() });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '', { ...cookieOpts(), maxAge: 0 });
  return res;
}
