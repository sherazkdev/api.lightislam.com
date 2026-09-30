# API security (current phase)

**Decision:** No Firebase App Check in this phase. Use `x-api-key`, rate limiting, validation, and logging/monitoring only.

## In scope (implemented)

### 1. `x-api-key`

- Header on `POST /api/v1/devices`: `x-api-key: <APP_API_KEY>`
- Server env: `APP_API_KEY` (required when `NODE_ENV=production`)
- No per-minute refresh; rotate on app release if needed.
- `/health` stays public for uptime checks.

### 2. Rate limiting (free)

| Layer | Policy |
|--------|--------|
| Fastify `@fastify/rate-limit` | Global ~120/min per IP; devices route **15/min** |
| Nginx (VPS) | See `deploy/nginx/conf.d/light-islam-rate-limit.conf` |

### 3. Backend validation

- JSON Schema on routes + Zod parse on body
- `400` for validation errors

### 4. Monitoring & logging

- Structured logs (Pino): device registration, auth failures, rate limits
- MongoDB `apirequestlogs` collection for device register events (audit / abuse review)
- PM2: `npm run prod:logs`
- Nginx access logs on VPS: `/var/log/nginx/access.log`

---

## Out of scope (this phase)

### Firebase App Check — **not implemented**

Deferred until real abuse (bots, fake registrations, API misuse) justifies the cost.

**Why deferred (team agreement):**

- No current abuse requiring it
- Extra Flutter + backend setup and maintenance
- Risk for Huawei, custom ROMs, rooted devices
- Old app versions can break if enforcement is turned on abruptly
- Harder local/debug testing
- Improves security but is not complete protection alone

**Future:** If needed, App Check can be a **dedicated security phase** (Flutter SDK + backend token verify). This repo has **no** App Check SDK, middleware, or Firebase App Check config now. Add only when that phase is approved.

### User login JWT (optional later)

Not required for azan device registration today.

---

## Mobile client

```http
POST https://api.lightislam.com/api/v1/devices
x-api-key: <APP_API_KEY>
Content-Type: application/json

{
  "fcm_token": "...",
  "latitude": 33.6,
  "longitude": 73.0,
  "timezone": "Asia/Karachi"
}
```

OpenAPI: `https://api.lightislam.com/docs`
