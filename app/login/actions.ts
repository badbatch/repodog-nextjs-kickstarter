'use server';

import { AuthError } from 'next-auth';
import { signIn } from '#auth.ts';
import { tt } from '#content/index.ts';

export const login = async (_previous: string | undefined, formData: FormData): Promise<string | undefined> => {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
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
