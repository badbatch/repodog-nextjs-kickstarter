import { type Logger } from '@next-box/logging';
import { type Session } from 'next-auth';
import { type ServerApiClient } from '#libs/ApiClient/types.ts';
import { createServerApiClient } from './createServerApiClient.ts';
import { type ServerRequestContext } from './getServerRequestContext.ts';

export const buildOperationContext = async (
  session: Session,
  { correlationId, logger, requestId }: ServerRequestContext,
): Promise<{ apiClient: ServerApiClient; logger: Logger }> => {
  const apiClient = await createServerApiClient({
    headers: { 'x-correlation-id': correlationId, 'x-request-id': requestId },
    session,
  });

  return { apiClient, logger };
};
