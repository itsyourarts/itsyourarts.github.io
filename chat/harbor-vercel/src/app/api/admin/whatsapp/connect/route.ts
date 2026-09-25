import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { assertSameOrigin, clientIp, handle, ok } from "@/lib/http";
import { connectWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { admin } = await requireAdmin(req);
    const connection = await connectWhatsApp();
    await writeAudit({
      adminId: admin.id,
      action: "whatsapp.connect",
      target: connection.providerConnectionId,
      ip: clientIp(req),
      metadata: { status: connection.status, provider: connection.provider },
    });
    return ok({
      message: connection.status === "CONNECTED" ? "WhatsApp connected" : "WhatsApp connection checked",
      connection,
    });
  } catch (err) {
    return handle(err);
  }
}
