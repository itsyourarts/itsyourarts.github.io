import { prisma } from "@/lib/prisma";
import { applyAdminSession, issueAdminSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { assertSameOrigin, clientIp, handle, ok, readJson } from "@/lib/http";
import { HttpError } from "@/lib/errors";
import { consumePasswordTime, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = adminLoginSchema.parse(await readJson(req));
    const ip = clientIp(req);
    const username = body.username.trim();
    await rateLimit(`admin-login:user:${username.toLowerCase()}`, 5, 15 * 60 * 1000);
    await rateLimit(`admin-login:ip:${ip}`, 10, 15 * 60 * 1000);

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      await consumePasswordTime(body.password);
      await writeAudit({ action: "admin.login_failed", ip, metadata: { username } });
      throw new HttpError(401, "Invalid username or password.");
    }
    const matches = await verifyPassword(body.password, admin.passwordHash);
    if (!matches) {
      await writeAudit({ adminId: admin.id, action: "admin.login_failed", ip });
      throw new HttpError(401, "Invalid username or password.");
    }
    const session = await issueAdminSession(admin.id, req);
    await writeAudit({ adminId: admin.id, action: "admin.login", ip });
    const res = ok({
      message: "Logged in",
      admin: { id: admin.id, username: admin.username },
    });
    applyAdminSession(res, session.access);
    return res;
  } catch (err) {
    return handle(err);
  }
}
