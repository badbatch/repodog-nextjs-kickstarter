import { type Logger, getLogger } from '@next-box/logging';
import { type Session } from 'next-auth';
import { type ServerApiClient } from '#libs/ApiClient/types.ts';
import { createServerApiClient } from './createServerApiClient.ts';
import { getServerRequestIds } from './getServerRequestIds.ts';

export const buildContext = async (session: Session): Promise<{ apiClient: ServerApiClient; logger: Logger }> => {
  const { correlationId, requestId } = await getServerRequestIds(session.correlationId);

  const apiClient = await createServerApiClient({
    headers: { 'x-correlation-id': correlationId, 'x-request-id': requestId },
    session,
  });

  const logger = getLogger(['application']).with({ correlationId, requestId });

  return { apiClient, logger };
};
