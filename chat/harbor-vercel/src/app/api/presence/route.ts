import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, handle, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { user } = await requireUser(req);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { status: "ONLINE", lastSeenAt: new Date() },
    });
    return ok({ status: "ONLINE", lastSeenAt: updated.lastSeenAt?.toISOString() ?? null });
  } catch (err) {
    return handle(err);
  }
}
