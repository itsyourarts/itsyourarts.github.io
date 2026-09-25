import { prisma } from "@/lib/prisma";
import { applyUserSession, issueUserSession } from "@/lib/auth";
import { assertSameOrigin, clientIp, handle, ok, readJson, wantsMobileTokens } from "@/lib/http";
import { HttpError } from "@/lib/errors";
import { normalizePhone } from "@/lib/phone";
import { consumePasswordTime, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { selfUser } from "@/lib/users";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findUser(identifier: string) {
  const trimmed = identifier.trim();
  if (/[a-zA-Z_]/.test(trimmed) && !trimmed.startsWith("+")) {
    return prisma.user.findUnique({ where: { username: trimmed.toLowerCase() } });
  }
  const phone = normalizePhone(trimmed);
  if (phone) {
    const byPhone = await prisma.user.findUnique({ where: { phone } });
    if (byPhone) return byPhone;
  }
  return prisma.user.findUnique({ where: { username: trimmed.toLowerCase() } });
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = loginSchema.parse(await readJson(req));
    const ip = clientIp(req);
    const key = body.identifier.trim().toLowerCase();
    await rateLimit(`login:id:${key}`, 8, 15 * 60 * 1000);
    await rateLimit(`login:ip:${ip}`, 30, 15 * 60 * 1000);

    const user = await findUser(body.identifier);
    if (!user || !user.passwordHash) {
      await consumePasswordTime(body.password);
      throw new HttpError(401, "Invalid username/phone or password.");
    }
    const matches = await verifyPassword(body.password, user.passwordHash);
    if (!matches) throw new HttpError(401, "Invalid username/phone or password.");
    if (user.accountStatus !== "ACTIVE") {
      throw new HttpError(403, "This account has been disabled.");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastSeenAt: new Date(), status: "ONLINE" },
    });
    const session = await issueUserSession(updated.id, req);
    const res = ok({
      message: "Logged in",
      user: selfUser(updated),
      ...(wantsMobileTokens(req)
        ? { accessToken: session.access, refreshToken: session.refresh, expiresIn: session.expiresIn }
        : {}),
    });
    applyUserSession(res, session.access, session.refresh);
    return res;
  } catch (err) {
    return handle(err);
  }
}
