'use client';

import { Alert, Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { Link } from '@next-box/link-extra';
import { type ReactNode, useActionState } from 'react';
import { tt } from '#content/index.ts';
import { register } from './actions.ts';

const RegisterPage = (): ReactNode => {
  const [error, action, pending] = useActionState(register, undefined);

  return (
    <Container py="xl" size={420}>
      <Paper p="xl" withBorder>
        <form action={action}>
          <Stack>
            <Title order={1}>{tt('pages.register.title')}</Title>
            {error && (
              <Alert color="red" role="alert">
                {error}
              </Alert>
            )}
            <TextInput
              autoComplete="username"
              label={tt('pages.register.email')}
              maxLength={256}
              name="email"
              required
              type="email"
            />
            <PasswordInput
              autoComplete="new-password"
              description={tt('pages.register.passwordHelp')}
              label={tt('pages.register.password')}
              name="password"
              required
            />
            <PasswordInput
              autoComplete="new-password"
              label={tt('pages.register.confirmPassword')}
              name="confirmPassword"
              required
            />
            <Button loading={pending} type="submit">
              {tt('pages.register.submit')}
            </Button>
            <Link disableRouterCache={false} href="/login">
              {tt('pages.register.signIn')}
            </Link>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
