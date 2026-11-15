'use server';

import { AuthError } from 'next-auth';
import { signIn } from '#auth.ts';
import { tt } from '#content/index.ts';
import { credentialsSchema } from '#server/auth/schemas.ts';

export const login = async (_previous: string | undefined, formData: FormData): Promise<string | undefined> => {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return tt('pages.login.errors.invalidCredentials');
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/',
    });

    return;
  } catch (error) {
    if (error instanceof AuthError) {
      // Leaving as to not break content path preview
      // eslint-disable-next-line unicorn/prefer-minimal-ternary
      return error.type === 'CredentialsSignin'
        ? tt('pages.login.errors.invalidCredentials')
        : tt('pages.login.errors.unavailable');
    }

    throw error;
  }
};
