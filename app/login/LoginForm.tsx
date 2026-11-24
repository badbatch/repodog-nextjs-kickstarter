'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { Link } from '@next-box/link-extra';
import { useSearchParams } from 'next/navigation.js';
import { type ReactNode, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { tt } from '#content/index.ts';
import { credentialsSchema } from '#features/auth/login/schema.ts';
import { type LoginInput, type LoginOutput } from '#features/auth/login/types.ts';
import { login } from './actions.ts';

export const LoginForm = (): ReactNode => {
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register: registerField,
    setError,
  } = useForm<LoginInput, unknown, LoginOutput>({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(credentialsSchema),
  });

  const submit = handleSubmit(values => {
    clearErrors('root');

    startTransition(async () => {
      const formData = new FormData();

      for (const [field, value] of Object.entries(values)) {
        formData.set(field, value);
      }

      const result = await login(formData);

      if (result?.fieldErrors?.email?.[0]) {
        setError('email', { message: result.fieldErrors.email[0], type: 'server' });
      }

      if (result?.fieldErrors?.password?.[0]) {
        setError('password', { message: result.fieldErrors.password[0], type: 'server' });
      }

      if (result?.formError) {
        setError('root.server', { message: result.formError, type: 'server' });
      }
    });
  });

  return (
    <Container py="xl" size={420}>
      <Paper p="xl" withBorder>
        <form
          method="post"
          noValidate
          onSubmit={event => {
            void submit(event);
          }}
        >
          <Stack>
            <Title order={1}>{tt('pages.login.title')}</Title>
            {searchParams.get('registered') === '1' && (
              <Alert color="green" role="status">
                {tt('pages.login.registered')}
              </Alert>
            )}
            {errors.root?.server?.message && (
              <Alert color="red" role="alert">
                {errors.root.server.message}
              </Alert>
            )}
            <TextInput
              autoComplete="username"
              error={errors.email?.message}
              label={tt('pages.login.email')}
              {...registerField('email')}
              required
              type="email"
            />
            <PasswordInput
              autoComplete="current-password"
              error={errors.password?.message}
              label={tt('pages.login.password')}
              {...registerField('password')}
              required
            />
            <Button disabled={pending} loading={pending} type="submit">
              {tt('pages.login.title')}
            </Button>
            <Link href="/register">{tt('pages.login.register')}</Link>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
