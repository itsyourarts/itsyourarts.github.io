// Chat image upload — Blob (production) ya public/chat-images (local dev)
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

const EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const AUDIO_EXT = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-m4a': 'm4a',
  'video/webm': 'webm', // kuch browsers voice note ko video/webm dete hain
};

async function saveFile(kind, uid, file, ext, maxMb) {
  if (!ext) throw new Error('Unsupported file type');
  if (file.size > maxMb * 1024 * 1024) throw new Error(`File must be under ${maxMb}MB`);

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${kind}/${uid}-${Date.now()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, buf, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), 'public', kind === 'chat' ? 'chat-images' : 'voice-notes');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, path.basename(name)), buf);
  // /media/* route se serve hoti hai (prod me public/ runtime files direct nahi chalti)
  return `/media/${kind === 'chat' ? 'chat-images' : 'voice-notes'}/${path.basename(name)}`;
}

export async function uploadChatImage(uid, file) {
  const base = (file.type || '').split(';')[0];
  return saveFile('chat', uid, file, EXT[base], 5);
}

export async function uploadVoice(uid, file) {
  const base = (file.type || '').split(';')[0];
  return saveFile('voice', uid, file, AUDIO_EXT[base] || 'webm', 5);
}
