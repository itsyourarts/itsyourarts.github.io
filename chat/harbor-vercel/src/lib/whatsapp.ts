import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/errors";

export type ConnectionStatus = "CONNECTED" | "DISCONNECTED" | "CONNECTING" | "EXPIRED" | "ERROR";

export type ProviderStatus = {
  provider: string;
  providerLabel: string;
  supportsQrAuth: boolean;
  status: ConnectionStatus;
  displayName: string | null;
  phoneNumber: string | null;
  providerConnectionId: string | null;
  businessAccountId: string | null;
  lastError: string | null;
  metadata: Record<string, string | number | boolean | null>;
  officialAuth: {
    method: "cloud_api_token" | "dev_none";
    instructions: string;
  };
};

export interface WhatsAppProvider {
  readonly id: string;
  readonly label: string;
  readonly supportsQrAuth: boolean;
  sendOTP(phoneE164: string, code: string): Promise<void>;
  verifyOTP(phoneE164: string, code: string): Promise<{ mode: "local" } | { mode: "provider"; approved: boolean }>;
  getConnectionStatus(): Promise<ProviderStatus>;
  connect(): Promise<ProviderStatus>;
  reconnect(): Promise<ProviderStatus>;
  disconnect(): Promise<ProviderStatus>;
}

const GLOBAL_ID = "global";

function envToken() {
  return process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_PROVIDER_TOKEN || "";
}

function envPhoneNumberId() {
  return process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PROVIDER_ID || "";
}

function envWaba() {
  return process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
}

function graphVersion() {
  return process.env.WHATSAPP_GRAPH_VERSION || "v21.0";
}

function otpProviderName() {
  return (process.env.OTP_PROVIDER || "dev").toLowerCase();
}

export function resolvedWhatsAppProvider() {
  const explicit = process.env.WHATSAPP_PROVIDER?.toLowerCase();
  if (explicit) return explicit;
  if (envToken() && envPhoneNumberId()) return "cloud";
  return "dev";
}

function cloudConfigured() {
  return Boolean(envToken() && envPhoneNumberId());
}

function safeMetaStatus(value: unknown): ConnectionStatus {
  const status = String(value ?? "").toUpperCase();
  if (status === "CONNECTED") return "CONNECTED";
  if (status === "PENDING" || status === "MIGRATED") return "CONNECTING";
  if (!status) return "CONNECTED";
  return "ERROR";
}

async function graphGet(path: string) {
  const token = envToken();
  if (!token) throw new HttpError(400, "WhatsApp Cloud API credentials are not configured on the server.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`https://graph.facebook.com/${graphVersion()}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: { code?: number; message?: string };
      display_phone_number?: string;
      verified_name?: string;
      quality_rating?: string;
      status?: string;
      code_verification_status?: string;
      name_status?: string;
      name?: string;
    };
    if (!response.ok) {
      const code = data.error?.code;
      console.error("[harbor] WhatsApp Cloud API error", response.status, code ?? "unknown");
      if (code === 190 || code === 102 || code === 463 || code === 467 || response.status === 401) {
        throw new HttpError(401, "WhatsApp access token is invalid or expired.");
      }
      throw new HttpError(502, "WhatsApp Cloud API could not be reached.");
    }
    return data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.error("[harbor] WhatsApp Cloud API request failed");
    throw new HttpError(502, "WhatsApp Cloud API could not be reached.");
  } finally {
    clearTimeout(timer);
  }
}

