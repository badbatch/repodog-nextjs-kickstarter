import { createMiddleware } from '@next-box/route-handler';

export const withCorrelationId = createMiddleware<Record<string, string>, object, { correlationId: string }>(
  async (request, _routeContext, _context, next) => {
    const correlationId = request.headers.get('x-correlation-id') ?? crypto.randomUUID();
    return next({ context: { correlationId } });
  },
);
