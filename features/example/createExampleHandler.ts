import { ResultType } from '@next-box/route-handler';
import { createApiHandler } from '#server/createApiHandler.ts';
import { getExample } from './getExample.ts';

export const createExampleHandler = ({
  policy,
  restricted,
}: {
  policy?: string;
  restricted: boolean;
}): ReturnType<typeof createApiHandler> =>
  createApiHandler({
    handler: async (_request, _routeContext, { apiClient, requestId }) => {
      const result = await getExample({ context: { apiClient }, input: { restricted } });

      if (result.type === ResultType.Success) {
        return Response.json(result.data);
      }

      if (result.type === ResultType.Failure) {
        return Response.json(result.details.body, { status: result.details.status });
      }

      return Response.json({ error: 'The API is unavailable', requestId }, { status: 503 });
    },
    policy,
  });
