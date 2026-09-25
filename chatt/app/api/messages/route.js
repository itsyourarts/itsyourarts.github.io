import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import {
  getThread,
  addMessage,
  deleteMessage,
  getMessageById,
  toggleReaction,
  patchUser,
  findUserById,
  chatUserFor,
} from '@/lib/db';
import { uploadChatImage, uploadVoice } from '@/lib/upload';

export const dynamic = 'force-dynamic';

const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

function replySnippet(m) {
  if (!m) return null;
  return {
    id: m.id,
    from: m.from,
    text: m.deletedForEveryone
      ? 'Original message was deleted'
      : m.content
        ? m.content.slice(0, 90)
        : m.imageUrl
          ? '📷 Photo'
          : m.audioUrl
            ? '🎙️ Voice message'
            : 'Message',
  };
}

export async function GET(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const peerId = sp.get('peer');
  const after = Number(sp.get('after') || 0);
  if (!peerId) return NextResponse.json({ error: 'peer required' }, { status: 400 });

  const [me, peer] = await Promise.all([findUserById(uid), findUserById(peerId)]);
  if (!peer) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const myBlocked = me?.blocked || [];
  const { messages, readIds, deletedIds, reactMeta } = await getThread(uid, peerId, after, myBlocked);

  // typing indicator: peer mujhe type kar raha hai (5s fresh)
  const typing =
    peer.typingTo === uid &&
    peer.typingAt &&
    Date.now() - new Date(peer.typingAt).getTime() < 5000;

  return NextResponse.json({
    messages,
    readIds,
    deletedIds,
    reactMeta,
    typing: !!typing,
    peer: chatUserFor(peer, uid),
  });
}

export async function POST(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let to, content, replyToId, imageUrl = null, audioUrl = null;

    if ((req.headers.get('content-type') || '').includes('multipart/form-data')) {
      const form = await req.formData();
      to = String(form.get('to') || '');
      content = String(form.get('content') || '');
      replyToId = form.get('replyToId') || null;
      const image = form.get('image');
      const voice = form.get('voice');
      if (image && typeof image !== 'string' && image.size > 0) {
        imageUrl = await uploadChatImage(uid, image);
      }
      if (voice && typeof voice !== 'string' && voice.size > 0) {
        audioUrl = await uploadVoice(uid, voice);
        content = ''; // voice note standalone hota hai
      }
    } else {
      const body = await req.json();
      to = body.to;
      content = body.content;
      replyToId = body.replyToId || null;
    }

    if (!to || (!String(content || '').trim() && !imageUrl && !audioUrl)) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }
    if (to === uid) {
      return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 });
    }
    if (content && content.length > 2000) {
      return NextResponse.json({ error: 'Message is too long (max 2000 characters)' }, { status: 400 });
    }

    const [me, peer] = await Promise.all([findUserById(uid), findUserById(to)]);
    if (!peer) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if ((me?.blocked || []).includes(to)) {
      return NextResponse.json({ error: 'You have blocked this user — unblock to send messages' }, { status: 403 });
    }
    if ((peer.blocked || []).includes(uid)) {
      return NextResponse.json({ error: 'You cannot message this user' }, { status: 403 });
    }

    let replyTo = null;
    if (replyToId) {
      const original = await getMessageById(replyToId);
      // sirf isi conversation ka message quote ho sakta hai
      if (original && [original.from, original.to].includes(uid) && [original.from, original.to].includes(to)) {
        replyTo = replySnippet(original);
      }
    }

    await patchUser(uid, { typingTo: null, typingAt: null }).catch(() => {});

    const message = await addMessage(uid, to, String(content || '').trim(), imageUrl, audioUrl, replyTo);
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    return NextResponse.json({ error: 'Send failed: ' + e.message }, { status: 500 });
  }
}

// PUT = emoji reaction toggle
export async function PUT(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, emoji } = await req.json();
    if (!id || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
    }
    const m = await toggleReaction(id, uid, emoji);
    if (!m) return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    if (m.from !== uid && m.to !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ ok: true, reactions: m.reactions });
  } catch (e) {
    return NextResponse.json({ error: 'Reaction failed: ' + e.message }, { status: 500 });
  }
}

// DELETE = delete for me / everyone
export async function DELETE(req) {
  const uid = await getSessionUserId(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, scope } = await req.json();
    if (!id || !['me', 'everyone'].includes(scope)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const result = await deleteMessage(Number(id), uid, scope);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed: ' + e.message }, { status: 500 });
  }
}
