import { createRestClient } from 'getta';
import { type Session } from 'next-auth';
import { loadAppSettings } from '#appSettings/index.ts';
import { type ServerApiClient } from '#libs/ApiClient/types.ts';
import { createApiClient } from '#server/httpClient/client.ts';

type ServerApiClientOptions = {
  headers?: Record<string, string>;
  session?: Session;
};

export const createServerApiClient = async ({
  headers = {},
  session,
}: ServerApiClientOptions = {}): Promise<ServerApiClient> => {
  const settings = await loadAppSettings();

  const sessionHeaders = {
    ...(session?.apiAccessToken && { Authorization: `Bearer ${session.apiAccessToken}` }),
    ...(session?.correlationId && { 'x-correlation-id': session.correlationId }),
  };

  return createApiClient(
    createRestClient({
      basePath: settings.Server.Api.BaseUrl,
      fetchCache: 'no-store',
      fetchTimeout: settings.Server.Api.TimeoutMs,
      headers: () => ({
        'x-request-id': crypto.randomUUID(),
        ...sessionHeaders,
        ...headers,
      }),
      performance,
    }),
  );
};
