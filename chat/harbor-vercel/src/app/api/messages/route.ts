import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, handle, ok, readJson } from "@/lib/http";
import { HttpError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { cleanMessage, messageSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { user } = await requireUser(req);
    await rateLimit(`msg:${user.id}`, 30, 60 * 1000);
    const body = messageSchema.parse(await readJson(req));
    const text = cleanMessage(body.message);
    if (body.receiverId === user.id) throw new HttpError(422, "You cannot message yourself.");
    const receiver = await prisma.user.findUnique({ where: { id: body.receiverId } });
    if (!receiver || !receiver.isPhoneVerified) throw new HttpError(404, "User not found.");
    if (receiver.accountStatus !== "ACTIVE") throw new HttpError(403, "That account is disabled.");
    const message = await prisma.message.create({
      data: { senderId: user.id, receiverId: receiver.id, message: text },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ONLINE", lastSeenAt: new Date() },
    });
    return ok({
      message: "Message sent",
      item: {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        message: message.message,
        createdAt: message.createdAt.toISOString(),
        readAt: null,
      },
    });
  } catch (err) {
    return handle(err);
  }
}
