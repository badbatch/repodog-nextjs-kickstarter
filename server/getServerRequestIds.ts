import { headers } from 'next/headers.js';

export const getServerRequestIds = async (
  sessionCorrelationId?: string,
): Promise<{ correlationId: string; requestId: string }> => {
  const requestHeaders = await headers();

  return {
    correlationId: requestHeaders.get('x-correlation-id') ?? sessionCorrelationId ?? crypto.randomUUID(),
    requestId: requestHeaders.get('x-request-id') ?? crypto.randomUUID(),
  };
};
