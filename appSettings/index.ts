import { AppSettingsSource, EnvironmentSource, createAppSettings } from '@next-box/appsettings/server';
import { type AppSettingsConfig, appSettingsSchema } from './schema.ts';

const environments = [
  'development',
  'test',
  'production',
] as const satisfies readonly AppSettingsConfig['Application']['Environment'][];

const environment = environments.find(value => value === process.env.NODE_ENV) ?? 'development';

export const loadAppSettings = (): Promise<Readonly<AppSettingsConfig>> =>
  createAppSettings({
    defaults: {
      Application: {
        Environment: environment,
        Name: 'Kickstarter',
      },
      Bff: {
        BaseUrl: '/api',
      },
      Server: {
        Api: {
          BaseUrl: 'http://localhost:8080',
          TimeoutMs: 10_000,
        },
        Auth: {
          RefreshBufferSeconds: 30,
          SessionMaxAgeSeconds: 28_800,
        },
      },
    },
    schema: appSettingsSchema,
    sources: [
      new AppSettingsSource({ directory: './config', environment }),
      new EnvironmentSource({ envs: process.env, prefix: 'KICKSTARTER_' }),
    ],
  });
