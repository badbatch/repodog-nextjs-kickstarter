/** @jest-environment node */
import { afterAll, afterEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server.js';
import { encode, getToken } from 'next-auth/jwt';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { type AppSettingsConfig } from '#appSettings/schema.ts';

const require = createRequire(import.meta.url);

const settings = {
  Application: { Environment: 'test', Name: 'Kickstarter' },
  Bff: { BaseUrl: '/api' },
  Server: {
    Api: { BaseUrl: 'http://localhost:8080', TimeoutMs: 10_000 },
    Auth: { RefreshBufferSeconds: 60, SessionMaxAgeSeconds: 7200 },
  },
} satisfies AppSettingsConfig;

jest.unstable_mockModule(
  require.resolve('server-only', { paths: [require.resolve('@next-box/route-handler')] }),
  () => ({}),
);

jest.unstable_mockModule('#appSettings/index.ts', () => ({
  loadAppSettings: () => Promise.resolve(settings),
}));

const originalSecret = process.env.AUTH_SECRET;
const originalUrl = process.env.AUTH_URL;
const secret = 'test-secret-for-authentication-tests-only';
process.env.AUTH_SECRET = secret;
process.env.AUTH_URL = 'http://localhost:3000';

const { createAuthConfig, handlers } = await import('#auth.ts');
const { authorizeCredentials } = await import('./providers/credentialsProvider.ts');
const { createApiHandler } = await import('#server/createApiHandler.ts');

const cookieName = 'authjs.session-token';
const correlationId = '00000000-0000-4000-8000-000000000001';

const profile = {
  email: 'privileged@example.com',
  id: 'user-id',
  policies: ['ExampleAccess'],
  roles: ['ExampleUser'],
  userName: 'ExampleUser',
};

const tokens = {
  accessToken: 'opaque-access-token',
  expiresAt: Date.now() + 3_600_000,
  refreshToken: 'opaque-refresh-token',
};

const createRequest = async (
  path: string,
  expiresAt = tokens.expiresAt,
  policies = profile.policies,
): Promise<NextRequest> => {
  const jwt = await encode({
    salt: cookieName,
    secret,
    token: {
      apiTokens: { ...tokens, expiresAt },
      correlationId,
      email: 'privileged@example.com',
      policies,
      roles: profile.roles,
      sub: 'user-id',
    },
  });

  return new NextRequest(`http://localhost:3000${path}`, { headers: { cookie: `${cookieName}=${jwt}` } });
};

afterAll(() => {
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
});

describe('API authentication', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('When a signed-in user has no example policy, then ordinary authenticated routes remain accessible', async () => {
    // Arrange
    const request = await createRequest('/api/example', tokens.expiresAt, []);
    const handler = jest.fn(() => Response.json({ ok: true }));
    // Act
    const response = await createApiHandler({ handler })(request, {});
    // Assert
    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('When auth configuration is created, then the session lifetime comes from app settings', async () => {
    // Arrange
    const expectedMaxAge = settings.Server.Auth.SessionMaxAgeSeconds;

    // Act
    const config = await createAuthConfig();

    // Assert
    expect(config.session).toEqual({ maxAge: expectedMaxAge, strategy: 'jwt' });
  });

  it('When a user signs in, then a new correlation ID is created and retained on subsequent reads', async () => {
    // Arrange
    const account = { provider: 'credentials', providerAccountId: 'user-id', type: 'credentials' as const };
    const user = { ...profile, apiTokens: tokens };
    const config = await createAuthConfig();
    const jwt = config.callbacks?.jwt;

    assert.ok(jwt, 'JWT callback is missing');

    // Act
    const signedIn = await jwt({ account, token: { correlationId }, trigger: 'signIn', user });

    assert.ok(signedIn, 'Sign-in did not produce a token');

    const subsequent = await jwt({ account, token: { ...signedIn }, user });

    // Assert
    expect(signedIn.correlationId).toMatch(/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/u);
    expect(signedIn.correlationId).not.toBe(correlationId);
    expect(subsequent?.correlationId).toBe(signedIn.correlationId);
  });

  it('When API credentials are valid, then the generated client loads the authenticated user', async () => {
    // Arrange
    const fetch = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        Response.json({
          accessToken: tokens.accessToken,
          expiresIn: 3600,
          refreshToken: tokens.refreshToken,
          tokenType: 'Bearer',
        }),
      )
      .mockResolvedValueOnce(Response.json(profile));

    // Act
    const user = await authorizeCredentials(
      { email: 'privileged@example.com', password: 'password' },
      new Request('http://localhost:3000'),
    );

    // Assert
    expect(user).toMatchObject({
      apiTokens: { accessToken: tokens.accessToken },
      id: 'user-id',
      policies: profile.policies,
      roles: profile.roles,
    });

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/v1/users/me'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${tokens.accessToken}` }),
      }),
    );
  });

  it('When form values are invalid, then authentication is rejected without calling the API', async () => {
    // Arrange
    const fetch = jest.spyOn(globalThis, 'fetch');

    // Act
    const result = authorizeCredentials({ email: 'invalid', password: '' }, new Request('http://localhost:3000'));

    // Assert
    await expect(result).rejects.toMatchObject({ type: 'CredentialsSignin' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('When the API rejects credentials, then authentication fails without loading a profile', async () => {
    // Arrange
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({}, { status: 401 }));

    // Act
    const result = authorizeCredentials(
      { email: 'privileged@example.com', password: 'wrong' },
      new Request('http://localhost:3000'),
    );

    // Assert
    await expect(result).rejects.toMatchObject({ type: 'CredentialsSignin' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('When a request has no session, then it is rejected before executing the handler', async () => {
    // Arrange
    const handler = jest.fn(() => Response.json({ ok: true }));
    const request = new NextRequest('http://localhost:3000/api/example');

    // Act
    const response = await createApiHandler({ handler })(request, {});

    // Assert
    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('When the public session is read, then API tokens remain private', async () => {
    // Arrange
    const request = await createRequest('/api/auth/session');

    // Act
    const response = await handlers.GET(request);
    const body: unknown = await response.json();

    // Assert
    expect(body).toMatchObject({
      correlationId,
      user: { email: 'privileged@example.com', id: 'user-id', policies: profile.policies, roles: profile.roles },
    });

    expect(JSON.stringify(body)).not.toContain('opaque-');
    expect(JSON.stringify(body)).not.toContain('apiAccessToken');
  });

  it('When a session has a valid access token, then the generated API client forwards it as a bearer token', async () => {
    // Arrange
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: 'user-id' }));

    const route = createApiHandler({
      handler: async (_request, _routeContext, { apiClient }) => {
        const response = await apiClient.getCurrentUser();
        return Response.json(response.data);
      },
    });

    const request = await createRequest('/api/example');

    // Act
    const response = await route(request, {});

    // Assert
    expect(response.status).toBe(200);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users/me'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer opaque-access-token' }),
      }),
    );
  });

  it('When an access token enters the configured refresh buffer, then replacement tokens are persisted in the cookie', async () => {
    // Arrange
    const fetch = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        Response.json({
          accessToken: 'replacement-access',
          expiresIn: 3600,
          refreshToken: 'replacement-refresh',
          tokenType: 'Bearer',
        }),
      )
      .mockResolvedValueOnce(Response.json(profile));

    const route = createApiHandler({ handler: () => Response.json({ ok: true }) });
    const request = await createRequest('/api/example', Date.now() + 45_000);

    // Act
    const response = await route(request, {});

    const cookie = response.headers
      .getSetCookie()
      .map(value => value.split(';', 1)[0])
      .join('; ');

    const refreshed = await getToken({ req: { headers: new Headers({ cookie }) }, salt: cookieName, secret });

    // Assert
    expect(response.status).toBe(200);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/refresh'),
      expect.objectContaining({
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      }),
    );

    expect(refreshed?.apiTokens?.accessToken).toBe('replacement-access');
    expect(refreshed?.correlationId).toBe(correlationId);
  });

  it('When a session lacks ExampleAccess, then the BFF returns forbidden without running the handler', async () => {
    // Arrange
    const handler = jest.fn(() => Response.json({ ok: true }));
    const request = await createRequest('/api/example', tokens.expiresAt, []);

    // Act
    const response = await createApiHandler({ handler, policy: 'ExampleAccess' })(request, {});

    // Assert
    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it('When refreshed access no longer satisfies ExampleAccess, then the BFF denies the request and persists updated policies', async () => {
    // Arrange
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        Response.json({
          accessToken: 'replacement-access',
          expiresIn: 3600,
          refreshToken: 'replacement-refresh',
          tokenType: 'Bearer',
        }),
      )
      .mockResolvedValueOnce(Response.json({ ...profile, policies: [], roles: [] }));

    const handler = jest.fn(() => Response.json({ ok: true }));
    const request = await createRequest('/api/example', 0);

    // Act
    const response = await createApiHandler({ handler, policy: 'ExampleAccess' })(request, {});

    const cookie = response.headers
      .getSetCookie()
      .map(value => value.split(';', 1)[0])
      .join('; ');

    const refreshed = await getToken({ req: { headers: new Headers({ cookie }) }, salt: cookieName, secret });

    // Assert
    expect(response.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
    expect(refreshed?.roles).toEqual([]);
    expect(refreshed?.policies).toEqual([]);
    expect(refreshed?.apiTokens?.accessToken).toBe('replacement-access');
  });

  it('When access information cannot be loaded after refresh, then the session fails closed', async () => {
    // Arrange
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        Response.json({
          accessToken: 'replacement-access',
          expiresIn: 3600,
          refreshToken: 'replacement-refresh',
          tokenType: 'Bearer',
        }),
      )
      .mockResolvedValueOnce(Response.json({}, { status: 503 }));

    const handler = jest.fn(() => Response.json({ ok: true }));
    const request = await createRequest('/api/example', 0);

    // Act
    const response = await createApiHandler({ handler })(request, {});

    // Assert
    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('When an upstream API denies an operation, then the BFF preserves its forbidden response', async () => {
    // Arrange
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ title: 'Forbidden' }, { status: 403 }));
    const { GET } = await import('#app/api/example/route.ts');
    const request = await createRequest('/api/example');

    // Act
    const response = await GET(request, {});

    // Assert
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ title: 'Forbidden' });
  });

  it('When token refresh fails, then the request is rejected before executing the handler', async () => {
    // Arrange
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({}, { status: 401 }));
    const handler = jest.fn(() => Response.json({ ok: true }));
    const request = await createRequest('/api/example', 0);

    // Act
    const response = await createApiHandler({ handler })(request, {});

    // Assert
    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });
});
