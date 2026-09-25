import { prisma } from "@/lib/prisma";
import { verifyMetaSignature, verifyWebhookToken } from "@/lib/meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && verifyWebhookToken(token) && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }
  try {
    const body = JSON.parse(raw) as { entry?: Array<{ changes?: Array<{ field?: string }> }> };
    const sawEvent = (body.entry ?? []).some((entry) => (entry.changes ?? []).some((change) => change.field === "messages"));
    if (sawEvent) {
      await prisma.whatsAppConnection.updateMany({
        where: { id: "global" },
        data: { lastCheckedAt: new Date() },
      });
    }
  } catch (err) {
    console.error("[harbor] WhatsApp webhook acknowledged with unreadable payload");
  }
  return Response.json({ success: true });
}
