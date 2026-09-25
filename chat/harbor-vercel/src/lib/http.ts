import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/errors";

export function ok(data: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function fail(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
  headers?: Record<string, string>,
) {
  const res = NextResponse.json({ success: false, message, ...(extra ?? {}) }, { status });
  if (headers) {
    for (const [key, value] of Object.entries(headers)) res.headers.set(key, value);
  }
  return res;
}

export async function readJson(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "Expected a JSON body.");
  }
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}

export function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim().slice(0, 80) || "unknown";
  return (req.headers.get("x-real-ip") ?? "unknown").slice(0, 80);
}

export function wantsMobileTokens(req: Request) {
  return req.headers.get("x-client") === "mobile";
}

export function assertSameOrigin(req: Request) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return;
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return;
  if (req.headers.get("x-client") === "mobile") return;

  const origin = req.headers.get("origin");
  const configured = (process.env.APP_ORIGIN ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    if (!origin || !configured.includes(origin)) {
      throw new HttpError(403, "Cross-origin request blocked.");
    }
    return;
  }

  const host = req.headers.get("host");
  if (!origin || !host) return;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Cross-origin request blocked.");
  }
  if (originHost !== host) throw new HttpError(403, "Cross-origin request blocked.");
}

export function handle(err: unknown) {
  if (err instanceof HttpError) {
    const headers: Record<string, string> = {};
    if (typeof err.extra?.retryAfterSec === "number") {
      headers["Retry-After"] = String(err.extra.retryAfterSec);
    }
    return fail(err.message, err.status, err.extra, headers);
  }
  if (err instanceof ZodError) {
    return fail(err.issues[0]?.message ?? "Invalid input", 422);
  }
  console.error("[harbor]", err);
  return fail("Something went wrong. Please try again.", 500);
}
