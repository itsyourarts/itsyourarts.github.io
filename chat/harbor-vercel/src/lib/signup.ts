import { prisma } from "@/lib/prisma";
import { HttpError, isUniqueError } from "@/lib/errors";
import { hashPassword } from "@/lib/password";
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  SIGNUP_TICKET_TTL_MS,
  generateOtp,
  hashOtp,
  hashSecret,
  newSecret,
  verifyOtpHash,
} from "@/lib/otp";
import { assertName, assertUsername } from "@/lib/validation";
import { currentOtpProvider, devOtpAllowed, getWhatsAppProvider } from "@/lib/whatsapp";

export async function sendSignupOtp(phone: string) {
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    throw new HttpError(409, "This phone number is already registered. Please log in.");
  }

  const providerName = currentOtpProvider();
  const provider = getWhatsAppProvider();
  await prisma.otpChallenge.updateMany({
    where: { phone, purpose: "SIGNUP", consumedAt: null },
    data: { consumedAt: new Date() },
  });

  if (providerName === "twilio") {
    await provider.sendOTP(phone, "000000");
    await prisma.otpChallenge.create({
      data: {
        phone,
        codeHash: "external",
        provider: "twilio",
        purpose: "SIGNUP",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });
    return { message: "OTP sent" };
  }

  const code = generateOtp();
  await provider.sendOTP(phone, code);
  await prisma.otpChallenge.create({
    data: {
      phone,
      codeHash: hashOtp(phone, code),
      provider: providerName,
      purpose: "SIGNUP",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  return {
    message: "OTP sent",
    ...(devOtpAllowed() ? { devOtp: code } : {}),
  };
}

export async function verifySignupOtp(phone: string, otp: string) {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { phone, purpose: "SIGNUP", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!challenge || challenge.expiresAt < new Date()) {
    throw new HttpError(400, "Code expired. Request a new one.");
  }
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    throw new HttpError(429, "Too many incorrect attempts. Request a new code.");
  }

  const checked = await getWhatsAppProvider().verifyOTP(phone, otp);
  const approved = checked.mode === "provider" ? checked.approved : verifyOtpHash(phone, otp, challenge.codeHash);
  if (!approved) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    throw new HttpError(400, "Invalid OTP");
  }

  const signupTicket = newSecret();
  await prisma.$transaction([
    prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } }),
    prisma.signupTicket.updateMany({
      where: { phone, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.signupTicket.create({
      data: {
        phone,
        tokenHash: hashSecret(signupTicket),
        expiresAt: new Date(Date.now() + SIGNUP_TICKET_TTL_MS),
      },
    }),
  ]);
  return { message: "OTP verified", signupTicket };
}

export async function createAccount(input: {
  signupTicket: string;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
}) {
  if (input.password !== input.confirmPassword) {
    throw new HttpError(422, "Passwords do not match.");
  }
  const name = assertName(input.name);
  const username = assertUsername(input.username);
  const ticket = await prisma.signupTicket.findUnique({
    where: { tokenHash: hashSecret(input.signupTicket) },
  });
  if (!ticket || ticket.usedAt || ticket.expiresAt < new Date()) {
    throw new HttpError(401, "Verification expired. Request a new code.");
  }
  const passwordHash = await hashPassword(input.password);
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.signupTicket.findUnique({ where: { id: ticket.id } });
      if (!current || current.usedAt || current.expiresAt < new Date()) {
        throw new HttpError(401, "Verification expired. Request a new code.");
      }
      const user = await tx.user.create({
        data: {
          name,
          username,
          phone: current.phone,
          passwordHash,
          isPhoneVerified: true,
          status: "OFFLINE",
          accountStatus: "ACTIVE",
        },
      });
      await tx.signupTicket.update({ where: { id: current.id }, data: { usedAt: new Date() } });
      return user;
    });
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (isUniqueError(err)) throw new HttpError(409, "Username or phone is already registered.");
    throw err;
  }
}
