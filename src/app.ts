import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { loadEnv } from './config/env.js';

import { registerRateLimit } from './plugins/rate-limit.js';
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
  await registerRateLimit(app);
  await registerSwagger(app);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        ok: false,
        error: 'validation_error',
        details: error.flatten(),
      });
    }
    throw error;
  });

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
              mongo: { type: 'string' },
            },
          },
        },
      },
    },
    async () => ({
      ok: true,
      mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    }),
  );



  await app.register(async (instance) => {

    await deviceRoutes(instance, scheduler);

  });



  return app;

}


