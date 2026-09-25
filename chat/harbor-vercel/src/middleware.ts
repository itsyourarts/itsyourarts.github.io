import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function hasRole(token: string | undefined, audience: "user" | "admin") {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret || secret.length < 32) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "harbor",
      audience,
    });
    return payload.role === audience && typeof payload.sid === "string" && typeof payload.sub === "string";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const ok = await hasRole(req.cookies.get("harbor_admin")?.value, "admin");
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  if (pathname.startsWith("/app")) {
    const ok = await hasRole(req.cookies.get("harbor_access")?.value, "user");
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin", "/admin/:path*"],
};
