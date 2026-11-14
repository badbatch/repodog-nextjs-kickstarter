import { NextResponse } from 'next/server.js';
import { loadAppSettings } from '#appSettings/index.ts';
import { createApiHandler } from '#server/createApiHandler.ts';

/**
 * @response exampleResponseSchema
 */
export const GET = createApiHandler({
  handler: async (_request, _routeContext, { apiClient, requestId }) => {
    const settings = await loadAppSettings();

    try {
      const apiResponse = await apiClient.getExample({
        signal: AbortSignal.timeout(settings.Server.Api.TimeoutMs),
      });

      return NextResponse.json(apiResponse.data, {
        status: apiResponse.status,
      });
    } catch {
      return Response.json({ error: 'The API is unavailable', requestId }, { status: 503 });
    }
  },
});
