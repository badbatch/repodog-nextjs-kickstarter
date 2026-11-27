import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './basePage.ts';

const passwordLabelPattern = /^Password/u;
const confirmationLabelPattern = /^Confirm password/u;

export class RegistrationPage extends BasePage {
  private readonly confirmationInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page, '/register', 'Create an account');
    this.confirmationInput = page.getByLabel(confirmationLabelPattern);
    this.emailInput = page.getByRole('textbox', { exact: true, name: 'Email' });
    this.passwordInput = page.getByLabel(passwordLabelPattern);
    this.submitButton = page.getByRole('button', { exact: true, name: 'Create account' });
    this.error = page.getByRole('alert');
  }

  async fillCredentials(email: string, password: string, confirmation = password): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmationInput.fill(confirmation);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
