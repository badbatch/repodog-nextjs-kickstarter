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
  it('When concurrent telemetry requests report stacks, then each log retains its own stack and request IDs', async () => {
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
      ['first', 'second'].map(async requestName => {
        const request = await createAuthenticatedApiRequest('/api/telemetry/client', {
          headers: {
            'content-type': 'application/json',
            'x-correlation-id': `correlation-${requestName}`,
            'x-request-id': `request-${requestName}`,
          },
        });

        return new NextRequest(request, {
          body: JSON.stringify({
            message: `Browser warning ${requestName}`,
            requestId: browserRequestId,
            stack: `Error: Browser warning ${requestName}\n    at loadRecords`,
          }),
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
        ['first', 'second'].map(requestName => ({
          browserRequestId,
          correlationId: `correlation-${requestName}`,
          message: `Browser warning ${requestName}`,
          requestId: `request-${requestName}`,
          source: 'browser',
          stack: `Error: Browser warning ${requestName}\n    at loadRecords`,
        })),
      ),
    );
  });
});