async function liveCloudStatus(): Promise<ProviderStatus> {
  const base: ProviderStatus = {
    provider: "cloud",
    providerLabel: "WhatsApp Cloud API",
    supportsQrAuth: false,
    status: "DISCONNECTED",
    displayName: null,
    phoneNumber: null,
    providerConnectionId: envPhoneNumberId() || null,
    businessAccountId: envWaba() || null,
    lastError: null,
    metadata: {},
    officialAuth: {
      method: "cloud_api_token",
      instructions:
        "Official WhatsApp Cloud API uses a system-user token and phone number ID from Meta Business Manager. It does not use WhatsApp Web QR pairing. Harbor will not generate a login QR.",
    },
  };
  if (!cloudConfigured()) {
    return {
      ...base,
      lastError: "Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID on the server, then connect.",
    };
  }
  try {
    const fields = "display_phone_number,verified_name,quality_rating,code_verification_status,status,name_status";
    const phone = await graphGet(`${encodeURIComponent(envPhoneNumberId())}?fields=${fields}`);
    let businessName: string | null = null;
    if (envWaba()) {
      try {
        const waba = await graphGet(`${encodeURIComponent(envWaba())}?fields=name`);
        businessName = waba.name ?? null;
      } catch (err) {
        console.error("[harbor] WABA lookup skipped", err instanceof HttpError ? err.message : "failed");
      }
    }
    const mapped = safeMetaStatus(phone.status);
    return {
      ...base,
      status: mapped,
      displayName: phone.verified_name || businessName,
      phoneNumber: phone.display_phone_number ?? null,
      lastError:
        mapped === "ERROR"
          ? `WhatsApp Manager reports this number as ${String(phone.status || "unavailable")}.`
          : mapped === "CONNECTING"
            ? "The number is not fully connected in WhatsApp Manager yet."
            : null,
      metadata: {
        qualityRating: phone.quality_rating ?? null,
        codeVerificationStatus: phone.code_verification_status ?? null,
        nameStatus: phone.name_status ?? null,
        businessName,
        graphVersion: graphVersion(),
      },
    };
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      return { ...base, status: "EXPIRED", lastError: "Session expired. Rotate the token in Meta Business Manager and update the server environment." };
    }
    return {
      ...base,
      status: "ERROR",
      lastError: err instanceof HttpError ? err.message : "Could not check WhatsApp.",
    };
  }
}

function otpTemplateComponents(code: string) {
  const components: Array<Record<string, unknown>> = [
    { type: "body", parameters: [{ type: "text", text: code }] },
  ];
  if (process.env.WHATSAPP_OTP_INCLUDE_BUTTON !== "false") {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: code }],
    });
  }
  return components;
}

async function sendCloudOtp(phoneE164: string, code: string) {
  if (!cloudConfigured()) {
    throw new HttpError(500, "WhatsApp OTP is not configured on the server.");
  }
  const template = process.env.WHATSAPP_OTP_TEMPLATE || "otp_verification";
  const language = process.env.WHATSAPP_OTP_TEMPLATE_LANG || "en_US";
  const to = phoneE164.replace(/^\+/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`https://graph.facebook.com/${graphVersion()}/${encodeURIComponent(envPhoneNumberId())}/messages`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${envToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: language },
          components: otpTemplateComponents(code),
        },
      }),
    });
    if (!response.ok) {
      console.error("[harbor] WhatsApp OTP send failed", response.status);
      throw new HttpError(502, "Could not send the verification code. Try again shortly.");
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.error("[harbor] WhatsApp OTP send failed");
    throw new HttpError(502, "Could not send the verification code. Try again shortly.");
  } finally {
    clearTimeout(timer);
  }
}

function twilioAuthHeader() {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || process.env.OTP_PROVIDER_API_KEY || "";
  if (!sid || !token || !process.env.TWILIO_VERIFY_SERVICE_SID) {
    throw new HttpError(500, "Twilio Verify is not configured on the server.");
  }
  return {
    authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
    serviceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
  };
}

async function twilioSend(phoneE164: string) {
  const { authorization, serviceSid } = twilioAuthHeader();
  const channel = process.env.TWILIO_VERIFY_CHANNEL || "sms";
  const body = new URLSearchParams({ To: phoneE164, Channel: channel });
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
    method: "POST",
    headers: { Authorization: authorization, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    console.error("[harbor] Twilio Verify send failed", response.status);
    throw new HttpError(502, "Could not send the verification code. Try again shortly.");
  }
}

async function twilioCheck(phoneE164: string, code: string) {
  const { authorization, serviceSid } = twilioAuthHeader();
  const body = new URLSearchParams({ To: phoneE164, Code: code });
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
    method: "POST",
    headers: { Authorization: authorization, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await response.json().catch(() => ({}))) as { status?: string };
  return response.ok && data.status === "approved";
}

class HarborWhatsAppProvider implements WhatsAppProvider {
  readonly supportsQrAuth = false;

  get id() {
    return resolvedWhatsAppProvider() === "cloud" ? "cloud" : "dev";
  }

