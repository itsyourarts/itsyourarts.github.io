import { applyUserSession, issueUserSession } from "@/lib/auth";
import { assertStrongPassword } from "@/lib/password";
import { assertSameOrigin, clientIp, handle, ok, readJson, wantsMobileTokens } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createAccount } from "@/lib/signup";
import { selfUser } from "@/lib/users";
import { signupSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await rateLimit(`signup:ip:${clientIp(req)}`, 10, 60 * 60 * 1000);
    const body = signupSchema.parse(await readJson(req));
    assertStrongPassword(body.password);
    const user = await createAccount(body);
    const session = await issueUserSession(user.id, req);
    const res = ok({
      message: "Account created",
      user: selfUser(user),
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
