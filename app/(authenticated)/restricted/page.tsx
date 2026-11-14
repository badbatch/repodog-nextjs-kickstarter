import { Title } from '@mantine/core';
import { redirect } from 'next/navigation.js';
import { type ReactNode } from 'react';
import { auth } from '#auth.ts';
import { tt } from '#content/index.ts';
import { EXAMPLE_ACCESS_POLICY } from '#libs/Auth/policies.ts';

const RestrictedPage = async (): Promise<ReactNode> => {
  const session = await auth();

  if (!session || session.error) {
    redirect('/login');
  }

  if (!session.user.policies.includes(EXAMPLE_ACCESS_POLICY)) {
    redirect('/access-denied');
  }

  return <Title order={1}>{tt('pages.restricted.title')}</Title>;
};

export default RestrictedPage;
