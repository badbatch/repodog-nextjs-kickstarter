import { z } from 'zod';
import { tt } from '#content/index.ts';

const emailFormatSchema = z
  .email({ error: tt('forms.validation.email') })
  .max(256, { error: tt('forms.validation.emailTooLong') });

export const credentialsSchema = z.object({
  email: z
    .string({ error: tt('forms.validation.email') })
    .trim()
    .pipe(emailFormatSchema),
  password: z
    .string({ error: tt('forms.validation.passwordRequired') })
    .min(1, { error: tt('forms.validation.passwordRequired') }),
});
