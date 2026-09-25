import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { patchUser } from '@/lib/db';
import { uploadAvatar } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const uid = await getSessionUserId(req);
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const url = await uploadAvatar(uid, file);
    const user = await patchUser(uid, { avatarUrl: url });
    return NextResponse.json({ ok: true, avatarUrl: url, user: { id: user.id } });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
