# Light of Islam — Azan Reminder Push Notifications

## Flow (client vs backend)

- **Client** only registers device: sends FCM token + location once (app start / token refresh / location change). No prayer-time data posted, ever.
- **Backend** does everything else: fetches prayer times, schedules, sends push.

```
POST /api/v1/devices
{
  "fcm_token": "...",
  "latitude": 33.6844,
  "longitude": 73.0479,
  "timezone": "Asia/Karachi"
}
```

## Backend responsibilities

1. Store `fcm_token` + `latitude/longitude` (or city/country) + `timezone` per device.
2. Daily, fetch that device's prayer times — **GET request**, no auth/API key needed:
   ```
   GET https://api.aladhan.com/v1/timings/{DD-MM-YYYY}?latitude=X&longitude=Y&method=1&timezonestring=Asia/Karachi
   ```
   Response `data.timings` gives Fajr/Dhuhr/Asr/Maghrib/Isha as 24h strings (e.g. `"05:12"`). `method=1` = Karachi convention, correct for Pakistan.
3. Schedule one push per prayer time per device (cron/queue). Re-fetch + re-schedule every day — Azan times shift daily.
4. Send each push as a **data-only FCM message** — see payload format below.

## Push payload format (important)

Send **only** a `data` object — no top-level `"notification"` key at all. If `"notification"` is present, Android renders it directly via the system tray with the default sound, bypassing the app's channel logic entirely.

```javascript
// Firebase Admin SDK (Node.js)
await admin.messaging().send({
  token: deviceFcmToken,
  data: {
    type: 'azan_reminder',
    title: 'Fajr',
    body: 'Time for Fajr prayer',
    prayerName: 'Fajr',
    time: '05:12'
  }
  // no "notification" key
});
```

Rules:
- All `data` values must be **strings** — FCM rejects numbers/booleans in data payloads (`"time": "05:12"`, not `512`).
- `type` must be exactly `"azan_reminder"` for real prayer reminders. This is the field the app uses to decide which sound to play (see below) — get it right or azan sound won't trigger.
- `title` / `body` are optional — the app can construct them from `prayerName` if omitted, but sending them is fine too.

## Sound isolation — azan sound only for real reminders

**Why this matters:** a manually-sent test push (Firebase Console / Postman) must NOT play the azan sound.

**How it works:** the app has two fixed Android notification channels — one with azan sound, one with default sound. It picks between them based on `data.type`:

- `type == "azan_reminder"` → Azan channel (azan sound)
- anything else / missing `type` → default channel (normal sound)

A manual test push won't include `"type": "azan_reminder"` (Firebase Console's UI doesn't easily let you set custom data, and testers won't know the exact value), so it naturally falls back to the default channel — no azan sound. No extra flag needed; this is entirely enforced by the app reading `type`.

## Summary for backend dev

- Client: registers token + location only. Nothing else.
- Backend: GET prayer times from Aladhan API daily → schedule → send data-only push per prayer with `type: "azan_reminder"`, `title`, `body`, `prayerName`, `time` (all strings).
- Never include a `"notification"` key — data-only, always.
