import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './basePage.ts';

export class RestrictedPage extends BasePage {
  readonly result: Locator;

  constructor(page: Page) {
    super(page, '/restricted', 'Restricted example');
    this.result = page.getByText('You have access to the restricted example.', { exact: true });
  }
}
