import { expect, signIn, test } from './fixtures/test.ts';

test('When an anonymous user visits the application, then they are asked to sign in', async ({ page }) => {
  // Arrange / Act
  await page.goto('/');

  // Assert
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { exact: true, name: 'Sign in' })).toBeVisible();
});

test('When credentials are invalid, then sign-in fails without creating a session', async ({ page }) => {
  // Arrange
  await page.goto('/login');
  await page.getByRole('textbox', { exact: true, name: 'Email' }).fill('invalid-e2e@example.invalid');
  await page.getByLabel(/^Password/u).fill('invalid-e2e-password');

  // Act
  await page.getByRole('button', { exact: true, name: 'Sign in' }).click();

  // Assert
  await expect(page.getByRole('alert').filter({ hasText: 'The email or password is incorrect.' })).toBeVisible();
  await expect(page).toHaveURL('/login');
  const response = await page.request.get('/api/example');
  expect(response.status()).toBe(401);
});

test('When a privileged user signs in with valid credentials, then they enter the application', async ({ page }) => {
  // Arrange / Act
  await signIn(page, 'PRIVILEGED');

  // Assert
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { exact: true, name: 'Sign out' })).toBeVisible();
});
