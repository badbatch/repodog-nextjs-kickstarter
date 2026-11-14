import { createMiddleware } from '@next-box/route-handler';
import { type ServerApiClient } from '#libs/ApiClient/types.ts';
import { createServerApiClient } from '#server/createServerApiClient.ts';

export const withApiClient = createMiddleware<
  Record<string, string>,
  { accessToken: string; correlationId: string; requestId: string },
  { apiClient: ServerApiClient }
>(async (_request, _routeContext, { accessToken, correlationId, requestId }, next) => {
  const apiClient = await createServerApiClient({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-correlation-id': correlationId,
      'x-request-id': requestId,
    },
  });

  return next({ context: { apiClient } });
});
