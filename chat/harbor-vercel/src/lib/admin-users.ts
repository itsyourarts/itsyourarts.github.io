import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ACTIVE_WINDOW_MS, adminUser } from "@/lib/users";

const SORTS = {
  name: "name",
  username: "username",
  phone: "phone",
  createdAt: "createdAt",
  lastLoginAt: "lastLoginAt",
  verification: "isPhoneVerified",
  status: "accountStatus",
} as const;

export async function userStats() {
  const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MS);
  const [totalUsers, verifiedUsers, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPhoneVerified: true } }),
    prisma.user.count({
      where: { accountStatus: "ACTIVE", lastSeenAt: { gte: activeSince } },
    }),
  ]);
  return { totalUsers, verifiedUsers, activeUsers };
}

export async function queryUsers(input: {
  q?: string;
  page: number;
  pageSize: number;
  sort?: string;
  order?: string;
  status?: string;
  verification?: string;
}) {
  const page = Number.isFinite(input.page) && input.page > 0 ? Math.floor(input.page) : 1;
  const pageSize = Math.min(100, Math.max(1, input.pageSize || 20));
  const sortKey = SORTS[(input.sort ?? "createdAt") as keyof typeof SORTS] ?? "createdAt";
  const order = input.order === "asc" ? "asc" : "desc";
  const and: Prisma.UserWhereInput[] = [];
  const q = input.q?.trim();
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { phone: { contains: q.replace(/\s/g, "") } },
      ],
    });
  }
  if (input.verification === "verified") and.push({ isPhoneVerified: true });
  if (input.verification === "unverified") and.push({ isPhoneVerified: false });
  if (input.status === "disabled") and.push({ accountStatus: "DISABLED" });
  if (input.status === "online") {
    and.push({
      accountStatus: "ACTIVE",
      lastSeenAt: { gte: new Date(Date.now() - 60_000) },
      status: "ONLINE",
    });
  }
  if (input.status === "offline") {
    and.push({ accountStatus: "ACTIVE" });
    and.push({
      OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: new Date(Date.now() - 60_000) } }, { status: { not: "ONLINE" } }],
    });
  }

  const where: Prisma.UserWhereInput = and.length ? { AND: and } : {};
  const [total, rows, stats] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [sortKey]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    userStats(),
  ]);

  return {
    stats,
    users: rows.map(adminUser),
    page,
    pageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}
