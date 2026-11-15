import { z } from 'zod';
import { tt } from '#content/index.ts';
import { credentialsSchema } from '#features/auth/login/schema.ts';

export const registrationSchema = credentialsSchema
  .extend({
    confirmPassword: z
      .string({ error: tt('forms.validation.confirmPasswordRequired') })
      .min(1, { error: tt('forms.validation.confirmPasswordRequired') }),
  })
  .refine(values => values.password === values.confirmPassword, {
    message: tt('pages.register.errors.passwordMismatch'),
    path: ['confirmPassword'],
  });
