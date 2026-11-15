'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { Link } from '@next-box/link-extra';
import { type ReactNode, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { tt } from '#content/index.ts';
import { registrationSchema } from '#features/auth/register/schema.ts';
import { type RegistrationInput, type RegistrationOutput } from '#features/auth/register/types.ts';
import { register } from './actions.ts';

const RegisterPage = (): ReactNode => {
  const [pending, startTransition] = useTransition();

  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register: registerField,
    setError,
  } = useForm<RegistrationInput, unknown, RegistrationOutput>({
    defaultValues: { confirmPassword: '', email: '', password: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(registrationSchema),
  });

  const submit = handleSubmit(values => {
    clearErrors('root');

    startTransition(async () => {
      const formData = new FormData();

      for (const [field, value] of Object.entries(values)) {
        formData.set(field, value);
      }

      const result = await register(formData);

      if (result?.fieldErrors?.email?.[0]) {
        setError('email', { message: result.fieldErrors.email[0], type: 'server' });
      }

      if (result?.fieldErrors?.password?.[0]) {
        setError('password', { message: result.fieldErrors.password[0], type: 'server' });
      }

      if (result?.fieldErrors?.confirmPassword?.[0]) {
        setError('confirmPassword', { message: result.fieldErrors.confirmPassword[0], type: 'server' });
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
            <Title order={1}>{tt('pages.register.title')}</Title>
            {errors.root?.server?.message && (
              <Alert color="red" role="alert">
                {errors.root.server.message}
              </Alert>
            )}
            <TextInput
              autoComplete="username"
              error={errors.email?.message}
              label={tt('pages.register.email')}
              maxLength={256}
              {...registerField('email')}
              required
              type="email"
            />
            <PasswordInput
              autoComplete="new-password"
              description={tt('pages.register.passwordHelp')}
              error={errors.password?.message}
              label={tt('pages.register.password')}
              {...registerField('password')}
              required
            />
            <PasswordInput
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              label={tt('pages.register.confirmPassword')}
              {...registerField('confirmPassword')}
              required
            />
            <Button disabled={pending} loading={pending} type="submit">
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
