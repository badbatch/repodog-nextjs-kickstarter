import { expect, test, userStorageState } from '../fixtures/test.ts';
import { AccessDeniedPage } from '../pages/accessDeniedPage.ts';
import { RestrictedPage } from '../pages/restrictedPage.ts';
import { SignInPage } from '../pages/signInPage.ts';

test.use({ storageState: userStorageState });

test('When a regular user opens a protected page, then they see access denied', async ({ page }) => {
  // Arrange / Act
  await new RestrictedPage(page).goto();

  // Assert
  await new AccessDeniedPage(page).expectOpen();
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
  const accessDeniedPage = new AccessDeniedPage(page);
  await accessDeniedPage.goto();

  // Act
  await accessDeniedPage.signOut();

  // Assert
  await new SignInPage(page).expectOpen();
});
