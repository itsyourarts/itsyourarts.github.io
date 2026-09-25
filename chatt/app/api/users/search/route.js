import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { searchUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = new URL(req.url).searchParams.get('q') || '';
  const users = await searchUsers(q, uid);
  return NextResponse.json({ users });
}
