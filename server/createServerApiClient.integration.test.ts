/** @jest-environment node */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server.js';
import { encode } from 'next-auth/jwt';
import assert from 'node:assert/strict';
import { type IncomingHttpHeaders, createServer } from 'node:http';
import { createRequire } from 'node:module';
import { type AppSettingsConfig } from '#appSettings/schema.ts';

const require = createRequire(import.meta.url);
let requests: { headers: IncomingHttpHeaders; url: string | undefined }[] = [];
const secret = 'integration-test-secret';
const originalSecret = process.env.AUTH_SECRET;
const originalUrl = process.env.AUTH_URL;

const settings = {
  Application: { Environment: 'test', Name: 'Kickstarter' },
  Bff: { BaseUrl: '/api' },
  Server: {
    Api: { BaseUrl: 'http://127.0.0.1', TimeoutMs: 5000 },
    Auth: { RefreshBufferSeconds: 30, SessionMaxAgeSeconds: 3600 },
  },
} satisfies AppSettingsConfig;

jest.unstable_mockModule(
  require.resolve('server-only', { paths: [require.resolve('@next-box/route-handler')] }),
  () => ({}),
);

jest.unstable_mockModule('#appSettings/index.ts', () => ({
  loadAppSettings: () => Promise.resolve(settings),
}));

process.env.AUTH_SECRET = secret;
process.env.AUTH_URL = 'http://localhost:3000';

const { createServerApiClient } = await import('./createServerApiClient.ts');
const { GET } = await import('#app/api/example/route.ts');

const profile = {
  email: 'privileged@example.invalid',
  id: 'privileged',
  policies: ['ExampleAccess'],
  roles: ['ExampleUser'],
  userName: 'ExampleUser',
};

const server = createServer((request, response) => {
  requests = [...requests, { headers: request.headers, url: request.url }];
  response.setHeader('Content-Type', 'application/json');

  if (request.url === '/api/v1/auth/refresh') {
    response.end(
      JSON.stringify({
        accessToken: 'refreshed-access-token',
        expiresIn: 3600,
        refreshToken: 'refreshed-refresh-token',
        tokenType: 'Bearer',
      }),
    );

    return;
  }

  response.end(JSON.stringify(request.url === '/api/v1/users/me' ? profile : { message: 'Hello from the API.' }));
});

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  settings.Server.Api.BaseUrl = `http://127.0.0.1:${String(address.port)}`;
});

beforeEach(() => {
  requests = [];
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close(error => {
      if (error) {
        if (server.listening) reject(error);
        else resolve();
      } else {
        resolve();
      }
    }),
  );

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

describe('Given the server API client and a real HTTP transport', () => {
  it('When one client sends successive requests, then each has a fresh request ID', async () => {
    // Arrange
    const client = await createServerApiClient({ headers: { 'x-correlation-id': 'session-id' } });

    // Act
    await client.getExample();
    await client.getExample();

    // Assert
    expect(requests).toHaveLength(2);
    expect(requests[0]?.headers['x-request-id']).toEqual(expect.any(String));
    expect(requests[1]?.headers['x-request-id']).toEqual(expect.any(String));
    expect(requests[0]?.headers['x-request-id']).not.toBe(requests[1]?.headers['x-request-id']);
    expect(requests.map(request => request.headers['x-correlation-id'])).toEqual(['session-id', 'session-id']);
  });

  it('When caller headers are supplied, then their IDs and bearer token reach the API', async () => {
    // Arrange
    const client = await createServerApiClient({
      headers: {
        Authorization: 'Bearer caller-token',
        'x-correlation-id': 'correlation-id',
        'x-request-id': 'caller-request-id',
      },
    });

    // Act
    await client.getExample();

    // Assert
    expect(requests[0]?.headers).toEqual(
      expect.objectContaining({
        authorization: 'Bearer caller-token',
        'x-correlation-id': 'correlation-id',
        'x-request-id': 'caller-request-id',
      }),
    );
  });

  it('When a BFF request requires token refresh, then refreshed credentials and incoming IDs reach the API', async () => {
    // Arrange
    const token = await encode({
      salt: 'authjs.session-token',
      secret,
      token: {
        apiTokens: { accessToken: 'expired-token', expiresAt: Date.now() - 1000, refreshToken: 'refresh-token' },
        policies: profile.policies,
        roles: profile.roles,
        sub: 'privileged',
      },
    });

    const request = new NextRequest('http://localhost:3000/api/example', {
      headers: {
        cookie: `authjs.session-token=${token}`,
        'x-correlation-id': 'browser-session',
        'x-request-id': 'browser-request',
      },
    });

    // Act
    const response = await GET(request, {});

    // Assert
    expect(response.status).toBe(200);

    expect(requests.map(call => call.url)).toEqual(['/api/v1/auth/refresh', '/api/v1/users/me', '/api/v1/example']);

    expect(requests[1]?.headers.authorization).toBe('Bearer refreshed-access-token');

    expect(requests[2]?.headers).toEqual(
      expect.objectContaining({
        authorization: 'Bearer refreshed-access-token',
        'x-correlation-id': 'browser-session',
        'x-request-id': 'browser-request',
      }),
    );

    expect(response.headers.get('set-cookie')).toContain('authjs.session-token=');
  });
});
