import { z } from 'zod';

const serverApiSchema = z.object({
  BaseUrl: z.url(),
  TimeoutMs: z.number().int().positive(),
});

const serverAuthSchema = z.object({
  RefreshBufferSeconds: z.number().int().positive(),
  SessionMaxAgeSeconds: z.number().int().positive(),
});

const bffBaseUrlSchema = z.union([z.url(), z.string().regex(/^\/(?!\/)/u)]);

export const appSettingsSchema = z.object({
  Application: z.object({
    Environment: z.enum(['development', 'test', 'production']),
    Name: z.string().min(1),
  }),
  Bff: z.object({
    BaseUrl: bffBaseUrlSchema,
  }),
  Server: z.object({
    Api: serverApiSchema,
    Auth: serverAuthSchema,
  }),
});

export type AppSettingsConfig = z.infer<typeof appSettingsSchema>;
