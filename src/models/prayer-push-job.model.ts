import { Schema, model, type Types } from 'mongoose';

const prayerPushJobSchema = new Schema(
  {
    deviceId: { type: Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    fcmToken: { type: String, required: true },
    prayerName: { type: String, required: true },
    time: { type: String, required: true },
    executeAt: { type: Date, required: true, index: true },
    sent: { type: Boolean, default: false, index: true },
    dedupeKey: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

prayerPushJobSchema.index({ sent: 1, executeAt: 1 });

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
