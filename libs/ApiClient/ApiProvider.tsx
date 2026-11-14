'use client';

import { createRestClient } from 'getta';
import { useSession } from 'next-auth/react';
import { type FC, type ReactNode, createContext, useMemo } from 'react';
import { useAppSettingsOrThrow } from '#appSettings/hooks.ts';
import { createApiClient } from '#bff/httpClient/client.ts';
import { type BffApiClient } from '#libs/ApiClient/types.ts';

export const ApiContext = createContext<BffApiClient | undefined>(undefined);

export type ApiProviderProps = {
  children: ReactNode;
};

export const ApiProvider: FC<ApiProviderProps> = ({ children }) => {
  const bffSettings = useAppSettingsOrThrow('Bff');
  const { data: session } = useSession();
  const correlationId = session?.correlationId;

  const apiClient = useMemo(() => {
    const restClient = createRestClient({
      basePath: bffSettings.BaseUrl,
      headers: () => ({
        ...(correlationId && { 'x-correlation-id': correlationId }),
        'x-request-id': crypto.randomUUID(),
      }),
      performance,
    });

    return createApiClient(restClient);
  }, [bffSettings.BaseUrl, correlationId]);

  return <ApiContext value={apiClient}>{children}</ApiContext>;
};
