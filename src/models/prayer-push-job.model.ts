import { Schema, model, type Types } from 'mongoose';

/** Sent jobs older than 30 days after executeAt are auto-removed (keeps collection small). */
const SENT_JOB_TTL_SECONDS = 30 * 24 * 60 * 60;

const prayerPushJobSchema = new Schema(
  {
    deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    fcmToken: { type: String, required: true },
    prayerName: { type: String, required: true },
    time: { type: String, required: true },
    executeAt: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    dedupeKey: { type: String, required: true },
  },
  { timestamps: true },
);

// Worker: dispatchDuePrayerPushes — find pending due jobs, sort by time
prayerPushJobSchema.index(
  { sent: 1, executeAt: 1 },
  { name: 'ix_job_pending_execute_at' },
);

// Reschedule: deleteMany({ deviceId, sent: false })
prayerPushJobSchema.index(
  { deviceId: 1, sent: 1 },
  { name: 'ix_job_device_pending' },
);

// Per-device timeline / debugging at scale
prayerPushJobSchema.index(
  { deviceId: 1, executeAt: 1 },
  { name: 'ix_job_device_execute_at' },
);

// One push per device + prayer + local day
prayerPushJobSchema.index({ dedupeKey: 1 }, { unique: true, name: 'ux_job_dedupe_key' });

// Skip re-queue if already delivered
prayerPushJobSchema.index(
  { dedupeKey: 1, sent: 1 },
  { name: 'ix_job_dedupe_sent' },
);

// TTL cleanup for completed jobs only
prayerPushJobSchema.index(
  { executeAt: 1 },
  {
    name: 'ix_job_sent_ttl',
    expireAfterSeconds: SENT_JOB_TTL_SECONDS,
    partialFilterExpression: { sent: true },
  },
);

export type PrayerPushJobDocument = {
  _id: Types.ObjectId;
  deviceId: Types.ObjectId;
  fcmToken: string;
  prayerName: string;
  time: string;
  executeAt: Date;
  sent: boolean;
  dedupeKey: string;
};

export const PrayerPushJob = model('PrayerPushJob', prayerPushJobSchema);
