import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

/** In-memory rate limit (free). Nginx limit_req adds a second layer on VPS. */
export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    global: true,
    hook: 'preHandler',
    timeWindow: '1 minute',
    max: 120,
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: () => ({
      ok: false,
      error: 'rate_limit_exceeded',
      message: 'Too many requests. Try again later.',
    }),
  });
}
