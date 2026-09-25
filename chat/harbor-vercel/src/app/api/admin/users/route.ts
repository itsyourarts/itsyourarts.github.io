import { requireAdmin } from "@/lib/auth";
import { queryUsers } from "@/lib/admin-users";
import { handle, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
    const result = await queryUsers({
      q: url.searchParams.get("q") ?? undefined,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 20,
      sort: url.searchParams.get("sort") ?? undefined,
      order: url.searchParams.get("order") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      verification: url.searchParams.get("verification") ?? undefined,
    });
    return ok(result);
  } catch (err) {
    return handle(err);
  }
}
