import { prisma } from "@/lib/prisma";
import { clearAdminSession, getAdminFromRequest } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { assertSameOrigin, clientIp, handle, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const auth = await getAdminFromRequest(req);
    if (auth) {
      await prisma.adminSession.updateMany({
        where: { id: auth.session.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await writeAudit({ adminId: auth.admin.id, action: "admin.logout", ip: clientIp(req) });
    }
    const res = ok({ message: "Logged out" });
    clearAdminSession(res);
    return res;
  } catch (err) {
    return handle(err);
  }
}
