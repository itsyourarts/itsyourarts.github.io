import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function writeAudit(input: {
  adminId?: string | null;
  action: string;
  target?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      adminId: input.adminId ?? null,
      action: input.action,
      target: input.target ?? null,
      metadata: input.metadata,
      ip: input.ip ?? null,
    },
  });
}
