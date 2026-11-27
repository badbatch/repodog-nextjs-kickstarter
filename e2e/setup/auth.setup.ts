import { expect, privilegedStorageState, signIn, test, userStorageState } from '../fixtures/test.ts';
import { HomePage } from '../pages/homePage.ts';

test('When a privileged user signs in, then their authenticated session is saved', async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);

  // Act
  await signIn(page, 'PRIVILEGED');

  // Assert
  await homePage.expectOpen();
  await expect(homePage.signOutButton).toBeVisible();
  await page.context().storageState({ path: privilegedStorageState });
});

test('When a regular user signs in, then their authenticated session is saved', async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);

  // Act
  await signIn(page, 'USER');

  // Assert
  await homePage.expectOpen();
  await expect(homePage.signOutButton).toBeVisible();
  await page.context().storageState({ path: userStorageState });
});
