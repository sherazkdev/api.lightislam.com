import { ApiRequestLog } from '../models/api-request-log.model.js';
import { Device } from '../models/device.model.js';
import { PrayerPushJob } from '../models/prayer-push-job.model.js';

/** Ensures all schema indexes exist (run once per API/worker boot). */
export async function syncDatabaseIndexes(): Promise<void> {
  await Promise.all([
    Device.syncIndexes(),
    PrayerPushJob.syncIndexes(),
    ApiRequestLog.syncIndexes(),
  ]);
}
