import { DateTime } from 'luxon';
import { Device } from '../models/device.model.js';
import { PrayerPushJob } from '../models/prayer-push-job.model.js';
import { fetchSlotsToSchedule, type PrayerName } from './aladhan.service.js';

function dedupeKey(deviceId: string, prayerName: PrayerName, at: Date): string {
  const day = DateTime.fromJSDate(at).toISODate();
  return `${deviceId}:${prayerName}:${day}`;
}

export class SchedulerService {
  async scheduleDeviceById(deviceId: string): Promise<number> {
    const device = await Device.findById(deviceId).lean();
    if (!device) return 0;

    await PrayerPushJob.deleteMany({ deviceId: device._id, sent: false });

    const now = DateTime.now().setZone(device.timezone);
    const slots = await fetchSlotsToSchedule(
      device.latitude,
      device.longitude,
      device.timezone,
      now,
    );

    let count = 0;
    for (const slot of slots) {
      if (slot.at.getTime() <= Date.now()) continue;

      const key = dedupeKey(String(device._id), slot.prayerName, slot.at);
      const alreadySent = await PrayerPushJob.exists({ dedupeKey: key, sent: true });
      if (alreadySent) continue;

      await PrayerPushJob.findOneAndUpdate(
        { dedupeKey: key, sent: { $ne: true } },
        {
          $set: {
            deviceId: device._id,
            fcmToken: device.fcmToken,
            prayerName: slot.prayerName,
            time: slot.time,
            executeAt: slot.at,
            sent: false,
          },
        },
        { upsert: true },
      );
      count++;
    }
    return count;
  }

  async scheduleAllDevices(): Promise<{ devices: number; jobs: number }> {
    const devices = await Device.find().select('_id').lean();
    let jobs = 0;
    for (const d of devices) {
      jobs += await this.scheduleDeviceById(String(d._id));
    }
    return { devices: devices.length, jobs };
  }
}
