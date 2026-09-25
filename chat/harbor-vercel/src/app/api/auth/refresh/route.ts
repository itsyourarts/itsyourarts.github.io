import { applyUserSession, bearerOrCookieRefresh, rotateUserSession } from "@/lib/auth";
import { assertSameOrigin, handle, ok, wantsMobileTokens } from "@/lib/http";
import { HttpError } from "@/lib/errors";
import { refreshSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    let bodyToken: string | undefined;
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const parsed = refreshSchema.parse(await req.json().catch(() => ({})));
      bodyToken = parsed.refreshToken;
    }
    const refreshToken = bearerOrCookieRefresh(req, bodyToken);
    if (!refreshToken) throw new HttpError(401, "Session expired. Please log in again.");
    const session = await rotateUserSession(refreshToken, req);
    const res = ok({
      message: "Session refreshed",
      ...(wantsMobileTokens(req)
        ? { accessToken: session.access, refreshToken: session.refresh, expiresIn: session.expiresIn }
        : {}),
    });
    applyUserSession(res, session.access, session.refresh);
    return res;
  } catch (err) {
    return handle(err);
  }
}
