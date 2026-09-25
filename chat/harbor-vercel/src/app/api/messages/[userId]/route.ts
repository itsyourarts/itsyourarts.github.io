import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, ok } from "@/lib/http";
import { HttpError } from "@/lib/errors";
import { publicUser } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ userId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const { user } = await requireUser(req);
    const { userId } = await ctx.params;
    if (userId === user.id) throw new HttpError(422, "You cannot message yourself.");
    const other = await prisma.user.findUnique({ where: { id: userId } });
    if (!other) throw new HttpError(404, "User not found.");

    const url = new URL(req.url);
    const before = url.searchParams.get("before");
    let cursorDate: Date | null = null;
    if (before) {
      const cursor = await prisma.message.findUnique({ where: { id: before } });
      if (cursor && (cursor.senderId === user.id || cursor.receiverId === user.id)) {
        cursorDate = cursor.createdAt;
      }
    }

    const rows = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: other.id },
          { senderId: other.id, receiverId: user.id },
        ],
        ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (!before) {
      await prisma.message.updateMany({
        where: { senderId: other.id, receiverId: user.id, readAt: null },
        data: { readAt: new Date() },
      });
    }

    const messages = rows.reverse().map((item) => ({
      id: item.id,
      senderId: item.senderId,
      receiverId: item.receiverId,
      message: item.message,
      createdAt: item.createdAt.toISOString(),
      readAt: item.senderId === other.id && !before ? item.readAt?.toISOString() ?? new Date().toISOString() : item.readAt?.toISOString() ?? null,
    }));

    return ok({
      user: publicUser(other),
      messages,
      hasMore: rows.length === 50,
    });
  } catch (err) {
    return handle(err);
  }
}
