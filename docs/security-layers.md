# API security — simple (Roman Urdu)

## Layer 1: `x-api-key` (ab code mein hai)

- Mobile app har `POST /api/v1/devices` par header bheje:  
  `x-api-key: <APP_API_KEY>`
- Server `.env` mein same value: `APP_API_KEY=...`
- **Refresh nahi** har minute — sirf app update par key change kar sakte ho.
- APK se key nikal sakte hain → is liye Layer 2 + 3.

**Local dev:** `APP_API_KEY` optional (production par required).

---

## Layer 2: Rate limit (free — ab code + nginx)

| Jagah | Limit |
|--------|--------|
| **Fastify** (`@fastify/rate-limit`) | ~120 req/min per IP (global), devices route **15/min** |
| **Nginx** (VPS) | `deploy/nginx/conf.d/light-islam-rate-limit.conf` + site config |

Nginx setup VPS:

```bash
sudo cp deploy/nginx/conf.d/light-islam-rate-limit.conf /etc/nginx/conf.d/
sudo cp deploy/nginx/api.lightislam.com.conf /etc/nginx/sites-available/api.lightislam.com
sudo nginx -t && sudo systemctl reload nginx
```

---

## Layer 3: Firebase App Check (abhi implement nahi — samajh lo)

**Problem:** x-api-key APK se leak ho sakti hai.

**App Check kya hai?**  
Google/Firebase app ko verify karta hai: request **asli Light of Islam app** se aayi (Play Store install), random Postman/script se nahi.

- App mein Firebase SDK + App Check on.
- Har API call ke sath **App Check token** (SDK khud banati hai, har minute login jaisa nahi).
- Backend token verify kare → phir `POST /devices` allow.

**Phase 2** mein add karenge jab app team ready ho. Docs: https://firebase.google.com/docs/app-check

---

## Layer 4: User login (optional)

Jab app mein account ho: device register sirf logged-in user ke JWT se. Lamba expiry (30 din), refresh sirf expire/open app par.

---

## Mobile developer ko bhejo

```http
POST https://api.lightislam.com/api/v1/devices
x-api-key: <team se milega, APP_API_KEY>
Content-Type: application/json

{
  "fcm_token": "...",
  "latitude": 33.6,
  "longitude": 73.0,
  "timezone": "Asia/Karachi"
}
```

`GET /health` — **no** api key (monitoring).
