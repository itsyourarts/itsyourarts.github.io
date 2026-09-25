import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/errors";
import { clientIp } from "@/lib/http";

export const ACCESS_COOKIE = "harbor_access";
export const REFRESH_COOKIE = "harbor_refresh";
export const ADMIN_COOKIE = "harbor_admin";

const ACCESS_TTL = "15m";
const ACCESS_TTL_SEC = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ADMIN_TTL_MS = 12 * 60 * 60 * 1000;
const ADMIN_TTL_SEC = 12 * 60 * 60;

function jwtKey() {
  const secret = process.env.JWT_SECRET ?? "";
  if (secret.length < 32) {
    throw new HttpError(500, "Server is misconfigured.");
  }
  if (process.env.NODE_ENV === "production") {
    const blocked = ["replace-with-a-long-random-string-at-least-32-chars", "changeme", "secret", "jwt_secret"];
    if (blocked.includes(secret) || secret.toLowerCase().includes("replace-with")) {
      throw new HttpError(500, "Server is misconfigured.");
    }
  }
  return new TextEncoder().encode(secret);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken() {
  return randomBytes(32).toString("base64url");
}

function cookieFlags(maxAge: number, path = "/") {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path,
    maxAge,
  };
}

export function readCookie(req: Request, name: string) {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return null;
}

async function signAccess(input: { sub: string; role: "user" | "admin"; sid: string }) {
  return new SignJWT({ role: input.role, sid: input.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .setIssuer("harbor")
    .setAudience(input.role)
    .sign(jwtKey());
}

async function signAdmin(input: { sub: string; sid: string }) {
  return new SignJWT({ role: "admin", sid: input.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.sub)
    .setIssuedAt()
    .setExpirationTime("12h")
    .setIssuer("harbor")
    .setAudience("admin")
    .sign(jwtKey());
}

export async function issueUserSession(userId: string, req: Request) {
  const refresh = newToken();
  const session = await prisma.session.create({
    data: {
      userId,
      refreshHash: hashToken(refresh),
      userAgent: req.headers.get("user-agent")?.slice(0, 240) ?? null,
      ip: clientIp(req),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  const access = await signAccess({ sub: userId, role: "user", sid: session.id });
  return { access, refresh, expiresIn: ACCESS_TTL_SEC };
}

export function applyUserSession(res: NextResponse, access: string, refresh: string) {
  res.cookies.set(ACCESS_COOKIE, access, cookieFlags(ACCESS_TTL_SEC));
  res.cookies.set(REFRESH_COOKIE, refresh, cookieFlags(30 * 24 * 60 * 60, "/api/auth"));
}

export function clearUserSession(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", cookieFlags(0));
  res.cookies.set(REFRESH_COOKIE, "", cookieFlags(0, "/api/auth"));
}

export async function issueAdminSession(adminId: string, req: Request) {
  const session = await prisma.adminSession.create({
    data: {
      adminId,
      userAgent: req.headers.get("user-agent")?.slice(0, 240) ?? null,
      ip: clientIp(req),
      expiresAt: new Date(Date.now() + ADMIN_TTL_MS),
    },
  });
  const access = await signAdmin({ sub: adminId, sid: session.id });
  return { access, expiresIn: ADMIN_TTL_SEC };
}

export function applyAdminSession(res: NextResponse, access: string) {
  res.cookies.set(ADMIN_COOKIE, access, cookieFlags(ADMIN_TTL_SEC));
}

export function clearAdminSession(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, "", cookieFlags(0));
}

async function readVerifiedToken(token: string, audience: "user" | "admin") {
  const { payload } = await jwtVerify(token, jwtKey(), { issuer: "harbor", audience });
  if (payload.role !== audience || typeof payload.sub !== "string" || typeof payload.sid !== "string") {
    return null;
  }
  return { sub: payload.sub, sid: payload.sid };
}

export async function getUserFromRequest(req: Request) {
  const header = req.headers.get("authorization");
  const token = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : readCookie(req, ACCESS_COOKIE);
  if (!token) return null;
  try {
    const verified = await readVerifiedToken(token, "user");
    if (!verified) return null;
    const session = await prisma.session.findUnique({
      where: { id: verified.sid },
      include: { user: true },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
    if (session.userId !== verified.sub) return null;
    if (session.user.accountStatus !== "ACTIVE") return null;
    if (!session.user.isPhoneVerified || !session.user.passwordHash) return null;
    return { user: session.user, session };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    return null;
  }
}

export async function requireUser(req: Request) {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new HttpError(401, "Please log in again.");
  return auth;
}

export async function getAdminFromRequest(req: Request) {
  const header = req.headers.get("authorization");
  const token = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : readCookie(req, ADMIN_COOKIE);
  if (!token) return null;
  try {
    const verified = await readVerifiedToken(token, "admin");
    if (!verified) return null;
    const session = await prisma.adminSession.findUnique({
      where: { id: verified.sid },
      include: { admin: true },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
    if (session.adminId !== verified.sub) return null;
    return { admin: session.admin, session };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    return null;
  }
}

export async function requireAdmin(req: Request) {
  const auth = await getAdminFromRequest(req);
  if (!auth) throw new HttpError(401, "Admin login required.");
  return auth;
}

export async function rotateUserSession(refreshToken: string, req: Request) {
  const session = await prisma.session.findUnique({ where: { refreshHash: hashToken(refreshToken) } });
  if (!session) throw new HttpError(401, "Session expired. Please log in again.");
  if (session.revokedAt) {
    await prisma.session.updateMany({
      where: { userId: session.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new HttpError(401, "Session expired. Please log in again.");
  }
  if (session.expiresAt < new Date()) throw new HttpError(401, "Session expired. Please log in again.");
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.accountStatus !== "ACTIVE") throw new HttpError(401, "Session expired. Please log in again.");
  await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  return issueUserSession(session.userId, req);
}

export function bearerOrCookieRefresh(req: Request, bodyToken?: string) {
  if (bodyToken) return bodyToken;
  return readCookie(req, REFRESH_COOKIE);
}
