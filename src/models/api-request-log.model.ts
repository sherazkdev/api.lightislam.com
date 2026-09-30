import { Schema, model } from 'mongoose';

const apiRequestLogSchema = new Schema(
  {
    event: { type: String, required: true, index: true },
    method: { type: String },
    path: { type: String },
    statusCode: { type: Number },
    ip: { type: String, index: true },
    deviceId: { type: String, index: true },
    timezone: { type: String },
    error: { type: String },
  },
  { timestamps: true },
);

apiRequestLogSchema.index({ createdAt: -1 });
apiRequestLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, name: 'ix_audit_ttl_90d' },
);

export const ApiRequestLog = model('ApiRequestLog', apiRequestLogSchema);
