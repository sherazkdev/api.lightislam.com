import { Schema, model, type InferSchemaType } from 'mongoose';

const deviceSchema = new Schema(
  {
    fcmToken: { type: String, required: true, unique: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timezone: { type: String, required: true },
  },
  { timestamps: true },
);

export type DeviceDocument = InferSchemaType<typeof deviceSchema> & {
  _id: Schema.Types.ObjectId;
};

export const Device = model('Device', deviceSchema);
