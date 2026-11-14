'use client';

import { Alert, Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { type ReactNode, useActionState } from 'react';
import { login } from './actions.ts';

const LoginPage = (): ReactNode => {
  const [error, action, pending] = useActionState(login, undefined);

  return (
    <Container py="xl" size={420}>
      <Paper p="xl" withBorder>
        <form action={action}>
          <Stack>
            <Title order={1}>Sign in</Title>
            {error && (
              <Alert color="red" role="alert">
                {error}
              </Alert>
            )}
            <TextInput autoComplete="username" label="Email" name="email" required type="email" />
            <PasswordInput autoComplete="current-password" label="Password" name="password" required />
            <Button loading={pending} type="submit">
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
