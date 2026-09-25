import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handle, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const limit = Math.min(50, Math.max(1, Number(new URL(req.url).searchParams.get("limit") ?? "12") || 12));
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { admin: { select: { username: true } } },
    });
    return ok({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        target: log.target,
        ip: log.ip,
        createdAt: log.createdAt.toISOString(),
        admin: log.admin?.username ?? null,
      })),
    });
  } catch (err) {
    return handle(err);
  }
}
