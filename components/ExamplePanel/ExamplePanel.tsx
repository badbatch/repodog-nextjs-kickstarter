'use client';

import { Alert, Button, Stack, Title } from '@mantine/core';
import { type ReactNode } from 'react';
import { tt } from '#content/index.ts';
import { useApi } from '#libs/ApiClient/useApi.ts';
import { useApiClient } from '#libs/ApiClient/useApiClient.ts';

export const ExamplePanel = (): ReactNode => {
  const apiClient = useApiClient();
  const { execute, isError, isLoading, isSuccess } = useApi(apiClient.getExample);

  return (
    <Stack maw={580} mx="auto" my="xl">
      <Title order={2}>{tt('pages.example.title')}</Title>
      <Button
        loading={isLoading}
        onClick={() => {
          void execute();
        }}
      >
        {tt('pages.example.action')}
      </Button>
      {isSuccess && <Alert role="status">{tt('pages.example.success')}</Alert>}
      {isError && (
        <Alert color="red" role="alert">
          {tt('pages.example.unavailable')}
        </Alert>
      )}
    </Stack>
  );
};
