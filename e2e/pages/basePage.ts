import { type Locator, type Page, expect } from '@playwright/test';

export abstract class BasePage {
  readonly heading: Locator;
  readonly path: string;
  protected readonly page: Page;

  protected constructor(page: Page, path: string, heading: string) {
    this.page = page;
    this.path = path;
    this.heading = page.getByRole('heading', { exact: true, level: 1, name: heading });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectOpen(): Promise<void> {
    await expect(this.page).toHaveURL(this.path);
    await expect(this.heading).toBeVisible();
  }
}
