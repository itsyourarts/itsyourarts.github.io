import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { patchUser } from '@/lib/db';
import { clientInfo } from '@/lib/clientInfo';

export const dynamic = 'force-dynamic';

// Heartbeat — har ~20s me client call karta hai.
// last_seen + IP + user-agent refresh hota hai.
export async function POST(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ip, ua } = clientInfo(req);
  await patchUser(uid, {
    lastSeen: new Date().toISOString(),
    lastIp: ip,
    lastUa: ua,
  });
  return NextResponse.json({ ok: true });
}
