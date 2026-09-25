import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { patchUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST { to } -> "main is user ko type kar raha hoon" (5s me auto-expire)
export async function POST(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { to } = await req.json();
  await patchUser(uid, {
    typingTo: to || null,
    typingAt: to ? new Date().toISOString() : null,
  });
  return NextResponse.json({ ok: true });
}
