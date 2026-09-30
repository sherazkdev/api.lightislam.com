import type { FastifyInstance } from 'fastify';
import { Device } from '../models/device.model.js';
import { requireApiKey } from '../hooks/api-key.js';
import { registerDeviceBodySchema } from '../schemas/device.schema.js';
import type { SchedulerService } from '../services/scheduler.service.js';

const registerDeviceBody = {
  type: 'object',
  required: ['fcm_token', 'latitude', 'longitude', 'timezone'],
  properties: {
    fcm_token: { type: 'string', description: 'FCM registration token' },
    latitude: { type: 'number', minimum: -90, maximum: 90 },
    longitude: { type: 'number', minimum: -180, maximum: 180 },
    timezone: { type: 'string', description: 'IANA timezone e.g. Asia/Karachi' },
  },
} as const;

const registerDeviceResponse = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    device_id: { type: 'string' },
  },
} as const;

export async function deviceRoutes(app: FastifyInstance, scheduler: SchedulerService): Promise<void> {
  app.post(
    '/api/v1/devices',
    {
      preHandler: requireApiKey,
      config: {
        rateLimit: {
          max: 15,
          timeWindow: '1 minute',
        },
      },
      schema: {
        tags: ['Devices'],
        summary: 'Register or update device',
        description:
          'Upserts by FCM token. Schedules azan reminder pushes for this device (server-side). Client must not send prayer times.',
        security: [{ ApiKeyAuth: [] }],
        body: registerDeviceBody,
        response: {
          201: registerDeviceResponse,
        },
      },
    },
    async (request, reply) => {
      const body = registerDeviceBodySchema.parse(request.body);

      const device = await Device.findOneAndUpdate(
        { fcmToken: body.fcm_token },
        {
          fcmToken: body.fcm_token,
          latitude: body.latitude,
          longitude: body.longitude,
          timezone: body.timezone,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).lean();

      await scheduler.scheduleDeviceById(String(device._id));

      return reply.code(201).send({
        ok: true,
        device_id: String(device._id),
      });
    },
  );
}
