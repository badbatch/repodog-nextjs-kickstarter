import { type Page } from '@playwright/test';
import { BasePage } from './basePage.ts';

export class AccessDeniedPage extends BasePage {
  constructor(page: Page) {
    super(page, '/access-denied', 'Access denied');
  }

  async signOut(): Promise<void> {
    await this.page.getByRole('button', { exact: true, name: 'Sign out' }).click();
  }
}
