import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import {
  createCall,
  findCallById,
  updateCall,
  pushCandidate,
  getIncomingCall,
  findUserById,
  chatUser,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

async function withUsers(call, me) {
  if (!call) return null;
  const peerId = call.from === me ? call.to : call.from;
  const peer = await findUserById(peerId);
  const fromUser = call.from === me ? null : chatUser(await findUserById(call.from));
  return { ...call, peer: chatUser(peer), fromUser };
}

export async function GET(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const id = sp.get('id');

  if (id) {
    const call = await findCallById(id);
    if (!call || (call.from !== uid && call.to !== uid)) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }
    return NextResponse.json({ call: await withUsers(call, uid) });
  }

  // incoming ringing call (agar koi hai)
  const incoming = await getIncomingCall(uid);
  return NextResponse.json({ incoming: await withUsers(incoming, uid) });
}

export async function POST(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action, id } = body;

    if (action === 'start') {
      const { to, type, offer } = body;
      if (!to || !offer?.sdp) return NextResponse.json({ error: 'Invalid call' }, { status: 400 });
      if (to === uid) return NextResponse.json({ error: 'You cannot call yourself' }, { status: 400 });
      const [me, peer] = await Promise.all([findUserById(uid), findUserById(to)]);
      if (!peer) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      if ((me?.blocked || []).includes(to)) {
        return NextResponse.json({ error: 'You have blocked this user — unblock to call' }, { status: 403 });
      }
      if ((peer.blocked || []).includes(uid)) {
        return NextResponse.json({ error: 'You cannot call this user' }, { status: 403 });
      }
      const call = await createCall(uid, to, type, offer);
      return NextResponse.json({ ok: true, call: await withUsers(call, uid) });
    }

    const call = await findCallById(id);
    if (!call || (call.from !== uid && call.to !== uid)) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    if (action === 'answer') {
      if (call.to !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      if (!body.answer?.sdp) return NextResponse.json({ error: 'Answer required' }, { status: 400 });
      const updated = await updateCall(id, { state: 'active', answer: body.answer });
      return NextResponse.json({ ok: true, call: await withUsers(updated, uid) });
    }

    if (action === 'reject') {
      if (call.to !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const updated = await updateCall(id, { state: 'rejected' });
      return NextResponse.json({ ok: true, call: withUsers(updated, uid) });
    }

    if (action === 'end' || action === 'cancel') {
      const updated = await updateCall(id, { state: 'ended' });
      return NextResponse.json({ ok: true, call: await withUsers(updated, uid) });
    }

    if (action === 'candidate') {
      if (!body.candidate) return NextResponse.json({ error: 'Candidate required' }, { status: 400 });
      const key = call.from === uid ? 'candFrom' : 'candTo';
      await pushCandidate(id, key, body.candidate);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Call error: ' + e.message }, { status: 500 });
  }
}
