import { type Middleware, createMiddleware } from '@next-box/route-handler';

export const withPolicy = (policy?: string): Middleware<Record<string, string>, { policies: string[] }, object> =>
  createMiddleware<Record<string, string>, { policies: string[] }>(
    async (_request, _routeContext, { policies }, next) => {
      if (policy && !policies.includes(policy)) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }

      return next();
    },
  );
