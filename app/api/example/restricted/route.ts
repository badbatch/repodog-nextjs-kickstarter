import { NextResponse } from 'next/server.js';
import { loadAppSettings } from '#appSettings/index.ts';
import { EXAMPLE_ACCESS_POLICY } from '#libs/Auth/policies.ts';
import { createApiHandler } from '#server/createApiHandler.ts';

/**
 * @response exampleResponseSchema
 */
export const GET = createApiHandler({
  handler: async (_request, _routeContext, { apiClient, requestId }) => {
    const settings = await loadAppSettings();

    try {
      const response = await apiClient.getRestrictedExample({
        signal: AbortSignal.timeout(settings.Server.Api.TimeoutMs),
      });

      return NextResponse.json(response.data, { status: response.status });
    } catch {
      return Response.json({ error: 'The API is unavailable', requestId }, { status: 503 });
    }
  },
  policy: EXAMPLE_ACCESS_POLICY,
});
