import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  MONGODB_URI: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  APP_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(raw: Record<string, string | undefined>): Env {
  const env = envSchema.parse(raw);
  if (process.env.NODE_ENV === 'production' && !raw.APP_API_KEY?.trim()) {
    throw new Error('APP_API_KEY is required in production (set x-api-key for mobile app)');
  }
  return env;
}
