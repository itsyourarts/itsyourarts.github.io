import { prisma } from "@/lib/prisma";
import { HttpError, isUniqueError } from "@/lib/errors";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const bucket = await increment(key, windowStart);
  if (bucket.count > limit) {
    const retryAfterSec = Math.max(1, Math.ceil((windowStart.getTime() + windowMs - Date.now()) / 1000));
    throw new HttpError(429, "Too many attempts. Try again later.", { retryAfterSec });
  }
  if (Math.random() < 0.02) {
    prisma.rateLimitBucket
      .deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) } } })
      .catch(() => undefined);
  }
}

async function increment(key: string, windowStart: Date) {
  try {
    return await prisma.rateLimitBucket.upsert({
      where: { key_windowStart: { key, windowStart } },
      update: { count: { increment: 1 } },
      create: { key, windowStart, count: 1 },
    });
  } catch (err) {
    if (!isUniqueError(err)) throw err;
    return prisma.rateLimitBucket.update({
      where: { key_windowStart: { key, windowStart } },
      data: { count: { increment: 1 } },
    });
  }
}
