import { Schema, model, type InferSchemaType } from 'mongoose';

const deviceSchema = new Schema(
  {
    fcmToken: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timezone: { type: String, required: true },
  },
  { timestamps: true },
);

// Upsert on registration
deviceSchema.index({ fcmToken: 1 }, { unique: true, name: 'ux_device_fcm_token' });

// Daily batch / ops by region
deviceSchema.index({ timezone: 1 }, { name: 'ix_device_timezone' });

// Stale token sweeps, admin lists (newest first)
deviceSchema.index({ updatedAt: -1 }, { name: 'ix_device_updated_at' });

export type DeviceDocument = InferSchemaType<typeof deviceSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Device = model('Device', deviceSchema);
