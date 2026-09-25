import { assertSameOrigin, clientIp, handle, ok, readJson } from "@/lib/http";
import { HttpError } from "@/lib/errors";
import { normalizePhone } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";
import { verifySignupOtp } from "@/lib/signup";
import { verifyOtpSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = verifyOtpSchema.parse(await readJson(req));
    const phone = normalizePhone(body.phone);
    if (!phone) throw new HttpError(422, "Enter a valid phone number with country code.");
    const ip = clientIp(req);
    await rateLimit(`otp-verify:phone:${phone}`, 10, 15 * 60 * 1000);
    await rateLimit(`otp-verify:ip:${ip}`, 20, 60 * 60 * 1000);
    const result = await verifySignupOtp(phone, body.otp);
    return ok(result);
  } catch (err) {
    return handle(err);
  }
}
