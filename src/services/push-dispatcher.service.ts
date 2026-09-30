import { Device } from '../models/device.model.js';
import { PrayerPushJob } from '../models/prayer-push-job.model.js';
import type { PrayerName } from './aladhan.service.js';
import { sendAzanReminderSafe } from './fcm.service.js';

export async function dispatchDuePrayerPushes(): Promise<number> {
  const now = new Date();
  const due = await PrayerPushJob.find({ sent: false, executeAt: { $lte: now } })
    .sort({ executeAt: 1 })
    .limit(200)
    .lean();

  let sent = 0;
  for (const job of due) {
    const device = await Device.findById(job.deviceId).lean();
    const fcmToken = device?.fcmToken ?? job.fcmToken;

    const result = await sendAzanReminderSafe(fcmToken, job.prayerName as PrayerName, job.time);
    await PrayerPushJob.updateOne({ _id: job._id }, { $set: { sent: true } });

    if (result === 'invalid_token') {
      await Device.deleteOne({ _id: job.deviceId });
      await PrayerPushJob.deleteMany({ deviceId: job.deviceId, sent: false });
    } else {
      sent++;
    }
  }
  return sent;
}
