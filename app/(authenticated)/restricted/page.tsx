import { Alert } from '@mantine/core';
import { ResultType } from '@next-box/route-handler';
import { redirect } from 'next/navigation.js';
import { type ReactNode } from 'react';
import { BreadcrumbNavigation } from '#app/_components/BreadcrumbNavigation.tsx';
import { PageLayout } from '#components/PageLayout/PageLayout.tsx';
import { RecordValues } from '#components/RecordValues/RecordValues.tsx';
import { tt } from '#content/index.ts';
import { RestrictedExample } from '#features/example/RestrictedExample.tsx';
import { getExample } from '#features/example/getExample.ts';
import { EXAMPLE_ACCESS_POLICY } from '#libs/Auth/policies.ts';
import { requireSession } from '#server/auth/requireSession.ts';
import { createServerApiClient } from '#server/createServerApiClient.ts';

const RestrictedPage = async (): Promise<ReactNode> => {
  const session = await requireSession();

  if (!session.user.policies.includes(EXAMPLE_ACCESS_POLICY)) {
    redirect('/access-denied');
  }

  const result = session.apiAccessToken
    ? await getExample({
        context: { apiClient: await createServerApiClient({ session }) },
        input: { restricted: true },
      })
    : undefined;

  return (
    <PageLayout breadcrumbs={<BreadcrumbNavigation />} title={tt('pages.restricted.title')}>
      {!result && <RestrictedExample />}
      {result?.type === ResultType.Success ? (
        <RecordValues fields={[{ label: tt('pages.example.message'), value: result.data.message }]} />
      ) : (
        result && (
          <Alert color="red" role="alert">
            {tt('pages.example.unavailable')}
          </Alert>
        )
      )}
    </PageLayout>
  );
};

export default RestrictedPage;
