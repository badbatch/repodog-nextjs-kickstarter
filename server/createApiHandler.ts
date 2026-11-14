import { type Handler, type RouteContext, createHandlerFactory } from '@next-box/route-handler';
import { type NextRequest } from 'next/server.js';
import { type ServerApiClient } from '#libs/ApiClient/types.ts';
import { withApiClient } from '#libs/ApiClient/withApiClient.ts';
import { withAuth } from '#server/middleware/withAuth.ts';
import { withCorrelationId } from '#server/middleware/withCorrelationId.ts';
import { withPolicy } from '#server/middleware/withPolicy.ts';
import { withRequestId } from '#server/middleware/withRequestId.ts';

export const createApiHandler = <TParams extends object = Record<string, never>>(options: {
  handler: Handler<{ apiClient: ServerApiClient; correlationId: string; requestId: string }, TParams>;
  policy?: string;
}) => {
  const handlerFactory = createHandlerFactory({
    middleware: [withRequestId, withCorrelationId, withAuth, withPolicy(options.policy), withApiClient],
  });

  const handler = handlerFactory<TParams>({ handler: options.handler });

  return (request: NextRequest, routeContext: RouteContext<TParams>): Promise<Response> =>
    handler(request, routeContext, {});
};
