import { randomUUID } from 'node:crypto';
import { expect, test } from '../fixtures/test.ts';
import { HomePage } from '../pages/homePage.ts';
import { RegistrationPage } from '../pages/registrationPage.ts';
import { SignInPage } from '../pages/signInPage.ts';

const password = 'RegistrationTest1!';
const registrationEmail = (): string => `register-${randomUUID()}@example.invalid`;

test('When a visitor registers, then they can sign in as an ordinary user', async ({ page }) => {
  // Arrange
  const email = registrationEmail();
  const homePage = new HomePage(page);
  const registrationPage = new RegistrationPage(page);
  const signInPage = new SignInPage(page);

  await signInPage.goto();

  // Act
  await signInPage.registrationLink.click();

  // Assert
  await registrationPage.expectOpen();

  // Act
  await registrationPage.fillCredentials(email, password);
  await registrationPage.submit();

  // Assert
  await expect(page).toHaveURL(`${signInPage.path}?registered=1`);
  await expect(signInPage.registrationConfirmation).toBeVisible();
  const beforeSignIn = await page.request.get('/api/example');
  expect(beforeSignIn.status()).toBe(401);

  // Act
  await signInPage.fillCredentials(email, password);
  await signInPage.submit();

  // Assert
  await homePage.expectOpen();
  const ordinary = await page.request.get('/api/example');
  const restricted = await page.request.get('/api/example/restricted');
  expect(ordinary.status()).toBe(200);
  expect(restricted.status()).toBe(403);
});

test('When registration passwords do not match, then the visitor sees a validation message', async ({ page }) => {
  // Arrange
  const registrationPage = new RegistrationPage(page);
  await registrationPage.goto();
  await registrationPage.fillCredentials(registrationEmail(), password, 'DifferentPassword1!');

  // Act
  await registrationPage.submit();

  // Assert
  await expect(page.getByText('The passwords do not match.', { exact: true })).toBeVisible();
  await registrationPage.expectOpen();
});

test('When an existing email is registered again, then registration is rejected without signing in', async ({
  page,
}) => {
  // Arrange
  const email = registrationEmail();
  const registrationPage = new RegistrationPage(page);
  const signInPage = new SignInPage(page);

  await registrationPage.goto();
  await registrationPage.fillCredentials(email, password);
  await registrationPage.submit();
  await page.waitForURL(`${signInPage.path}?registered=1`);
  await registrationPage.goto();
  await registrationPage.fillCredentials(email, password);

  // Act
  await registrationPage.submit();

  // Assert
  await expect(registrationPage.error.filter({ hasText: 'Unable to create the account.' })).toBeVisible();
  await registrationPage.expectOpen();
  const response = await page.request.get('/api/example');
  expect(response.status()).toBe(401);
});
