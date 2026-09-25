import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { adminMessages } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const me = await getCurrentUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!me.isAdmin) return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  const sp = new URL(req.url).searchParams;
  const messages = await adminMessages({
    userId: sp.get('userId') || '',
    q: sp.get('q') || '',
  });
  return NextResponse.json({ messages });
}
