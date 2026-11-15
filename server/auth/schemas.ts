import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().trim().pipe(z.email().max(256)),
  password: z.string().min(1),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().positive(),
  refreshToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
});

export const currentUserSchema = z.object({
  email: z.string().nullish(),
  id: z.string().min(1),
  policies: z.array(z.string()),
  roles: z.array(z.string()),
  userName: z.string().nullish(),
});
