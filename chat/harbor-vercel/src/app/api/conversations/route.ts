import { requireUser } from "@/lib/auth";
import { listConversations } from "@/lib/chat";
import { handle, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { user } = await requireUser(req);
    const conversations = await listConversations(user.id);
    return ok({ conversations });
  } catch (err) {
    return handle(err);
  }
}
