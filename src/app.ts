import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { loadEnv } from './config/env.js';
import { registerSwagger } from './plugins/swagger.js';
import { deviceRoutes } from './routes/devices.routes.js';
import type { SchedulerService } from './services/scheduler.service.js';

export async function buildApp(scheduler: SchedulerService) {
  loadEnv(process.env as Record<string, string | undefined>);

  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  await app.register(sensible);
  await registerSwagger(app);

  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
            },
          },
        },
      },
    },
    async () => ({ ok: true }),
  );

  await app.register(async (instance) => {
    await deviceRoutes(instance, scheduler);
  });

  return app;
}
