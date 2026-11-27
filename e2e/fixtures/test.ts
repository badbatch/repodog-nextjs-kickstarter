import { type Page } from '@playwright/test';
import { SignInPage } from '../pages/signInPage.ts';

export const privilegedStorageState = 'playwright/.auth/privileged.json';
export const userStorageState = 'playwright/.auth/user.json';

export const requiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Set ${name} in .env.local or the test environment before running the end-to-end tests.`);
  }

  return value;
};

export const signIn = async (page: Page, account: 'PRIVILEGED' | 'USER'): Promise<void> => {
  const email = requiredEnvironmentVariable(`E2E_${account}_EMAIL`);
  const password = requiredEnvironmentVariable(`E2E_${account}_PASSWORD`);
  const signInPage = new SignInPage(page);

  await signInPage.goto();
  await signInPage.fillCredentials(email, password);
  await signInPage.submit();
};

export { expect, test } from '@playwright/test';
