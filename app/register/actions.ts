'use server';

import { redirect } from 'next/navigation.js';
import { z } from 'zod';
import { loadAppSettings } from '#appSettings/index.ts';
import { tt } from '#content/index.ts';
import { registrationSchema } from '#features/auth/register/schema.ts';
import { type RegistrationInput } from '#features/auth/register/types.ts';
import { type FormActionResult } from '#libs/Forms/types.ts';
import { createServerApiClient } from '#server/createServerApiClient.ts';

export const register = async (formData: FormData): Promise<FormActionResult<RegistrationInput> | undefined> => {
  const parsed = registrationSchema.safeParse({
    confirmPassword: formData.get('confirmPassword'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  let status: number;

  try {
    const settings = await loadAppSettings();
    const apiClient = await createServerApiClient();

    const response = await apiClient.registerUser({
      body: { email: parsed.data.email, password: parsed.data.password },
      signal: AbortSignal.timeout(settings.Server.Api.TimeoutMs),
    });

    status = response.status;
  } catch {
    return { formError: tt('pages.register.errors.unavailable') };
  }

  if (status === 201) {
    redirect('/login?registered=1');
  } else if (status === 400 || status === 409) {
    return { formError: tt('pages.register.errors.rejected') };
  }

  return { formError: tt('pages.register.errors.unavailable') };
};
