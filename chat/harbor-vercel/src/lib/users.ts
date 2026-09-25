import type { User } from "@prisma/client";

export const ONLINE_WINDOW_MS = 60_000;
export const ACTIVE_WINDOW_MS = 15 * 60_000;

export function effectivePresence(user: { status: string; lastSeenAt: Date | null; accountStatus: string }) {
  if (user.accountStatus === "DISABLED") return "DISABLED";
  if (!user.lastSeenAt) return "OFFLINE";
  if (Date.now() - user.lastSeenAt.getTime() > ONLINE_WINDOW_MS) return "OFFLINE";
  return user.status === "ONLINE" ? "ONLINE" : "OFFLINE";
}

export function publicUser(user: Pick<User, "id" | "name" | "username" | "status" | "lastSeenAt" | "accountStatus">) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    status: effectivePresence(user),
    lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
  };
}

export function selfUser(user: User) {
  return {
    ...publicUser(user),
    phone: user.phone,
    bio: user.bio,
    isPhoneVerified: user.isPhoneVerified,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export function adminUser(user: User) {
  const presence = effectivePresence(user);
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    phone: user.phone,
    bio: user.bio,
    isPhoneVerified: user.isPhoneVerified,
    verification: user.isPhoneVerified ? "Verified" : "Unverified",
    status: user.accountStatus === "DISABLED" ? "Disabled" : presence === "ONLINE" ? "Active" : "Offline",
    presence,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
  };
}

export function initials(name?: string | null, username?: string | null) {
  const source = (name || username || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}
