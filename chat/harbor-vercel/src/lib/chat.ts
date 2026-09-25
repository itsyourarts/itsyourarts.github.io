import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicUser } from "@/lib/users";

type ConvRow = {
  partnerId: string;
  messageId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  readAt: Date | null;
  name: string | null;
  username: string | null;
  status: string;
  accountStatus: string;
  lastSeenAt: Date | null;
  unreadCount: number;
};

export async function listConversations(userId: string) {
  const rows = await prisma.$queryRaw<ConvRow[]>(Prisma.sql`
    WITH msgs AS (
      SELECT
        CASE WHEN "senderId" = ${userId} THEN "receiverId" ELSE "senderId" END AS "partnerId",
        id,
        "senderId",
        message,
        "createdAt",
        "readAt",
        ROW_NUMBER() OVER (
          PARTITION BY CASE WHEN "senderId" = ${userId} THEN "receiverId" ELSE "senderId" END
          ORDER BY "createdAt" DESC
        ) AS rn
      FROM messages
      WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
    )
    SELECT
      m."partnerId" AS "partnerId",
      m.id AS "messageId",
      m."senderId" AS "senderId",
      m.message AS message,
      m."createdAt" AS "createdAt",
      m."readAt" AS "readAt",
      u.name AS name,
      u.username AS username,
      u.status AS status,
      u."accountStatus" AS "accountStatus",
      u."lastSeenAt" AS "lastSeenAt",
      (
        SELECT COUNT(*)::int
        FROM messages um
        WHERE um."senderId" = m."partnerId"
          AND um."receiverId" = ${userId}
          AND um."readAt" IS NULL
      ) AS "unreadCount"
    FROM msgs m
    JOIN users u ON u.id = m."partnerId"
    WHERE m.rn = 1
    ORDER BY m."createdAt" DESC
  `);

  return rows.map((row) => ({
    user: publicUser({
      id: row.partnerId,
      name: row.name,
      username: row.username,
      status: row.status,
      lastSeenAt: row.lastSeenAt,
      accountStatus: row.accountStatus,
    }),
    lastMessage: {
      id: row.messageId,
      senderId: row.senderId,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
      readAt: row.readAt?.toISOString() ?? null,
    },
    unreadCount: Number(row.unreadCount) || 0,
  }));
}
