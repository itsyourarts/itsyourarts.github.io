import { assertSameOrigin, clientIp, handle, ok, readJson } from "@/lib/http";
import { normalizePhone } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";
import { sendSignupOtp } from "@/lib/signup";
import { sendOtpSchema } from "@/lib/validation";
import { HttpError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = sendOtpSchema.parse(await readJson(req));
    const phone = normalizePhone(body.phone);
    if (!phone) throw new HttpError(422, "Enter a valid phone number with country code.");
    const ip = clientIp(req);
    await rateLimit(`otp:phone:${phone}`, 3, 15 * 60 * 1000);
    await rateLimit(`otp:ip:${ip}`, 10, 60 * 60 * 1000);
    const result = await sendSignupOtp(phone);
    return ok(result);
  } catch (err) {
    return handle(err);
  }
}
