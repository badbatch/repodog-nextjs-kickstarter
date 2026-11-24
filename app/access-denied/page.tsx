import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { type ReactNode } from 'react';
import { tt } from '#content/index.ts';
import { logout } from '#server/auth/actions.ts';
import { requireSession } from '#server/auth/requireSession.ts';
import { getServerRequestContext } from '#server/getServerRequestContext.ts';

const AccessDeniedPage = async (): Promise<ReactNode> => {
  const { logger } = await getServerRequestContext();
  logger.info('Rendering page', { page: '/access-denied' });

  await requireSession();

  return (
    <Container py="xl" size={480}>
      <Paper p="xl" withBorder>
        <Stack>
          <Title order={1}>{tt('pages.accessDenied.title')}</Title>
          <Text>{tt('pages.accessDenied.description')}</Text>
          <form action={logout}>
            <Button type="submit">{tt('actions.signOut')}</Button>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AccessDeniedPage;
