# Harbor API

All JSON responses use:

```json
{ "success": true, "message": "OTP verified" }
```

```json
{ "success": false, "message": "Invalid OTP" }
```

Browser clients send cookies (`credentials: include`). The Android app sends `X-Client: mobile` and `Authorization: Bearer <accessToken>`. Tokens are returned in JSON only for that mobile client.

## Authentication

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/send-otp` | `{ "phone": "+9198...", "purpose": "signup" }` | Rate limited. Dev provider may include `devOtp` outside production. |
| POST | `/api/auth/verify-otp` | `{ "phone", "otp", "purpose": "signup" }` | Returns `signupTicket`. |
| POST | `/api/auth/signup` | `{ "signupTicket", "name", "username", "password", "confirmPassword" }` | Creates the user and a session. |
| POST | `/api/auth/login` | `{ "identifier", "password" }` | Username or phone. |
| POST | `/api/auth/logout` | none | Revokes the session. |
| POST | `/api/auth/refresh` | `{ "refreshToken" }` optional | Cookie or body. Rotates the refresh token. |
| GET | `/api/auth/me` | none | Current user. No password hash. |
| POST | `/api/auth/change-password` | `{ "currentPassword", "newPassword", "confirmPassword" }` | Revokes other sessions. |

## Users and chat

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/users?q=` | Search other active users. Minimum 2 characters. No phone numbers. |
| GET | `/api/users/:id` | Public profile, or full self profile. |
| PATCH | `/api/users/:id` | Self only: `name`, `username`, `bio`. |
| DELETE | `/api/users/:id` | Self only. Body `{ "password" }`. |
| GET | `/api/conversations` | Last message, unread count, presence. |
| GET | `/api/messages/:userId?before=` | History, newest page marks incoming messages read. |
| POST | `/api/messages` | `{ "receiverId", "message" }`. |
| POST | `/api/presence` | Marks the caller online. |

Presence is online when `lastSeenAt` is within 60 seconds. Clients should ping presence about every 20 seconds. Vercel does not hold a WebSocket for this app; the web and Android clients poll.

## Admin

All `/api/admin/*` routes except login require the admin session.

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/admin/login` | `{ "username", "password" }` |
| POST | `/api/admin/logout` | Revokes the admin session. |
| GET | `/api/admin/me` | Admin id and username. |
| GET | `/api/admin/users` | `q`, `page`, `pageSize`, `sort`, `order`, `status`, `verification`. Includes stats. |
| GET | `/api/admin/users/:id` | Safe profile. No password hash. |
| PATCH | `/api/admin/users/:id` | `{ "accountStatus": "ACTIVE" \| "DISABLED" }` |
| DELETE | `/api/admin/users/:id` | Deletes the user and cascaded messages. |
| GET | `/api/admin/audit` | Recent admin actions. |
| GET | `/api/admin/whatsapp/status` | Global connection. No secrets. |
| POST | `/api/admin/whatsapp/connect` | Verifies official Cloud API credentials from the environment. |
| POST | `/api/admin/whatsapp/reconnect` | Re-checks the same credentials. |
| POST | `/api/admin/whatsapp/disconnect` | Marks the global connection disconnected. Does not delete the Meta asset. |
| DELETE | `/api/admin/whatsapp` | Deletes Harbor’s connection record only. |

## WhatsApp webhook

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/webhooks/whatsapp` | Meta hub challenge. |
| POST | `/api/webhooks/whatsapp` | Verifies `X-Hub-Signature-256`. Does not store message text. |

## Health

`GET /api/health` returns `{ "success": true, "message": "ok" }` when PostgreSQL answers.
