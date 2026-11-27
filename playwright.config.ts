import nextEnv from '@next/env';
import { defineConfig, devices } from '@playwright/test';
import { randomUUID } from 'node:crypto';

// Load the same local environment files as the application before configuring the test server.
// eslint-disable-next-line unicorn/no-top-level-side-effects
nextEnv.loadEnvConfig(process.cwd(), true);

const externalBaseUrl = process.env.E2E_BASE_URL;
const baseURL = externalBaseUrl ?? 'http://localhost:3100';

if (!externalBaseUrl) {
  process.env.AUTH_SECRET ??= randomUUID();
}

// Playwright requires a default export.
// eslint-disable-next-line import-x/no-default-export
export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  projects: [
    { name: 'setup', testDir: './e2e/setup', testMatch: '**/*.setup.ts', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'public',
      testDir: './e2e/public',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      dependencies: ['setup'],
      name: 'authenticated',
      testDir: './e2e/authenticated',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'pnpm dev --port 3100',
        env: {
          AUTH_SECRET: process.env.AUTH_SECRET ?? '',
          AUTH_TRUST_HOST: 'true',
          AUTH_URL: baseURL,
          NEXT_PUBLIC_LANGUAGE_CODE: 'en',
        },
        reuseExistingServer: false,
        timeout: 120_000,
        url: `${baseURL}/login`,
      },
  workers: process.env.CI ? 1 : undefined,
});
