import { jest } from '@jest/globals';
import { NextRequest } from 'next/server.js';
import { encode } from 'next-auth/jwt';
import { createRequire } from 'node:module';
import { type AppSettingsConfig } from '#appSettings/schema.ts';

const require = createRequire(import.meta.url);
const secret = 'route-test-secret';
const cookieName = 'authjs.session-token';
export const apiRouteCorrelationId = '00000000-0000-4000-8000-000000000001';

export const apiRouteProfile = {
  email: 'privileged@example.invalid',
  id: 'user-id',
  policies: ['ExampleAccess'],
  roles: ['ExampleUser'],
  userName: 'ExampleUser',
};

export const apiRouteTokens = {
  accessToken: 'opaque-access-token',
  refreshToken: 'opaque-refresh-token',
};

export const createApiRouteTestSettings = (): AppSettingsConfig => ({
  Application: { Environment: 'test', Name: 'Kickstarter' },
  Bff: { BaseUrl: '/api' },
  Server: {
    Api: { BaseUrl: 'http://127.0.0.1', TimeoutMs: 5000 },
    Auth: { RefreshBufferSeconds: 30, SessionMaxAgeSeconds: 3600 },
  },
});

export const mockServerOnlyForApiRouteTests = (): void => {
  for (const entryPoint of ['@next-box/auth', '@next-box/route-handler']) {
    jest.unstable_mockModule(require.resolve('server-only', { paths: [require.resolve(entryPoint)] }), () => ({}));
  }
};

export const setupApiRouteTestEnvironment = (settings: AppSettingsConfig): (() => void) => {
  const originalSecret = process.env.AUTH_SECRET;
  const originalUrl = process.env.AUTH_URL;

  mockServerOnlyForApiRouteTests();

  jest.unstable_mockModule('#appSettings/index.ts', () => ({ loadAppSettings: () => Promise.resolve(settings) }));
  process.env.AUTH_SECRET = secret;
  process.env.AUTH_URL = 'http://localhost:3000';

  return (): void => {
    if (originalSecret === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = originalSecret;
    }

    if (originalUrl === undefined) {
      delete process.env.AUTH_URL;
    } else {
      process.env.AUTH_URL = originalUrl;
    }
  };
};

export const createAuthenticatedApiRequest = async (
  path: string,
  {
    expiresAt = Date.now() + 3_600_000,
    headers = {},
    policies = apiRouteProfile.policies,
  }: { expiresAt?: number; headers?: Record<string, string>; policies?: string[] } = {},
): Promise<NextRequest> => {
  const token = await encode({
    salt: cookieName,
    secret,
    token: {
      apiTokens: { ...apiRouteTokens, expiresAt },
      correlationId: apiRouteCorrelationId,
      email: apiRouteProfile.email,
      policies,
      roles: apiRouteProfile.roles,
      sub: apiRouteProfile.id,
    },
  });

  return new NextRequest(`http://localhost:3000${path}`, { headers: { cookie: `${cookieName}=${token}`, ...headers } });
};
