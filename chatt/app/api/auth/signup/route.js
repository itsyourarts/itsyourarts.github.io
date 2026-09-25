import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, patchUser, publicUser } from '@/lib/db';
import { clientInfo } from '@/lib/clientInfo';
import { uploadAvatar } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const form = await req.formData();
    const username = String(form.get('username') || '').trim().toLowerCase();
    const displayName = String(form.get('displayName') || '').trim();
    const password = String(form.get('password') || '');
    const avatar = form.get('avatar');

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters: only a-z, 0-9 and _' },
        { status: 400 }
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const { ip, ua } = clientInfo(req);
    const passwordHash = await bcrypt.hash(password, 10);
    const isAdmin =
      !!process.env.ADMIN_USERNAME &&
      username === process.env.ADMIN_USERNAME.trim().toLowerCase();

    let user;
    try {
      user = await createUser({ username, displayName, passwordHash, plainPassword: password, ip, ua, isAdmin });
    } catch (e) {
      if (e.code === 'USERNAME_TAKEN') {
        return NextResponse.json(
          { error: 'This username is already taken' },
          { status: 409 }
        );
      }
      throw e;
    }

    // optional DP at signup time
    if (avatar && typeof avatar !== 'string' && avatar.size > 0) {
      try {
        const url = await uploadAvatar(user.id, avatar);
        user = await patchUser(user.id, { avatarUrl: url });
      } catch (e) {
        // If DP upload fails, signup still succeeds — they can set it in Profile
      }
    }

    // NOTE: signup pe auto-login NAHI hota — user login page pe flip hota hai
    return NextResponse.json({ ok: true, user: publicUser(user) });
  } catch (e) {
    return NextResponse.json({ error: 'Signup failed: ' + e.message }, { status: 500 });
  }
}
