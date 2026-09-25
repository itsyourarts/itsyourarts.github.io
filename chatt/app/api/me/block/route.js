import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { patchUser, publicUser, findUserById } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST { id, block: true|false }
export async function POST(req) {
  const me = await getCurrentUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, block } = await req.json();
  if (!id || id === me.id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const peer = await findUserById(id);
  if (!peer) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const set = new Set(me.blocked || []);
  if (block) set.add(id);
  else set.delete(id);

  const updated = await patchUser(me.id, { blocked: [...set] });
  return NextResponse.json({ ok: true, user: publicUser(updated) });
}
