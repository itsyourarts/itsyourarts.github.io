import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { assertSameOrigin, clientIp, handle, ok } from "@/lib/http";
import { deleteWhatsAppConnection } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    assertSameOrigin(req);
    const { admin } = await requireAdmin(req);
    const connection = await deleteWhatsAppConnection();
    await writeAudit({ adminId: admin.id, action: "whatsapp.delete", ip: clientIp(req) });
    return ok({ message: "WhatsApp connection deleted", connection });
  } catch (err) {
    return handle(err);
  }
}
