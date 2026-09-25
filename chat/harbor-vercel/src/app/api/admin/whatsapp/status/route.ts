import { requireAdmin } from "@/lib/auth";
import { handle, ok } from "@/lib/http";
import { refreshWhatsAppStatus } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const connection = await refreshWhatsAppStatus();
    return ok({ connection });
  } catch (err) {
    return handle(err);
  }
}
