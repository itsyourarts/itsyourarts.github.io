import { requireUser } from "@/lib/auth";
import { handle, ok } from "@/lib/http";
import { selfUser } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { user } = await requireUser(req);
    return ok({ user: selfUser(user) });
  } catch (err) {
    return handle(err);
  }
}
