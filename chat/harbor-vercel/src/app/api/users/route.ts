import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { handle, ok } from "@/lib/http";
import { publicUser } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { user } = await requireUser(req);
    const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) return ok({ users: [] });
    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        accountStatus: "ACTIVE",
        isPhoneVerified: true,
        OR: [
          { username: { contains: q.toLowerCase(), mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { username: "asc" },
      take: 20,
    });
    return ok({ users: users.map(publicUser) });
  } catch (err) {
    return handle(err);
  }
}
