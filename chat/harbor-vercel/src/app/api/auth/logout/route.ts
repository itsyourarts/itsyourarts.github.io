import { prisma } from "@/lib/prisma";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearUserSession, getUserFromRequest, hashToken, readCookie } from "@/lib/auth";
import { assertSameOrigin, handle, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const auth = await getUserFromRequest(req);
    if (auth) {
      await prisma.session.updateMany({
        where: { id: auth.session.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await prisma.user.update({
        where: { id: auth.user.id },
        data: { status: "OFFLINE", lastSeenAt: new Date() },
      });
    }
    const refresh = readCookie(req, REFRESH_COOKIE);
    if (refresh) {
      await prisma.session.updateMany({
        where: { refreshHash: hashToken(refresh), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    const res = ok({ message: "Logged out" });
    clearUserSession(res);
    res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    return handle(err);
  }
}
