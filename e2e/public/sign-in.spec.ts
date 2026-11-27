import { expect, signIn, test } from '../fixtures/test.ts';
import { HomePage } from '../pages/homePage.ts';
import { SignInPage } from '../pages/signInPage.ts';

test('When an anonymous user visits the application, then they are asked to sign in', async ({ page }) => {
  // Arrange / Act
  await new HomePage(page).goto();

  // Assert
  await new SignInPage(page).expectOpen();
});

test('When credentials are invalid, then sign-in fails without creating a session', async ({ page }) => {
  // Arrange
  const signInPage = new SignInPage(page);
  await signInPage.goto();
  await signInPage.fillCredentials('invalid-e2e@example.invalid', 'invalid-e2e-password');

  // Act
  await signInPage.submit();

  // Assert
  await expect(signInPage.error.filter({ hasText: 'The email or password is incorrect.' })).toBeVisible();
  await signInPage.expectOpen();
  const response = await page.request.get('/api/example');
  expect(response.status()).toBe(401);
});

test('When a privileged user signs in with valid credentials, then they enter the application', async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);

  // Act
  await signIn(page, 'PRIVILEGED');

  // Assert
  await homePage.expectOpen();
  await expect(homePage.signOutButton).toBeVisible();
});
