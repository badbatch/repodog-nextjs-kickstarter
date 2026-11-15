'use client';

import { Alert, Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { Link } from '@next-box/link-extra';
import { useSearchParams } from 'next/navigation.js';
import { type ReactNode, useActionState } from 'react';
import { tt } from '#content/index.ts';
import { login } from './actions.ts';

const LoginPage = (): ReactNode => {
  const searchParams = useSearchParams();
  const [error, action, pending] = useActionState(login, undefined);

  return (
    <Container py="xl" size={420}>
      <Paper p="xl" withBorder>
        <form action={action}>
          <Stack>
            <Title order={1}>{tt('pages.login.title')}</Title>
            {searchParams.get('registered') === '1' && (
              <Alert color="green" role="status">
                {tt('pages.login.registered')}
              </Alert>
            )}
            {error && (
              <Alert color="red" role="alert">
                {error}
              </Alert>
            )}
            <TextInput autoComplete="username" label={tt('pages.login.email')} name="email" required type="email" />
            <PasswordInput
              autoComplete="current-password"
              label={tt('pages.login.password')}
              name="password"
              required
            />
            <Button loading={pending} type="submit">
              {tt('pages.login.title')}
            </Button>
            <Link disableRouterCache={false} href="/register">
              {tt('pages.login.register')}
            </Link>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
