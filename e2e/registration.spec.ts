import { randomUUID } from 'node:crypto';
import { expect, test } from './fixtures/test.ts';

const password = 'RegistrationTest1!';
const passwordLabelPattern = /^Password/u;
const confirmationLabelPattern = /^Confirm password/u;

const registrationEmail = (): string => `register-${randomUUID()}@example.invalid`;

test('When a visitor registers, then they can sign in as an ordinary user', async ({ page }) => {
  // Arrange
  const email = registrationEmail();
  await page.goto('/login');

  // Act
  await page.getByRole('link', { exact: true, name: 'Create an account' }).click();
  await expect(page).toHaveURL('/register');
  await page.getByRole('textbox', { exact: true, name: 'Email' }).fill(email);
  await page.getByLabel(passwordLabelPattern).fill(password);
  await page.getByLabel(confirmationLabelPattern).fill(password);
  await page.getByRole('button', { exact: true, name: 'Create account' }).click();

  // Assert
  await expect(page).toHaveURL('/login?registered=1');
  await expect(page.getByRole('status').filter({ hasText: 'Your account has been created.' })).toBeVisible();
  const beforeSignIn = await page.request.get('/api/example');
  expect(beforeSignIn.status()).toBe(401);
  await page.getByRole('textbox', { exact: true, name: 'Email' }).fill(email);
  await page.getByLabel(passwordLabelPattern).fill(password);
  await page.getByRole('button', { exact: true, name: 'Sign in' }).click();
  await expect(page).toHaveURL('/');
  const ordinary = await page.request.get('/api/example');
  const restricted = await page.request.get('/api/example/restricted');
  expect(ordinary.status()).toBe(200);
  expect(restricted.status()).toBe(403);
});

test('When registration passwords do not match, then the visitor sees a validation message', async ({ page }) => {
  // Arrange
  await page.goto('/register');
  await page.getByRole('textbox', { exact: true, name: 'Email' }).fill(registrationEmail());
  await page.getByLabel(passwordLabelPattern).fill(password);
  await page.getByLabel(confirmationLabelPattern).fill('DifferentPassword1!');

  // Act
  await page.getByRole('button', { exact: true, name: 'Create account' }).click();

  // Assert
  await expect(page.getByText('The passwords do not match.', { exact: true })).toBeVisible();
  await expect(page).toHaveURL('/register');
});

test('When an existing email is registered again, then registration is rejected without signing in', async ({
  page,
}) => {
  // Arrange
  const email = registrationEmail();
  await page.goto('/register');
  await page.getByRole('textbox', { exact: true, name: 'Email' }).fill(email);
  await page.getByLabel(passwordLabelPattern).fill(password);
  await page.getByLabel(confirmationLabelPattern).fill(password);
  await page.getByRole('button', { exact: true, name: 'Create account' }).click();
  await expect(page).toHaveURL('/login?registered=1');
  await page.goto('/register');
  await page.getByRole('textbox', { exact: true, name: 'Email' }).fill(email);
  await page.getByLabel(passwordLabelPattern).fill(password);
  await page.getByLabel(confirmationLabelPattern).fill(password);

  // Act
  await page.getByRole('button', { exact: true, name: 'Create account' }).click();

  // Assert
  await expect(page.getByRole('alert').filter({ hasText: 'Unable to create the account.' })).toBeVisible();
  await expect(page).toHaveURL('/register');
  const response = await page.request.get('/api/example');
  expect(response.status()).toBe(401);
});
