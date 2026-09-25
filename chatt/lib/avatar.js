// DP (profile picture) upload
// PRODUCTION: Vercel Blob me file save hoti hai
// LOCAL DEV:  public/avatars/ me save hoti hai
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

const EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function uploadAvatar(uid, file) {
  const ext = EXT[file.type];
  if (!ext) throw new Error('Only JPG, PNG, WEBP or GIF images are allowed');
  if (file.size > 2 * 1024 * 1024) throw new Error('Image must be under 2MB');

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `avatars/${uid}-${Date.now()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, buf, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  }

  // local dev fallback
  const dir = path.join(process.cwd(), 'public', 'avatars');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, path.basename(name)), buf);
  return `/media/avatars/${path.basename(name)}`;
}
