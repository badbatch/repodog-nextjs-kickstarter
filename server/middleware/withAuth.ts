import { createMiddleware } from '@next-box/route-handler';
import { withApiSession } from '#auth.ts';

export const withAuth = createMiddleware<Record<string, string>, object, { accessToken: string; policies: string[] }>(
  (request, _routeContext, _context, next) =>
    withApiSession(request, async session => {
      const accessToken = session?.apiAccessToken;

      if (!accessToken || session.error) {
        return Response.json({ error: 'Authentication required' }, { status: 401 });
      }

      return next({ context: { accessToken, policies: session.user.policies } });
    }),
);
