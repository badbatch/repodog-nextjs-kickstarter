import { expect, privilegedStorageState, test } from '../fixtures/test.ts';
import { HomePage } from '../pages/homePage.ts';
import { RestrictedPage } from '../pages/restrictedPage.ts';
import { SignInPage } from '../pages/signInPage.ts';

test.use({ storageState: privilegedStorageState });

test('When a privileged user opens a protected page, then access is granted', async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);

  // Act
  await homePage.goto();

  // Assert
  await homePage.expectOpen();
  await expect(homePage.signOutButton).toBeVisible();
});

test('When a privileged user calls the BFF, then the authenticated API request succeeds', async ({ request }) => {
  // Arrange / Act
  const response = await request.get('/api/example');

  // Assert
  expect(response.status()).toBe(200);
});

test('When the browser reads its session, then example policies are exposed without API tokens', async ({
  request,
}) => {
  // Arrange / Act
  const response = await request.get('/api/auth/session');
  const session: unknown = await response.json();

  // Assert
  expect(response.status()).toBe(200);

  const expectedPolicies = expect.arrayContaining(['ExampleAccess']);

  expect(session).toEqual(
    expect.objectContaining({
      correlationId: expect.any(String),
      user: expect.objectContaining({ policies: expectedPolicies }),
    }),
  );

  expect(session).not.toHaveProperty('apiTokens');
  expect(session).not.toHaveProperty('apiAccessToken');
  expect(JSON.stringify(session)).not.toMatch(/accessToken|refreshToken/u);
});

test('When a privileged user signs out, then protected pages and BFF requests require authentication', async ({
  page,
}) => {
  // Arrange
  const homePage = new HomePage(page);
  const signInPage = new SignInPage(page);

  await homePage.goto();

  // Act
  await homePage.signOut();

  // Assert
  await signInPage.expectOpen();

  // Act
  await homePage.goto();

  // Assert
  await signInPage.expectOpen();
  const response = await page.request.get('/api/example');
  expect(response.status()).toBe(401);
});

test('When a privileged user visits the restricted example, then the page displays the backend result and the API grants access', async ({
  page,
}) => {
  // Arrange
  const restrictedPage = new RestrictedPage(page);

  // Act
  await restrictedPage.goto();
  const response = await page.request.get('/api/example/restricted');

  // Assert
  await restrictedPage.expectOpen();
  await expect(restrictedPage.result).toBeVisible();
  expect(response.status()).toBe(200);
});
