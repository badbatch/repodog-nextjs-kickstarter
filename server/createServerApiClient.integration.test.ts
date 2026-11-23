/** @jest-environment node */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { createAuthenticatedApiRequest, setupApiRouteTestEnvironment } from '#__testUtils__/apiRouteFixtures.ts';
import { createApiTransportFixture } from '#__testUtils__/createApiTransportFixture.ts';

const transport = createApiTransportFixture();
const { requests } = transport;
const restoreEnvironment = setupApiRouteTestEnvironment(transport.settings);
const { createServerApiClient } = await import('./createServerApiClient.ts');
const { GET } = await import('#app/api/example/route.ts');
const { GET: getRestrictedExample } = await import('#app/api/example/restricted/route.ts');

beforeAll(transport.start);
beforeEach(transport.clearRequests);

afterAll(async () => {
  restoreEnvironment();
  await transport.close();
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
    const request = await createAuthenticatedApiRequest('/api/example', {
      expiresAt: Date.now() - 1000,
      headers: { 'x-correlation-id': 'browser-session', 'x-request-id': 'browser-request' },
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

  it('When a server client receives an API session, then it forwards the bearer token and correlation ID', async () => {
    // Arrange
    const client = await createServerApiClient({
      session: {
        apiAccessToken: 'session-token',
        correlationId: 'session-id',
        expires: new Date().toISOString(),
        user: { id: 'user-id', policies: [], roles: [] },
      },
    });

    // Act
    await client.getExample();

    // Assert
    expect(requests[0]?.headers).toEqual(
      expect.objectContaining({ authorization: 'Bearer session-token', 'x-correlation-id': 'session-id' }),
    );
  });

  it('When a session lacks the example policy, then the restricted route rejects it before calling the API', async () => {
    // Arrange
    const request = await createAuthenticatedApiRequest('/api/example/restricted', { policies: [] });

    // Act
    const response = await getRestrictedExample(request, {});

    // Assert
    expect(response.status).toBe(403);
    expect(requests).toHaveLength(0);
  });
});
