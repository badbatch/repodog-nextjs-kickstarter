import { createRestClient } from 'getta';
import { loadAppSettings } from '#appSettings/index.ts';
import { type ServerApiClient } from '#libs/ApiClient/types.ts';
import { createApiClient } from '#server/httpClient/client.ts';

type ServerApiClientOptions = {
  headers?: Record<string, string>;
};

export const createServerApiClient = async ({
  headers = {},
}: ServerApiClientOptions = {}): Promise<ServerApiClient> => {
  const settings = await loadAppSettings();

  return createApiClient(
    createRestClient({
      basePath: settings.Server.Api.BaseUrl,
      headers: () => ({
        'x-request-id': crypto.randomUUID(),
        ...headers,
      }),
      performance,
    }),
  );
};
