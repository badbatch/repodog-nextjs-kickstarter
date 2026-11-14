import { expect, privilegedStorageState, signIn, test, userStorageState } from './fixtures/test.ts';

test('When a privileged user signs in, then their authenticated session is saved', async ({ page }) => {
  // Arrange / Act
  await signIn(page, 'PRIVILEGED');

  // Assert
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { exact: true, name: 'Sign out' })).toBeVisible();
  await page.context().storageState({ path: privilegedStorageState });
});

test('When a regular user signs in, then their authenticated session is saved', async ({ page }) => {
  // Arrange / Act
  await signIn(page, 'USER');

  // Assert
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { exact: true, name: 'Sign out' })).toBeVisible();
  await page.context().storageState({ path: userStorageState });
});
