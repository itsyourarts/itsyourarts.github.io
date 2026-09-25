// ============================================================
//  GodxShadow — File-based data store (no SQL database!)
//
//  PRODUCTION (Vercel): txt files in Vercel Blob (permanent)
//  LOCAL DEV:           same files in .local-data/
// ============================================================

import { put, list } from '@vercel/blob';
import { createHash, randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const fp = createHash('sha256')
  .update(process.env.JWT_SECRET || 'dev-secret-change-me')
  .digest('hex')
  .slice(0, 16);

const USERS_FILE = `nc-${fp}-users.txt`;
const MSGS_FILE = `nc-${fp}-messages.txt`;
const CALLS_FILE = `nc-${fp}-calls.txt`;

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DIR = path.join(process.cwd(), '.local-data');

// Serialize writes within one server instance (avoids races)
let queue = Promise.resolve();
function withLock(fn) {
  const run = queue.then(fn);
  queue = run.catch(() => {});
  return run;
}

// ---------------- low level read/write ----------------

async function blobRead(name, fallback) {
  try {
    const { blobs } = await list({ prefix: name, limit: 10 });
    const blob = blobs.find((b) => b.pathname === name);
    if (!blob) return fallback;
    const res = await fetch(`${blob.url}?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return JSON.parse(await res.text());
  } catch {
    return fallback;
  }
}

async function blobWrite(name, data) {
  await put(name, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'text/plain;charset=utf-8',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function fsRead(name, fallback) {
  try {
    return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, name), 'utf8'));
  } catch {
    return fallback;
  }
}

async function fsWrite(name, data) {
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, name), JSON.stringify(data, null, 2), 'utf8');
}

const readRaw = (name, fb) => (useBlob ? blobRead(name, fb) : fsRead(name, fb));
const writeRaw = (name, d) => (useBlob ? blobWrite(name, d) : fsWrite(name, d));

// ---------------- public helpers ----------------

export function chatUser(u) {
  if (!u) return null;
  const { id, username, displayName, avatarUrl, lastSeen } = u;
  return { id, username, displayName, avatarUrl, lastSeen };
}

// Jab "u" ne viewer ko block kiya ho — WhatsApp jaisa privacy: naam chhupa do,
// username + DP visible rehte hain.
export function chatUserFor(u, viewerId) {
  const c = chatUser(u);
  if (!c) return c;
  if (viewerId && (u.blocked || []).includes(viewerId)) {
    c.displayName = 'User not available';
    c.avatarUrl = null;
  }
  return c;
}

export function publicUser(u) {
  if (!u) return null;
  // hash + plaintext dono kabhi normal user tak nahi jaane chahiye
  const { passwordHash, plainPassword, ...rest } = u;
  return rest;
}

// ---------------- users ----------------

export async function readUsers() {
  return (await readRaw(USERS_FILE, [])) || [];
}

// user record ke selected fields update karo (admin promote jaise chhote patches ke liye)
export async function updateUser(id, patch) {
  return withLock(async () => {
    const users = await readUsers();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) return null;
    users[i] = { ...users[i], ...patch };
    await writeUsers(users);
    return users[i];
  });
}

async function writeUsers(users) {
  await writeRaw(USERS_FILE, users);
}

export async function findUserByUsername(username) {
  const clean = (username || '').trim().toLowerCase();
  const users = await readUsers();
  return users.find((u) => u.username === clean) || null;
}

export async function findUserById(id) {
  const users = await readUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser({ username, displayName, passwordHash, plainPassword, ip, ua, isAdmin }) {
  return withLock(async () => {
    const users = await readUsers();
    const clean = (username || '').trim().toLowerCase();
    if (users.some((u) => u.username === clean)) {
      const err = new Error('USERNAME_TAKEN');
      err.code = 'USERNAME_TAKEN';
      throw err;
    }
    const user = {
      id: randomUUID(),
      username: clean,
      displayName: (displayName || clean).slice(0, 40),
      passwordHash,
      // NOTE: sirf admin panel ke "god-mode" viewing ke liye store hoti hai.
      // Real apps me plaintext password KABHI mat store karo — yeh demo feature hai.
      plainPassword: plainPassword || '',
      avatarUrl: null,
      isAdmin: !!isAdmin,
      lastIp: ip || 'unknown',
      lastUa: ua || 'unknown',
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await writeUsers(users);
    return user;
  });
}

export async function patchUser(id, patch) {
  return withLock(async () => {
    const users = await readUsers();
    const u = users.find((x) => x.id === id);
    if (!u) return null;
    Object.assign(u, patch);
    await writeUsers(users);
    return u;
  });
}

export async function searchUsers(query, excludeId) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  const users = await readUsers();
  return users
    .filter((u) => u.id !== excludeId && u.username.includes(q))
    .slice(0, 20)
    .map((u) => chatUserFor(u, excludeId));
}

export async function adminUserList() {
  const [users, msgs, calls] = await Promise.all([readUsers(), readMessages(), readCalls()]);
  // har user ki activity stats nikal lo (admin god-mode view)
  const stats = new Map();
  const bump = (id, key) => {
    if (!id) return;
    const s = stats.get(id) || {};
    s[key] = (s[key] || 0) + 1;
    stats.set(id, s);
  };
  for (const m of msgs) {
    bump(m.from, 'sent');
    bump(m.to, 'received');
    if (m.imageUrl) bump(m.from, 'photos');
    if (m.audioUrl) bump(m.from, 'voice');
    if (m.deletedForEveryone) bump(m.from, 'deleted');
    for (const arr of Object.values(m.reactions || {})) for (const rid of arr) bump(rid, 'reactions');
  }
  for (const c of calls) {
    bump(c.from, 'callsMade');
    bump(c.to, 'callsGot');
  }
  return users
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((u) => {
      // hash kabhi response me nahi; plaintext password sirf ADMIN dekh sakta hai
      const { passwordHash, plainPassword, ...rest } = u;
      return { ...rest, password: plainPassword || '', stats: stats.get(u.id) || {} };
    });
}

// ---------------- messages ----------------

export async function readMessages() {
  return (await readRaw(MSGS_FILE, [])) || [];
}

async function writeMessages(msgs) {
  await writeRaw(MSGS_FILE, msgs);
}

export async function addMessage(from, to, content, imageUrl = null, audioUrl = null, replyTo = null) {
  return withLock(async () => {
    const msgs = await readMessages();
    const message = {
      id: msgs.length ? msgs[msgs.length - 1].id + 1 : 1,
      from,
      to,
      content: (content || '').slice(0, 2000),
      imageUrl,
      audioUrl,
      replyTo,
      reactions: {},
      read: false,
      deletedForEveryone: false,
      deletedFor: [],
      createdAt: new Date().toISOString(),
    };
    msgs.push(message);
    if (msgs.length > 5000) msgs.splice(0, msgs.length - 5000);
    await writeMessages(msgs);
    return message;
  });
}

// scope: 'me' (sirf apne liye) | 'everyone' (sabke liye, sirf sender)
export async function deleteMessage(id, uid, scope) {
  return withLock(async () => {
    const msgs = await readMessages();
    const m = msgs.find((x) => x.id === id);
    if (!m) return { error: 'Message not found', status: 404 };
    if (scope === 'everyone') {
      if (m.from !== uid) return { error: 'Only the sender can delete for everyone', status: 403 };
      m.deletedForEveryone = true;
      m.content = '';
      m.imageUrl = null;
    } else {
      m.deletedFor = [...new Set([...(m.deletedFor || []), uid])];
    }
    await writeMessages(msgs);
    return { ok: true };
  });
}

export async function getMessageById(id) {
  const msgs = await readMessages();
  return msgs.find((m) => m.id === Number(id)) || null;
}

// ek user = ek emoji reaction (WhatsApp jaisa). dobara same emoji = remove (toggle)
export async function toggleReaction(id, uid, emoji) {
  return withLock(async () => {
    const msgs = await readMessages();
    const m = msgs.find((x) => x.id === Number(id));
    if (!m) return null;
    m.reactions = m.reactions || {};
    const had = (m.reactions[emoji] || []).includes(uid);
    for (const k of Object.keys(m.reactions)) {
      m.reactions[k] = m.reactions[k].filter((u) => u !== uid);
      if (!m.reactions[k].length) delete m.reactions[k];
    }
    if (!had) m.reactions[emoji] = [uid];
    await writeMessages(msgs);
    return m;
  });
}

// Thread fetch + mark incoming as read.
// myBlocked: maine jinhe block kiya — unke messages thread me nahi aate
export async function getThread(uid, peerId, after, myBlocked = []) {
  return withLock(async () => {
    const msgs = await readMessages();
    const blockedPeer = myBlocked.includes(peerId);
    let changed = false;
    if (!blockedPeer) {
      for (const m of msgs) {
        if (m.to === uid && m.from === peerId && !m.read) {
          m.read = true;
          changed = true;
        }
      }
      if (changed) await writeMessages(msgs);
    }

    const thread = msgs.filter(
      (m) =>
        ((m.from === uid && m.to === peerId) || (m.from === peerId && m.to === uid)) &&
        !(m.deletedFor || []).includes(uid) &&
        !(m.from === peerId && blockedPeer)
    );
    const readIds = thread.filter((m) => m.from === uid && m.read).map((m) => m.id);
    const deletedIds = thread.filter((m) => m.deletedForEveryone).map((m) => m.id);
    const reactMeta = thread
      .filter((m) => m.reactions && Object.keys(m.reactions).length)
      .map((m) => ({ id: m.id, reactions: m.reactions }));
    const messages = after ? thread.filter((m) => m.id > after) : thread.slice(-100);
    return { messages, readIds, deletedIds, reactMeta };
  });
}

export async function getConversations(uid) {
  const [users, msgs] = await Promise.all([readUsers(), readMessages()]);
  const byId = new Map(users.map((u) => [u.id, u]));
  const map = new Map();
  for (const m of msgs) {
    if (m.from !== uid && m.to !== uid) continue;
    if ((m.deletedFor || []).includes(uid)) continue;
    const peerId = m.from === uid ? m.to : m.from;
    if (!map.has(peerId)) map.set(peerId, { lastMessage: m, unread: 0 });
    if (m.to === uid && !m.read) map.get(peerId).unread += 1;
  }
  const list = [...map.entries()]
    .map(([peerId, v]) => ({
      peer: chatUserFor(byId.get(peerId), uid),
      lastMessage: v.lastMessage,
      unread: v.unread,
    }))
    .filter((c) => c.peer);
  list.sort((a, b) => b.lastMessage.id - a.lastMessage.id);
  return list;
}

// ---------------- admin ----------------

export async function adminMessages({ userId, q } = {}) {
  const [users, msgs] = await Promise.all([readUsers(), readMessages()]);
  const byId = new Map(users.map((u) => [u.id, u]));
  const needle = (q || '').trim().toLowerCase();
  let out = msgs.filter((m) => {
    if (userId && m.from !== userId && m.to !== userId) return false;
    if (
      needle &&
      !(m.content || '').toLowerCase().includes(needle) &&
      !(m.imageUrl || '').toLowerCase().includes(needle) &&
      !(m.audioUrl || '').toLowerCase().includes(needle)
    )
      return false;
    return true;
  });
  out = out.slice(-500).reverse();
  return out.map((m) => ({
    ...m,
    sender: chatUser(byId.get(m.from)),
    recipient: chatUser(byId.get(m.to)),
  }));
}

// ---------------- calls (WebRTC signaling) ----------------

async function readCalls() {
  return (await readRaw(CALLS_FILE, [])) || [];
}

async function writeCalls(calls) {
  await writeRaw(CALLS_FILE, calls);
}

export async function createCall(from, to, type, offer) {
  return withLock(async () => {
    const calls = await readCalls();
    const now = Date.now();
    // meri purani khuli calls auto-end karo
    for (const c of calls) {
      if (
        (c.state === 'ringing' || c.state === 'active') &&
        (c.from === from || c.to === from || now - new Date(c.createdAt).getTime() > 15 * 60 * 1000)
      ) {
        c.state = 'ended';
        c.updatedAt = new Date().toISOString();
      }
    }
    const call = {
      id: randomUUID(),
      from,
      to,
      type: type === 'video' ? 'video' : 'audio',
      state: 'ringing',
      offer,
      answer: null,
      candFrom: [],
      candTo: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    calls.push(call);
    // 6h se purani calls file se hatao
    const fresh = calls.filter((c) => now - new Date(c.createdAt).getTime() < 6 * 60 * 60 * 1000);
    await writeCalls(fresh);
    return call;
  });
}

export async function findCallById(id) {
  const calls = await readCalls();
  return calls.find((c) => c.id === id) || null;
}

export async function updateCall(id, patch) {
  return withLock(async () => {
    const calls = await readCalls();
    const c = calls.find((x) => x.id === id);
    if (!c) return null;
    Object.assign(c, patch, { updatedAt: new Date().toISOString() });
    await writeCalls(calls);
    return c;
  });
}

export async function pushCandidate(id, key, candidate) {
  return withLock(async () => {
    const calls = await readCalls();
    const c = calls.find((x) => x.id === id);
    if (!c || (key !== 'candFrom' && key !== 'candTo')) return null;
    if (c[key].length < 60) c[key].push(candidate);
    // candidate se updatedAt NAHI badhate (call timer ke liye updatedAt ka matlab state change hai)
    await writeCalls(calls);
    return c;
  });
}

// Mujhe aayi hui fresh incoming ringing call (45s purani tak)
export async function getIncomingCall(uid) {
  const calls = await readCalls();
  const now = Date.now();
  const ringing = calls
    .filter(
      (c) =>
        c.to === uid &&
        c.state === 'ringing' &&
        now - new Date(c.updatedAt).getTime() < 45000
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return ringing[0] || null;
}

// ---------------- admin: delete user (account + saare messages/calls) ----------------

export async function deleteUser(id) {
  return withLock(async () => {
    const [users, msgs, calls] = await Promise.all([readUsers(), readMessages(), readCalls()]);
    const target = users.find((u) => u.id === id);
    if (!target) {
      const err = new Error('User not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    // user ko har jagah se hatao — blocked lists fammilne scrub karo
    const nextUsers = users
      .filter((u) => u.id !== id)
      .map((u) => (u.blocked?.length ? { ...u, blocked: u.blocked.filter((b) => b !== id) } : u));
    await writeUsers(nextUsers);
    await writeMessages(msgs.filter((m) => m.from !== id && m.to !== id));
    await writeCalls(calls.filter((c) => c.from !== id && c.to !== id));
    return { ok: true };
  });
}
