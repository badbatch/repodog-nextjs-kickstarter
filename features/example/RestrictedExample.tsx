'use client';

import { Alert, Center, Loader } from '@mantine/core';
import { redirect } from 'next/navigation.js';
import { useSession } from 'next-auth/react';
import { type ReactNode, useEffect } from 'react';
import { RecordValues } from '#components/RecordValues/RecordValues.tsx';
import { tt } from '#content/index.ts';
import { ApiAccessError } from '#libs/ApiClient/ApiAccessError.ts';
import { ApiResponseError } from '#libs/ApiClient/ApiResponseError.ts';
import { useApi } from '#libs/ApiClient/useApi.ts';
import { useApiClient } from '#libs/ApiClient/useApiClient.ts';

export const RestrictedExample = (): ReactNode => {
  const { status: sessionStatus } = useSession();
  const apiClient = useApiClient();
  const { data, error, execute } = useApi(apiClient.getExampleRestricted);

  useEffect(() => {
    // The session provider may already be refreshing on mount.
    if (sessionStatus === 'loading') {
      return;
    }

    void execute();
  }, [execute, sessionStatus]);

  if (error instanceof ApiAccessError) {
    redirect('/access-denied');
  }

  if (error instanceof ApiResponseError && error.status === 401) {
    redirect('/login');
  }

  if (error) {
    return (
      <Alert color="red" role="alert">
        {tt('pages.example.unavailable')}
      </Alert>
    );
  }

  if (data) {
    return <RecordValues fields={[{ label: tt('pages.example.message'), value: data.message }]} />;
  }

  return (
    <Center aria-busy role="status">
      <Loader />
    </Center>
  );
};
