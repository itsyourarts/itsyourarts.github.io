import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ message: "ok", time: new Date().toISOString() });
  } catch (err) {
    console.error("[harbor] health check failed", err);
    return fail("Database unavailable", 503);
  }
}
