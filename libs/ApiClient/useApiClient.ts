'use client';

import { use } from 'react';
import { ApiContext } from '#libs/ApiClient/ApiProvider.tsx';
import { type BffApiClient } from '#libs/ApiClient/types.ts';

export const useApiClient = (): BffApiClient => {
  const client = use(ApiContext);

  if (!client) {
    throw new Error('useApi must be used within an ApiProvider.');
  }

  return client;
};
