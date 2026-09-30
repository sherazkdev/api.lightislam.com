# MongoDB indexes — Light of Islam API

Indexes are defined in Mongoose schemas and synced on connect via `syncDatabaseIndexes()`.

## devices

| Index | Fields | Purpose |
|-------|--------|---------|
| `ux_device_fcm_token` | `fcmToken` (unique) | Registration upsert |
| `ix_device_timezone` | `timezone` | Batch schedule by region |
| `ix_device_updatedAt` | `updatedAt` (desc) | Stale device / admin queries |

## prayerpushjobs

| Index | Fields | Purpose |
|-------|--------|---------|
| `ix_job_pending_execute_at` | `sent`, `executeAt` | Worker dispatch due jobs |
| `ix_job_device_pending` | `deviceId`, `sent` | Clear pending on reschedule |
| `ix_job_device_execute_at` | `deviceId`, `executeAt` | Per-device job history |
| `ux_job_dedupe_key` | `dedupeKey` (unique) | One job per prayer per day |
| `ix_job_dedupe_sent` | `dedupeKey`, `sent` | Skip already-delivered |
| `ix_job_sent_ttl` | `executeAt` (TTL, `sent: true`) | Auto-delete old sent jobs (30d) |

## Manual verify (mongosh)

```javascript
db.devices.getIndexes()
db.prayerpushjobs.getIndexes()
```
