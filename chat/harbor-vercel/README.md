# Harbor

Phone-verified chat for registered users, a separate admin console, and an official WhatsApp Business Platform adapter.

Harbor does **not** log into WhatsApp Web, intercept QR codes, extract WhatsApp credentials, or attach a WhatsApp session to each user. Chat history is Harbor-to-Harbor and lives in PostgreSQL. WhatsApp is used only as an authorized OTP channel and as one global business-account connection in the admin console.

This is not an end-to-end encrypted messenger. Use HTTPS in production. Messages are stored so both people can read history.

## Architecture

```text
Android app (Kotlin)          Browser (Next.js UI)
        |                              |
        | HTTPS + Bearer JWT           | HTTPS + httpOnly cookies
        v                              v
                 Next.js on Vercel
                 /api/auth  /api/messages  /api/admin
                          |
                          | Prisma
                          v
                    PostgreSQL
                          |
          Official providers, server-side only
          Meta Graph API  ·  Twilio Verify
```

The WhatsApp connection is a single admin-level row (`whatsapp_connections.id = global`). It is rendered once, at the top of `/admin`. User rows do not contain session controls.

Provider abstraction (`src/lib/whatsapp.ts`):

```text
WhatsAppProvider
 ├── sendOTP()
 ├── verifyOTP()
 ├── getConnectionStatus()
 ├── connect()
 ├── reconnect()
 └── disconnect()
```

`supportsQrAuth` is false for the development provider and for WhatsApp Cloud API. The admin “Add session” modal explains the official token check. Harbor will not draw a fake login QR. A future authorized provider can return `supportsQrAuth: true` and an `https` QR URL; that path is not implemented with WhatsApp Web libraries.

## Folder structure

```text
harbor/
  package.json                 Next.js app, Vercel root
  prisma/schema.prisma
  prisma/seed.ts
  src/app/                     UI routes
  src/app/api/                 REST API
  src/lib/                     auth, OTP, chat, WhatsApp adapter
  src/components/              chat UI and admin dashboard
  android/                     Kotlin / Jetpack Compose client
  docs/API.md
  docs/DEPLOYMENT.md
  docs/WHATSAPP.md
  docker-compose.yml
  .env.example
```

## Local setup

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Configure environment:

```bash
cp .env.example .env
# Replace JWT_SECRET and OTP_PEPPER. Example:
# openssl rand -base64 48
```

3. Install, migrate, seed the admin, run:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

- User signup: `/signup`
- User login: `/login`
- Chat: `/app`
- Admin: `/admin/login`

With `OTP_PROVIDER=dev` and `ALLOW_DEV_OTP=true` (never in production), the signup screen shows the code and the server logs it. Production never returns an OTP in JSON.

Default seed admin comes from `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Change both before any shared deployment.

## Android

Open `android/` in Android Studio and let it create the Gradle wrapper if prompted. The emulator talks to the host machine at `http://10.0.2.2:3000`. A physical device needs the computer’s LAN URL or the Vercel HTTPS URL, set on the login screen as Server URL. Release builds refuse cleartext.

The app never opens a database connection. It only calls the HTTPS API with `X-Client: mobile` and bearer tokens stored in DataStore.

## Production

See `docs/DEPLOYMENT.md` and `docs/WHATSAPP.md`.

## Security controls

- bcrypt password hashes, cost 12
- OTP stored as HMAC-SHA256, 5-minute expiry, 5 attempts
- signup ticket is random and stored hashed, 15 minutes
- access JWT 15 minutes, refresh token rotated and hashed
- refresh-token reuse revokes the user’s sessions
- admin cookie is separate from the user cookie
- httpOnly, SameSite=Lax cookies; mobile gets tokens only when `X-Client: mobile`
- origin check for browser cookie requests
- database-backed rate limits for OTP, login, admin login, and sending
- Zod validation, Prisma parameterized queries
- security headers, no stack traces in API responses
- WhatsApp tokens stay in environment variables
- admin actions are written to `audit_logs`
- disabled users are signed out immediately
