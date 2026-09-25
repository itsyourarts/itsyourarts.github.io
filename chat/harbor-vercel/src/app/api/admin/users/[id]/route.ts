import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { assertSameOrigin, clientIp, handle, ok, readJson } from "@/lib/http";
import { HttpError } from "@/lib/errors";
import { adminUser } from "@/lib/users";
import { adminUserPatchSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    await requireAdmin(req);
    const { id } = await ctx.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, "User not found.");
    return ok({ user: adminUser(user) });
  } catch (err) {
    return handle(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    assertSameOrigin(req);
    const { admin } = await requireAdmin(req);
    const { id } = await ctx.params;
    const body = adminUserPatchSchema.parse(await readJson(req));
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "User not found.");
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          accountStatus: body.accountStatus,
          ...(body.accountStatus === "DISABLED" ? { status: "OFFLINE" } : {}),
        },
      });
      if (body.accountStatus === "DISABLED") {
        await tx.session.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      return updated;
    });
    await writeAudit({
      adminId: admin.id,
      action: body.accountStatus === "DISABLED" ? "user.disable" : "user.enable",
      target: id,
      ip: clientIp(req),
      metadata: { username: user.username },
    });
    return ok({ message: body.accountStatus === "DISABLED" ? "User disabled" : "User enabled", user: adminUser(user) });
  } catch (err) {
    return handle(err);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    assertSameOrigin(req);
    const { admin } = await requireAdmin(req);
    const { id } = await ctx.params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "User not found.");
    await prisma.user.delete({ where: { id } });
    await writeAudit({
      adminId: admin.id,
      action: "user.delete",
      target: id,
      ip: clientIp(req),
      metadata: { username: existing.username, phone: existing.phone },
    });
    return ok({ message: "User deleted" });
  } catch (err) {
    return handle(err);
  }
}
