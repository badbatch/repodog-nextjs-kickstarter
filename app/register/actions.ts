'use server';

import { redirect } from 'next/navigation.js';
import { z } from 'zod';
import { loadAppSettings } from '#appSettings/index.ts';
import { tt } from '#content/index.ts';
import { createServerApiClient } from '#server/createServerApiClient.ts';

const registrationSchema = z.object({
  confirmPassword: z.string().min(1),
  email: z.string().trim().pipe(z.email().max(256)),
  password: z.string().min(1),
});

export const register = async (_previous: string | undefined, formData: FormData): Promise<string | undefined> => {
  const parsed = registrationSchema.safeParse({
    confirmPassword: formData.get('confirmPassword'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return tt('pages.register.errors.invalidDetails');
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return tt('pages.register.errors.passwordMismatch');
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
    return tt('pages.register.errors.unavailable');
  }

  if (status === 201) {
    redirect('/login?registered=1');
  } else if (status === 400 || status === 409) {
    return tt('pages.register.errors.rejected');
  }

  return tt('pages.register.errors.unavailable');
};
