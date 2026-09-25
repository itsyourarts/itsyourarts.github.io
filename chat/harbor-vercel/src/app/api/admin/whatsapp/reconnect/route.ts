import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { assertSameOrigin, clientIp, handle, ok } from "@/lib/http";
import { reconnectWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { admin } = await requireAdmin(req);
    const connection = await reconnectWhatsApp();
    await writeAudit({
      adminId: admin.id,
      action: "whatsapp.reconnect",
      ip: clientIp(req),
      metadata: { status: connection.status, provider: connection.provider },
    });
    return ok({ message: "Reconnect checked", connection });
  } catch (err) {
    return handle(err);
  }
}
