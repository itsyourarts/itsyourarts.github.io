# Deploy Harbor on Vercel

## 1. Database

Create a managed PostgreSQL database (Neon, Supabase, or Vercel Postgres).

- `DATABASE_URL`: pooled connection used by the app.
- `DIRECT_URL`: direct connection used by `prisma migrate deploy`.

Do not use a transaction-pooled URL for migrations. Locally both values can be the same.

## 2. Secrets

Set these in the Vercel project, not in Git:

```text
DATABASE_URL
DIRECT_URL
JWT_SECRET
OTP_PEPPER
APP_ORIGIN=https://your-app.vercel.app
OTP_PROVIDER=whatsapp_cloud
ALLOW_DEV_OTP=false
WHATSAPP_PROVIDER=cloud
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
WHATSAPP_GRAPH_VERSION=v21.0
WHATSAPP_OTP_TEMPLATE
WHATSAPP_OTP_TEMPLATE_LANG=en_US
WHATSAPP_APP_SECRET
WHATSAPP_WEBHOOK_VERIFY_TOKEN
ADMIN_USERNAME
ADMIN_PASSWORD
ALLOW_ADMIN_SEED=true
```

Generate `JWT_SECRET` and `OTP_PEPPER` with `openssl rand -base64 48`. They must be at least 32 and 16 characters. Do not reuse the placeholders from `.env.example`.

Optional Twilio Verify instead of WhatsApp OTP:

```text
OTP_PROVIDER=twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID
TWILIO_VERIFY_CHANNEL=sms
```

`OTP_PROVIDER_API_KEY` is accepted as an alias for the Twilio auth token. `WHATSAPP_PROVIDER_TOKEN` and `WHATSAPP_PROVIDER_ID` are aliases for the Cloud API token and phone number ID.

## 3. Project settings

- Framework: Next.js
- Root directory: the folder that contains `package.json` (this repository root)
- Build command: `prisma generate && prisma migrate deploy && next build`
- Install command: `npm install`

`vercel.json` already sets that build command. `postinstall` runs `prisma generate`.

The Prisma schema includes `binaryTargets = ["native", "rhel-openssl-3.0.x"]` so the client works on Vercel’s Node runtime.

## 4. First admin

After the first successful deploy, run the seed once from a trusted machine:

```bash
npx vercel env pull .env.production.local
npm run db:seed
```

Or set the variables in your shell and run `npm run db:seed` against `DIRECT_URL`. Then set `ALLOW_ADMIN_SEED=false`. Do not put the admin password in frontend code.

## 5. Checks

- `GET https://your-app.vercel.app/api/health` returns success.
- `/admin/login` is not linked from the chat UI beyond the known URL. It is still protected by the password and server-side session checks.
- Confirm `ALLOW_DEV_OTP` is not `true`.
- Confirm the Android release build uses `https://your-app.vercel.app`.

## 6. What not to do

- Do not store chats in `users.json` or `messages.json`.
- Do not commit `.env`.
- Do not add Baileys, whatsapp-web.js, or any WhatsApp Web QR client.
- Do not persist access tokens in Postgres. Harbor keeps them in environment variables.
