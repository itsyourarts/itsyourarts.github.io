import { z } from "zod";
import { HttpError } from "@/lib/errors";

export const sendOtpSchema = z.object({
  phone: z.string().trim().min(8, "Enter a valid phone number.").max(20),
  purpose: z.literal("signup").default("signup"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().trim().min(8).max(20),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
  purpose: z.literal("signup").default("signup"),
});

export const signupSchema = z.object({
  signupTicket: z.string().trim().min(20, "Verification expired. Request a new code."),
  name: z.string().trim().min(1).max(80),
  username: z.string().trim().min(3).max(20),
  password: z.string().min(1).max(72),
  confirmPassword: z.string().min(1).max(72),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your username or phone.").max(40),
  password: z.string().min(1, "Enter your password.").max(72),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(1).max(72),
  confirmPassword: z.string().min(1).max(72),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1).max(72),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  username: z.string().trim().min(3).max(20).optional(),
  bio: z.string().trim().max(280).optional(),
});

export const messageSchema = z.object({
  receiverId: z.string().trim().min(8).max(40),
  message: z.string().trim().min(1, "Message cannot be empty.").max(4000, "Message is too long."),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username.").max(40),
  password: z.string().min(1, "Enter your password.").max(72),
});

export const adminUserPatchSchema = z.object({
  accountStatus: z.enum(["ACTIVE", "DISABLED"]),
});

const RESERVED_USERNAMES = new Set(["admin", "support", "harbor", "system", "root", "help", "security", "whatsapp"]);

export function assertName(name: string) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length < 1 || trimmed.length > 80) {
    throw new HttpError(422, "Enter your name (80 characters max).");
  }
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(trimmed)) {
    throw new HttpError(422, "Name can use letters, spaces, apostrophes, and hyphens.");
  }
  return trimmed;
}

export function assertUsername(username: string) {
  const value = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(value)) {
    throw new HttpError(422, "Username must be 3–20 characters: lowercase letters, numbers, and underscores.");
  }
  if (RESERVED_USERNAMES.has(value)) {
    throw new HttpError(422, "That username is reserved.");
  }
  return value;
}

export function assertBio(bio: string) {
  const trimmed = bio.trim();
  if (trimmed.length > 280) throw new HttpError(422, "Bio must be 280 characters or fewer.");
  return trimmed;
}

export function cleanMessage(message: string) {
  const text = message.replace(/\0/g, "").trim();
  if (!text) throw new HttpError(422, "Message cannot be empty.");
  if (text.length > 4000) throw new HttpError(422, "Message is too long.");
  return text;
}
