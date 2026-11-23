import { createMiddleware } from '@next-box/route-handler';
import { apiAuth } from '#server/auth/apiAuth.ts';

export const withAuth = createMiddleware<Record<string, string>, object, { accessToken: string; policies: string[] }>(
  async (request, routeContext, _context, next) => {
    // Lazy configuration returns the wrapper asynchronously in this NextAuth version.
    const handler = await Promise.resolve(
      apiAuth(async authenticatedRequest => {
        const accessToken = authenticatedRequest.auth?.apiAccessToken;

        if (!accessToken || authenticatedRequest.auth?.error) {
          return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        return next({ context: { accessToken, policies: authenticatedRequest.auth?.user.policies ?? [] } });
      }),
    );

    // The wrapper persists refreshed session cookies on the outgoing response.
    const response = await handler(request, { params: routeContext.params ?? Promise.resolve({}) });

    if (!response) {
      throw new Error('Authentication handler returned no response');
    }

    return response;
  },
);
