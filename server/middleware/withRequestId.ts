import { createMiddleware } from '@next-box/route-handler';

export const withRequestId = createMiddleware<Record<string, string>, object, { requestId: string }>(
  async (request, _routeContext, _context, next) => {
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
    return next({ context: { requestId } });
  },
);