  get label() {
    return this.id === "cloud" ? "WhatsApp Cloud API" : "Development provider";
  }

  async sendOTP(phoneE164: string, code: string) {
    const provider = otpProviderName();
    if (provider === "twilio") {
      await twilioSend(phoneE164);
      return;
    }
    if (provider === "whatsapp_cloud" || provider === "cloud") {
      await sendCloudOtp(phoneE164, code);
      return;
    }
    if (provider === "dev") {
      if (process.env.NODE_ENV === "production") {
        throw new HttpError(500, "OTP provider is not configured for production.");
      }
      console.info(`[harbor] development OTP for ${phoneE164}: ${code}`);
      return;
    }
    throw new HttpError(500, "Unknown OTP provider.");
  }

  async verifyOTP(phoneE164: string, code: string) {
    if (otpProviderName() === "twilio") {
      return { mode: "provider" as const, approved: await twilioCheck(phoneE164, code) };
    }
    return { mode: "local" as const };
  }

  async getConnectionStatus() {
    if (resolvedWhatsAppProvider() === "cloud") return liveCloudStatus();
    return {
      provider: "dev",
      providerLabel: "Development provider",
      supportsQrAuth: false,
      status: "DISCONNECTED" as const,
      displayName: null,
      phoneNumber: null,
      providerConnectionId: null,
      businessAccountId: null,
      lastError: "No WhatsApp Business account is configured. Set WHATSAPP_PROVIDER=cloud and the official Cloud API environment variables.",
      metadata: {},
      officialAuth: {
        method: "dev_none" as const,
        instructions:
          "The development provider does not connect to WhatsApp and does not create a QR session. Switch WHATSAPP_PROVIDER to cloud to use the official Business Platform.",
      },
    };
  }

  connect() {
    return this.getConnectionStatus();
  }

  reconnect() {
    return this.getConnectionStatus();
  }

