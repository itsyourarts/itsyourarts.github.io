import { createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";

function pepper() {
  const value = process.env.OTP_PEPPER || process.env.JWT_SECRET;
  if (!value || value.length < 16) {
    throw new Error("OTP pepper is not configured");
  }
  return value;
}

export function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtp(phone: string, code: string) {
  return createHmac("sha256", pepper()).update(`${phone}:${code}`).digest("hex");
}

export function verifyOtpHash(phone: string, code: string, hash: string) {
  const next = hashOtp(phone, code);
  const left = Buffer.from(next);
  const right = Buffer.from(hash);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function newSecret(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashSecret(value: string) {
  return createHmac("sha256", pepper()).update(value).digest("hex");
}

export const OTP_TTL_MS = 5 * 60 * 1000;
export const SIGNUP_TICKET_TTL_MS = 15 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
