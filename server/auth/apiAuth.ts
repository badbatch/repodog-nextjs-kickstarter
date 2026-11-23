import NextAuth, { type NextAuthConfig, type Session } from 'next-auth';
import { cache } from 'react';
import { createAuthConfig } from '#server/auth/auth.ts';

const createApiAuthConfig = async (): Promise<NextAuthConfig> => {
  const authConfig = await createAuthConfig();

  return {
    ...authConfig,
    callbacks: {
      ...authConfig.callbacks,
      session: ({ session, token }): Session => {
        session.user.id = token.sub ?? '';
        session.user.roles = token.roles ?? [];
        session.user.policies = token.policies ?? [];
        session.correlationId = token.correlationId;
        session.error = token.error;

        if (token.apiTokens && Date.now() < token.apiTokens.expiresAt) {
          session.apiAccessToken = token.apiTokens.accessToken;
        }

        return session;
      },
    },
  };
};

export const { auth: apiAuth } = NextAuth(createApiAuthConfig);

const { auth: readSession } = NextAuth(async (): Promise<NextAuthConfig> => {
  const config = await createApiAuthConfig();

  // Server Components cannot persist a rotated refresh token in a response cookie.
  return { ...config, callbacks: { ...config.callbacks, jwt: ({ token }) => token } };
});

export const readApiSession = cache(async (): Promise<Session | null> => readSession());
