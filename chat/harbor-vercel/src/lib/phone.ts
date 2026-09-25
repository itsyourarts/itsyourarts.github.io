import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhone(input: string) {
  const trimmed = input.trim().replace(/[\s()-]/g, "");
  if (!trimmed) return null;
  const parsed = parsePhoneNumberFromString(trimmed, trimmed.startsWith("+") ? undefined : "IN");
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

export function formatPhone(e164: string) {
  const parsed = parsePhoneNumberFromString(e164);
  return parsed ? parsed.formatInternational() : e164;
}
