import { createMiddleware } from '@next-box/route-handler';
import NextAuth, { type NextAuthConfig, type Session } from 'next-auth';
import { createAuthConfig } from '#server/auth/auth.ts';

// A separate server-only session projection. The public auth handlers never use it.
const { auth: authenticateApiRequest } = NextAuth(async (): Promise<NextAuthConfig> => {
  const authConfig = await createAuthConfig();

  return {
    ...authConfig,
    callbacks: {
      ...authConfig.callbacks,
      session: ({ session, token }): Session => {
        session.user.roles = token.roles ?? [];
        session.user.policies = token.policies ?? [];
        session.apiAccessToken = token.apiTokens?.accessToken;
        return session;
      },
    },
  };
});

export const withAuth = createMiddleware<Record<string, string>, object, { accessToken: string; policies: string[] }>(
  async (request, routeContext, _context, next) => {
    // Lazy configuration returns the wrapper asynchronously in this NextAuth version.
    const handler = await Promise.resolve(
      authenticateApiRequest(async authenticatedRequest => {
        const accessToken = authenticatedRequest.auth?.apiAccessToken;

        if (!accessToken) {
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
