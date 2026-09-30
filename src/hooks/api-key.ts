import type { FastifyReply, FastifyRequest } from 'fastify';

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const expected = process.env.APP_API_KEY?.trim();
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      return reply.code(500).send({ ok: false, error: 'server_misconfigured' });
    }
    return;
  }

  const provided = request.headers['x-api-key'];
  const key = typeof provided === 'string' ? provided.trim() : '';

  if (key !== expected) {
    return reply.code(401).send({
      ok: false,
      error: 'unauthorized',
      message: 'Invalid or missing x-api-key',
    });
  }
}