  async disconnect() {
    const current = await this.getConnectionStatus();
    return { ...current, status: "DISCONNECTED" as const, lastError: null };
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  return new HarborWhatsAppProvider();
}

function serialize(row: {
  provider: string;
  displayName: string | null;
  phoneNumber: string | null;
  status: string;
  providerConnectionId: string | null;
  businessAccountId: string | null;
  supportsQrAuth: boolean;
  metadata: unknown;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastConnectedAt: Date | null;
  lastCheckedAt: Date | null;
}, live: ProviderStatus, exists: boolean) {
  return {
    exists,
    provider: live.provider,
    providerLabel: live.providerLabel,
    supportsQrAuth: false,
    status: row.status,
    displayName: row.displayName,
    phoneNumber: row.phoneNumber,
    providerConnectionId: row.providerConnectionId,
    businessAccountId: row.businessAccountId,
    lastConnectedAt: row.lastConnectedAt?.toISOString() ?? null,
    lastCheckedAt: row.lastCheckedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lastError: row.lastError,
    metadata: live.metadata,
    officialAuth: live.officialAuth,
    configured: resolvedWhatsAppProvider() === "cloud" ? cloudConfigured() : false,
    webhookConfigured: Boolean(process.env.WHATSAPP_APP_SECRET && process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
  };
}

function emptyConnection() {
  const cloud = resolvedWhatsAppProvider() === "cloud";
  return {
    exists: false,
    provider: cloud ? "cloud" : "dev",
    providerLabel: cloud ? "WhatsApp Cloud API" : "Development provider",
    supportsQrAuth: false,
    status: "DISCONNECTED",
    displayName: null,
    phoneNumber: null,
    providerConnectionId: cloud ? envPhoneNumberId() || null : null,
    businessAccountId: cloud ? envWaba() || null : null,
    lastConnectedAt: null,
    lastCheckedAt: null,
    createdAt: null,
    updatedAt: null,
    lastError: cloud && !cloudConfigured()
      ? "Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID on the server, then connect."
      : cloud
        ? null
        : "No WhatsApp Business account is configured.",
    metadata: {},
    officialAuth: cloud
      ? {
          method: "cloud_api_token" as const,
          instructions:
            "Official WhatsApp Cloud API uses a system-user token and phone number ID from Meta Business Manager. It does not use WhatsApp Web QR pairing. Harbor will not generate a login QR.",
        }
      : {
          method: "dev_none" as const,
          instructions:
            "The development provider does not connect to WhatsApp and does not create a QR session. Set WHATSAPP_PROVIDER=cloud to use the official Business Platform.",
        },
    configured: cloud ? cloudConfigured() : false,
    webhookConfigured: Boolean(process.env.WHATSAPP_APP_SECRET && process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
  };
}

export async function readConnection() {
  const row = await prisma.whatsAppConnection.findUnique({ where: { id: GLOBAL_ID } });
  if (!row) return emptyConnection();
  return serialize(row, {
    provider: row.provider,
    providerLabel: row.provider === "cloud" ? "WhatsApp Cloud API" : "Development provider",
    supportsQrAuth: false,
    status: row.status as ConnectionStatus,
    displayName: row.displayName,
    phoneNumber: row.phoneNumber,
    providerConnectionId: row.providerConnectionId,
    businessAccountId: row.businessAccountId,
    lastError: row.lastError,
    metadata: {},
    officialAuth: emptyConnection().officialAuth,
  }, true);
}

export async function refreshWhatsAppStatus() {
  const row = await prisma.whatsAppConnection.findUnique({ where: { id: GLOBAL_ID } });
  if (!row) return emptyConnection();
  if (row.status === "DISCONNECTED") {
    const updated = await prisma.whatsAppConnection.update({
      where: { id: GLOBAL_ID },
      data: { lastCheckedAt: new Date() },
    });
    return readConnection().then((current) => ({ ...current, lastCheckedAt: updated.lastCheckedAt?.toISOString() ?? null }));
  }
  const live = await getWhatsAppProvider().getConnectionStatus();
  const saved = await saveConnection(live, {
    connected: live.status === "CONNECTED" && row.status !== "CONNECTED",
  });
  return serialize(saved, live, true);
}

async function saveConnection(status: ProviderStatus, opts: { connected?: boolean; clearError?: boolean }) {
  const now = new Date();
  const data = {
    provider: status.provider,
    displayName: status.displayName,
    phoneNumber: status.phoneNumber,
    status: status.status,
    providerConnectionId: status.providerConnectionId,
    businessAccountId: status.businessAccountId,
    supportsQrAuth: false,
    metadata: status.metadata,
    lastError: opts.clearError ? null : status.lastError,
    lastCheckedAt: now,
    ...(opts.connected && status.status === "CONNECTED" ? { lastConnectedAt: now } : {}),
  };
  return prisma.whatsAppConnection.upsert({
    where: { id: GLOBAL_ID },
    create: { id: GLOBAL_ID, ...data },
    update: data,
  });
}

export async function connectWhatsApp() {
  const provider = getWhatsAppProvider();
  const live = await provider.connect();
  const row = await saveConnection(live, { connected: live.status === "CONNECTED" });
  return serialize(row, live, true);
}

export async function reconnectWhatsApp() {
  const provider = getWhatsAppProvider();
  const live = await provider.reconnect();
  const row = await saveConnection(live, { connected: live.status === "CONNECTED" });
  return serialize(row, live, true);
}

export async function disconnectWhatsApp() {
  const existing = await prisma.whatsAppConnection.findUnique({ where: { id: GLOBAL_ID } });
  const provider = getWhatsAppProvider();
  const live = await provider.disconnect();
  const row = await prisma.whatsAppConnection.upsert({
    where: { id: GLOBAL_ID },
    create: {
      id: GLOBAL_ID,
      provider: live.provider,
      status: "DISCONNECTED",
      supportsQrAuth: false,
      lastCheckedAt: new Date(),
    },
    update: {
      status: "DISCONNECTED",
      lastError: null,
      lastCheckedAt: new Date(),
      displayName: existing?.displayName ?? live.displayName,
      phoneNumber: existing?.phoneNumber ?? live.phoneNumber,
    },
  });
  return serialize(row, { ...live, status: "DISCONNECTED", lastError: null }, true);
}

export async function deleteWhatsAppConnection() {
  await prisma.whatsAppConnection.deleteMany({ where: { id: GLOBAL_ID } });
  return readConnection();
}

export function devOtpAllowed() {
  return process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_OTP === "true" && otpProviderName() === "dev";
}

export function currentOtpProvider() {
  return otpProviderName();
}
