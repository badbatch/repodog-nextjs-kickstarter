import { type z } from 'zod';
import { type registrationSchema } from './schema.ts';

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationOutput = z.output<typeof registrationSchema>;
