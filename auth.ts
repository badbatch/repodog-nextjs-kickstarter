import { createApiTokenAuth } from '@next-box/auth';
import { loadAppSettings } from '#appSettings/index.ts';
import { authorizeCredentials, loadCurrentUser, refreshTokens } from '#server/auth/backendAuthService.ts';

export const { auth, createAuthConfig, handlers, readApiSession, signIn, signOut, withApiSession } = createApiTokenAuth(
  {
    authorize: authorizeCredentials,
    credentials: { email: { type: 'email' }, password: { type: 'password' } },
    loadCurrentUser,
    loadOptions: async () => {
      const { Server } = await loadAppSettings();

      return {
        refreshBufferSeconds: Server.Auth.RefreshBufferSeconds,
        sessionMaxAgeSeconds: Server.Auth.SessionMaxAgeSeconds,
      };
    },
    refreshTokens,
    signInPage: '/login',
  },
);
