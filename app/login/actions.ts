'use server';

import { AuthError } from 'next-auth';
import { z } from 'zod';
import { signIn } from '#auth.ts';
import { tt } from '#content/index.ts';
import { credentialsSchema } from '#features/auth/login/schema.ts';
import { type LoginInput } from '#features/auth/login/types.ts';
import { type FormActionResult } from '#libs/Forms/types.ts';

export const login = async (formData: FormData): Promise<FormActionResult<LoginInput> | undefined> => {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
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
      return {
        // Keep literal content paths so editor previews remain available.
        formError:
          // eslint-disable-next-line unicorn/prefer-minimal-ternary
          error.type === 'CredentialsSignin'
            ? tt('pages.login.errors.invalidCredentials')
            : tt('pages.login.errors.unavailable'),
      };
    }

    throw error;
  }
};
