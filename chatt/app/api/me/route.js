import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getCurrentUser, COOKIE_NAME, cookieOpts } from '@/lib/auth';
import { patchUser, publicUser, findUserByUsername } from '@/lib/db';

export const dynamic = 'force-dynamic';

function unauthorized(req) {
  // diagnostic: kaunsa auth transport request tak pahuncha tha
  const hadCookie = !!cookies().get(COOKIE_NAME)?.value;
  const hadAuth = !!req?.headers.get('authorization');
  const hadX = !!req?.headers.get('x-gx-token');
  console.log(`[auth-debug] 401 | cookie:${hadCookie} authorization:${hadAuth} x-gx-token:${hadX}`);
  const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  res.cookies.set(COOKIE_NAME, '', { ...cookieOpts(), maxAge: 0 });
  return res;
}

export async function GET(req) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized(req);
  return NextResponse.json({ user: publicUser(user) });
}

export async function PATCH(req) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized(req);

  const body = await req.json();
  const patch = {};
  if (body.displayName && String(body.displayName).trim()) {
    patch.displayName = String(body.displayName).trim().slice(0, 40);
  }
  if (body.username !== undefined) {
    const nu = String(body.username).trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(nu)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters: only a-z, 0-9 and _' },
        { status: 400 }
      );
    }
    if (nu !== user.username) {
      const taken = await findUserByUsername(nu);
      if (taken && taken.id !== user.id) {
        return NextResponse.json({ error: 'This username is already taken' }, { status: 409 });
      }
      patch.username = nu;
    }
  }
  if (body.newPassword) {
    if (String(body.newPassword).length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }
    patch.passwordHash = await bcrypt.hash(String(body.newPassword), 10);
  }
  const updated = Object.keys(patch).length ? await patchUser(user.id, patch) : user;
  return NextResponse.json({ ok: true, user: publicUser(updated) });
}
