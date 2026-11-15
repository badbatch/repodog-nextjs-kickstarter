import { type z } from 'zod';
import { type credentialsSchema } from './schema.ts';

export type LoginInput = z.input<typeof credentialsSchema>;
export type LoginOutput = z.output<typeof credentialsSchema>;
