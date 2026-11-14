import NextAuth, { type NextAuthConfig, type Session } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import { loadAppSettings } from '#appSettings/index.ts';
import { type AppSettingsConfig } from '#appSettings/schema.ts';
import { credentialsProvider } from '#server/auth/providers/credentialsProvider.ts';
import { currentUserSchema, tokenResponseSchema } from '#server/auth/schemas.ts';
import { createServerApiClient } from '#server/createServerApiClient.ts';

const createAuthCallbacks = (settings: AppSettingsConfig): NextAuthConfig['callbacks'] => ({
  jwt: async ({ token, trigger, user }): Promise<JWT> => {
    if (trigger === 'signIn') {
      token.apiTokens = user.apiTokens;
      token.roles = user.roles;
      token.policies = user.policies;
    }

    if (trigger === 'signIn' || !token.correlationId) {
      token.correlationId = crypto.randomUUID();
    }

    const tokens = token.apiTokens;

    if (!tokens) {
      return token;
    }

    const isRefreshRequired = Date.now() >= tokens.expiresAt - settings.Server.Auth.RefreshBufferSeconds * 1000;

    if (!isRefreshRequired && token.roles && token.policies) {
      return token;
    }

    try {
      const apiClient = await createServerApiClient();
      let updatedTokens = tokens;

      if (isRefreshRequired) {
        const response = await apiClient.refreshUserToken({
          body: { refreshToken: tokens.refreshToken },
          signal: AbortSignal.timeout(settings.Server.Api.TimeoutMs),
        });

        if (response.status !== 200) throw new Error('Refresh failed');

        const refreshed = tokenResponseSchema.parse(response.data);
        updatedTokens = { ...refreshed, expiresAt: Date.now() + refreshed.expiresIn * 1000 };
      }

      const me = await apiClient.getCurrentUser({
        headers: { Authorization: `Bearer ${updatedTokens.accessToken}` },
        signal: AbortSignal.timeout(settings.Server.Api.TimeoutMs),
      });

      if (me.status !== 200) throw new Error('Could not load authenticated user');

      const currentUser = currentUserSchema.parse(me.data);
      token.apiTokens = updatedTokens;
      token.roles = currentUser.roles;
      token.policies = currentUser.policies;
      token.sub = currentUser.id;
      token.name = currentUser.userName;
      token.email = currentUser.email;
      delete token.error;
    } catch {
      delete token.apiTokens;
      token.roles = [];
      token.policies = [];
      token.error = 'RefreshTokenError';
    }

    return token;
  },
  session: ({ session, token }): Session => {
    // This callback also serves /api/auth/session: never expose API tokens here.
    session.user.id = token.sub ?? '';
    session.user.roles = token.roles ?? [];
    session.user.policies = token.policies ?? [];
    session.correlationId = token.correlationId;
    session.error = token.error;
    return session;
  },
});

export const createAuthConfig = async (): Promise<NextAuthConfig> => {
  const settings = await loadAppSettings();
  const authSettings = settings.Server.Auth;

  return {
    callbacks: createAuthCallbacks(settings),
    pages: {
      signIn: '/login',
    },
    providers: [credentialsProvider],
    session: {
      maxAge: authSettings.SessionMaxAgeSeconds,
      strategy: 'jwt',
    },
  };
};

export const { auth, handlers, signIn, signOut } = NextAuth(createAuthConfig);
