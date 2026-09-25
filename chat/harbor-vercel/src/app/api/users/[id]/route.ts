import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, handle, ok, readJson } from "@/lib/http";
import { HttpError, isUniqueError } from "@/lib/errors";
import { verifyPassword } from "@/lib/password";
import { publicUser, selfUser } from "@/lib/users";
import { assertBio, assertName, assertUsername, deleteAccountSchema, profileSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const { user } = await requireUser(req);
    const { id } = await ctx.params;
    if (id === user.id) return ok({ user: selfUser(user) });
    const other = await prisma.user.findUnique({ where: { id } });
    if (!other || other.accountStatus !== "ACTIVE" || !other.isPhoneVerified) {
      throw new HttpError(404, "User not found.");
    }
    return ok({ user: publicUser(other) });
  } catch (err) {
    return handle(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    assertSameOrigin(req);
    const { user } = await requireUser(req);
    const { id } = await ctx.params;
    if (id !== user.id) throw new HttpError(403, "You can only update your own profile.");
    const body = profileSchema.parse(await readJson(req));
    const data: { name?: string; username?: string; bio?: string } = {};
    if (body.name !== undefined) data.name = assertName(body.name);
    if (body.username !== undefined) data.username = assertUsername(body.username);
    if (body.bio !== undefined) data.bio = assertBio(body.bio);
    try {
      const updated = await prisma.user.update({ where: { id: user.id }, data });
      return ok({ message: "Profile updated", user: selfUser(updated) });
    } catch (err) {
      if (isUniqueError(err)) throw new HttpError(409, "That username is already taken.");
      throw err;
    }
  } catch (err) {
    return handle(err);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    assertSameOrigin(req);
    const { user } = await requireUser(req);
    const { id } = await ctx.params;
    if (id !== user.id) throw new HttpError(403, "You can only delete your own account.");
    const body = deleteAccountSchema.parse(await readJson(req));
    if (!user.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new HttpError(401, "Password is incorrect.");
    }
    await prisma.user.delete({ where: { id: user.id } });
    return ok({ message: "Account deleted" });
  } catch (err) {
    return handle(err);
  }
}
