import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getConversations } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversations = await getConversations(uid);
  return NextResponse.json({ conversations });
}
