import type { FastifyReply, FastifyRequest } from 'fastify';
import { recordApiEvent } from '../services/audit-log.service.js';

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const expected = process.env.APP_API_KEY?.trim();
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      recordApiEvent({
        event: 'auth.server_misconfigured',
        method: request.method,
        path: request.url,
        statusCode: 500,
        ip: request.ip,
      });
      return reply.code(500).send({ ok: false, error: 'server_misconfigured' });
    }
    return;
  }

  const provided = request.headers['x-api-key'];
  const key = typeof provided === 'string' ? provided.trim() : '';

  if (key !== expected) {
    request.log.warn({ ip: request.ip, path: request.url }, 'Invalid x-api-key');
    recordApiEvent({
      event: 'auth.invalid_api_key',
      method: request.method,
      path: request.url,
      statusCode: 401,
      ip: request.ip,
    });
    return reply.code(401).send({
      ok: false,
      error: 'unauthorized',
      message: 'Invalid or missing x-api-key',
    });
  }
}
