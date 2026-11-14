import { expect, privilegedStorageState, test } from './fixtures/test.ts';

test.use({ storageState: privilegedStorageState });

test('When a privileged user opens a protected page, then access is granted', async ({ page }) => {
  // Arrange / Act
  await page.goto('/');

  // Assert
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { exact: true, name: 'Sign out' })).toBeVisible();
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
  await page.goto('/');

  // Act
  await page.getByRole('button', { exact: true, name: 'Sign out' }).click();
  await expect(page).toHaveURL('/login');
  await page.goto('/');

  // Assert
  await expect(page).toHaveURL('/login');
  const response = await page.request.get('/api/example');
  expect(response.status()).toBe(401);
});

test('When a privileged user visits the restricted example, then the page and API grant access', async ({ page }) => {
  // Arrange / Act
  await page.goto('/restricted');
  const response = await page.request.get('/api/example/restricted');
  // Assert
  await expect(page.getByRole('heading', { exact: true, name: 'Restricted example' })).toBeVisible();
  expect(response.status()).toBe(200);
});
