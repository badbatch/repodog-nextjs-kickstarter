import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './basePage.ts';

const passwordLabelPattern = /^Password/u;

export class SignInPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  readonly error: Locator;
  readonly registrationConfirmation: Locator;
  readonly registrationLink: Locator;

  constructor(page: Page) {
    super(page, '/login', 'Sign in');
    this.emailInput = page.getByRole('textbox', { exact: true, name: 'Email' });
    this.passwordInput = page.getByLabel(passwordLabelPattern);
    this.submitButton = page.getByRole('button', { exact: true, name: 'Sign in' });
    this.error = page.getByRole('alert');
    this.registrationConfirmation = page.getByRole('status').filter({ hasText: 'Your account has been created.' });
    this.registrationLink = page.getByRole('link', { exact: true, name: 'Create an account' });
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
