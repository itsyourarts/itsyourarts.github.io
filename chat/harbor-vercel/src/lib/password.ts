import bcrypt from "bcryptjs";
import { HttpError } from "@/lib/errors";

const ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

let timingPad: string | null = null;

export async function consumePasswordTime(password: string) {
  if (!timingPad) timingPad = await bcrypt.hash("harbor-timing-pad", ROUNDS);
  await bcrypt.compare(password, timingPad);
}

export function assertStrongPassword(password: string) {
  if (password.length < 10 || password.length > 72) {
    throw new HttpError(422, "Password must be 10–72 characters.");
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new HttpError(422, "Password must include an uppercase letter, a lowercase letter, and a number.");
  }
}
