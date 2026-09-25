import { requireAdmin } from "@/lib/auth";
import { handle, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { admin } = await requireAdmin(req);
    return ok({
      admin: { id: admin.id, username: admin.username, createdAt: admin.createdAt.toISOString() },
    });
  } catch (err) {
    return handle(err);
  }
}
