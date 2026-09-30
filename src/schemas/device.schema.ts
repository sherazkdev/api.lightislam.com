import { z } from 'zod';

export const registerDeviceBodySchema = z.object({
  fcm_token: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1),
});

export type RegisterDeviceBody = z.infer<typeof registerDeviceBodySchema>;
