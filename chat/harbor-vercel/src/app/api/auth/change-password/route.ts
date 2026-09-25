import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, handle, ok, readJson } from "@/lib/http";
import { HttpError } from "@/lib/errors";
import { assertStrongPassword, hashPassword, verifyPassword } from "@/lib/password";
import { changePasswordSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { user, session } = await requireUser(req);
    const body = changePasswordSchema.parse(await readJson(req));
    if (body.newPassword !== body.confirmPassword) throw new HttpError(422, "Passwords do not match.");
    assertStrongPassword(body.newPassword);
    if (!user.passwordHash) throw new HttpError(400, "This account has no password yet.");
    const matches = await verifyPassword(body.currentPassword, user.passwordHash);
    if (!matches) throw new HttpError(401, "Current password is incorrect.");
    const passwordHash = await hashPassword(body.newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null, id: { not: session.id } },
        data: { revokedAt: new Date() },
      }),
    ]);
    return ok({ message: "Password updated" });
  } catch (err) {
    return handle(err);
  }
}
