import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './basePage.ts';

export class HomePage extends BasePage {
  private readonly exampleButton: Locator;
  readonly exampleStatus: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page, '/', 'Welcome to Mantine');
    this.exampleButton = page.getByRole('button', { exact: true, name: 'Load API example' });
    this.exampleStatus = page.getByRole('status');
    this.signOutButton = page.getByRole('button', { exact: true, name: 'Sign out' });
  }

  async loadExample(): Promise<void> {
    await this.exampleButton.click();
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }
}
