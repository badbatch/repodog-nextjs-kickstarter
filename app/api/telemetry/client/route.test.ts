/** @jest-environment node */
import { afterAll, describe, expect, it } from '@jest/globals';
import { type LogRecord, configureSync, resetSync } from '@logtape/logtape';
import { NextRequest } from 'next/server.js';
import {
  createApiRouteTestSettings,
  createAuthenticatedApiRequest,
  setupApiRouteTestEnvironment,
} from '#__testUtils__/apiRouteFixtures.ts';

const restoreEnvironment = setupApiRouteTestEnvironment(createApiRouteTestSettings());
const { POST } = await import('./route.ts');

afterAll(() => {
  resetSync();
  restoreEnvironment();
});

describe('Browser telemetry BFF route', () => {
  it('When concurrent telemetry requests report a browser request ID, then each log retains its own server IDs', async () => {
    // Arrange
    const records: LogRecord[] = [];

    configureSync({
      loggers: [{ category: ['application'], lowestLevel: 'info', sinks: ['test'] }],
      sinks: {
        test: record => {
          records.push(record);
        },
      },
    });

    const browserRequestId = crypto.randomUUID();

    const requests = await Promise.all(
      ['first', 'second'].map(async event => {
        const request = await createAuthenticatedApiRequest('/api/telemetry/client', {
          headers: {
            'content-type': 'application/json',
            'x-correlation-id': `correlation-${event}`,
            'x-request-id': `request-${event}`,
          },
        });

        return new NextRequest(request, {
          body: JSON.stringify({ message: `Browser warning ${event}`, requestId: browserRequestId }),
          method: 'POST',
        });
      }),
    );

    // Act
    const responses = await Promise.all(requests.map(request => POST(request, {})));

    // Assert
    expect(responses.map(response => response.status)).toEqual([204, 204]);
    expect(records).toHaveLength(2);

    expect(records.map(record => record.category)).toEqual([
      ['application', 'browser'],
      ['application', 'browser'],
    ]);

    expect(records.map(record => record.properties)).toEqual(
      expect.arrayContaining(
        ['first', 'second'].map(event => ({
          browserRequestId,
          correlationId: `correlation-${event}`,
          message: `Browser warning ${event}`,
          requestId: `request-${event}`,
          source: 'browser',
        })),
      ),
    );
  });
});
