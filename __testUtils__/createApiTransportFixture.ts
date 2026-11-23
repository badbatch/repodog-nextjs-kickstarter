import assert from 'node:assert/strict';
import { type IncomingHttpHeaders, createServer } from 'node:http';
import { type AppSettingsConfig } from '#appSettings/schema.ts';
import { apiRouteProfile, createApiRouteTestSettings } from './apiRouteFixtures.ts';

type ApiTransportFixture = {
  clearRequests: () => void;
  close: () => Promise<void>;
  requests: { headers: IncomingHttpHeaders; url: string | undefined }[];
  settings: AppSettingsConfig;
  start: () => Promise<void>;
};

export const createApiTransportFixture = (): ApiTransportFixture => {
  const requests: ApiTransportFixture['requests'] = [];
  const settings = createApiRouteTestSettings();

  const server = createServer((request, response) => {
    requests.push({ headers: request.headers, url: request.url });
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

    response.end(
      JSON.stringify(request.url === '/api/v1/users/me' ? apiRouteProfile : { message: 'Hello from the API.' }),
    );
  });

  return {
    clearRequests: (): void => {
      requests.length = 0;
    },
    close: (): Promise<void> =>
      new Promise((resolve, reject) => {
        server.close(error => {
          if (error && server.listening) {
            reject(error);
          } else {
            resolve();
          }
        });
      }),
    requests,
    settings,
    start: async (): Promise<void> => {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });

      const address = server.address();
      assert.ok(address && typeof address !== 'string');
      settings.Server.Api.BaseUrl = `http://127.0.0.1:${String(address.port)}`;
    },
  };
};
