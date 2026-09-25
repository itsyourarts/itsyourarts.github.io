import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { assertSameOrigin, clientIp, handle, ok } from "@/lib/http";
import { disconnectWhatsApp } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const { admin } = await requireAdmin(req);
    const connection = await disconnectWhatsApp();
    await writeAudit({ adminId: admin.id, action: "whatsapp.disconnect", ip: clientIp(req) });
    return ok({ message: "WhatsApp disconnected", connection });
  } catch (err) {
    return handle(err);
  }
}
