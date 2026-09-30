import { IANAZone } from 'luxon';
import { z } from 'zod';

function isValidIanaTimezone(tz: string): boolean {
  return IANAZone.isValidZone(tz);
}

export const registerDeviceBodySchema = z.object({
  fcm_token: z.string().min(1),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z
    .string()
    .min(1)
    .refine(isValidIanaTimezone, {
      message:
        'timezone must be IANA format (e.g. Asia/Karachi). Do not use UTC+5 or GMT offsets.',
    }),
});

export type RegisterDeviceBody = z.infer<typeof registerDeviceBodySchema>;
