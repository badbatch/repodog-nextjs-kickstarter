import { expect, test, userStorageState } from '../fixtures/test.ts';
import { HomePage } from '../pages/homePage.ts';

test.use({ storageState: userStorageState });

test('When a regular user signs in, then the authenticated page and ordinary API are available', async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  await homePage.goto();

  // Act
  await homePage.loadExample();

  // Assert
  await homePage.expectOpen();
  await expect(homePage.exampleStatus).toHaveText('The API request succeeded.');
  const response = await page.request.get('/api/example');
  expect(response.status()).toBe(200);
});
