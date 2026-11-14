import { expect, test, userStorageState } from './fixtures/test.ts';

test.use({ storageState: userStorageState });

test('When a regular user opens a protected page, then they see access denied', async ({ page }) => {
  // Arrange / Act
  await page.goto('/restricted');

  // Assert
  await expect(page).toHaveURL('/access-denied');
  await expect(page.getByRole('heading', { exact: true, name: 'Access denied' })).toBeVisible();
});

test('When a regular user calls the BFF directly, then access is forbidden', async ({ request }) => {
  // Arrange / Act
  const response = await request.get('/api/example/restricted');

  // Assert
  expect(response.status()).toBe(403);
});

test('When a regular user signs out from access denied, then they can sign in with another account', async ({
  page,
}) => {
  // Arrange
  await page.goto('/access-denied');

  // Act
  await page.getByRole('button', { exact: true, name: 'Sign out' }).click();

  // Assert
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { exact: true, name: 'Sign in' })).toBeVisible();
});
