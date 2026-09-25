import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByUsername, patchUser, publicUser } from '@/lib/db';
import { createSessionToken, cookieOpts, COOKIE_NAME } from '@/lib/auth';
import { clientInfo } from '@/lib/clientInfo';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    const ok = await bcrypt.compare(String(password || ''), user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const { ip, ua } = clientInfo(req);
    await patchUser(user.id, { lastIp: ip, lastUa: ua, lastSeen: new Date().toISOString() });

    const token = await createSessionToken(user.id);
    // token body me bhi bhejte hain — cookies blocked browsers ke liye fallback
    const res = NextResponse.json({
      ok: true,
      token,
      user: publicUser({ ...user, lastIp: ip, lastUa: ua }),
    });
    res.cookies.set(COOKIE_NAME, token, cookieOpts());
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Login failed: ' + e.message }, { status: 500 });
  }
}
