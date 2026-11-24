import { type Logger, getLogger } from '@next-box/logging';
import { cache } from 'react';
import { readApiSession } from './auth/apiAuth.ts';
import { getServerRequestIds } from './getServerRequestIds.ts';

export type ServerRequestContext = { correlationId: string; logger: Logger; requestId: string };

export const getServerRequestContext = cache(async (): Promise<ServerRequestContext> => {
  const session = await readApiSession();
  const { correlationId, requestId } = await getServerRequestIds(session?.correlationId);
  const logger = getLogger(['application']).with({ correlationId, requestId });
  return { correlationId, logger, requestId };
});
