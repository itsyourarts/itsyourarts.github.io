import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { adminUserList, readMessages } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const me = await getCurrentUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!me.isAdmin) return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  const [users, msgs] = await Promise.all([adminUserList(), readMessages()]);
  const now = Date.now();
  const onlineNow = users.filter(
    (u) => u.lastSeen && now - new Date(u.lastSeen).getTime() < 90 * 1000
  ).length;

  return NextResponse.json({
    users,
    stats: {
      totalUsers: users.length,
      totalMessages: msgs.length,
      onlineNow,
    },
  });
}
