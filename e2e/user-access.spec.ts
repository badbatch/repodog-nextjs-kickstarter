import { expect, test, userStorageState } from './fixtures/test.ts';

test.use({ storageState: userStorageState });

test('When a regular user signs in, then the authenticated page and ordinary API are available', async ({ page }) => {
  // Arrange
  await page.goto('/');
  // Act
  await page.getByRole('button', { exact: true, name: 'Load API example' }).click();
  // Assert
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('status')).toHaveText('The API request succeeded.');
  const response = await page.request.get('/api/example');
  expect(response.status()).toBe(200);
});
