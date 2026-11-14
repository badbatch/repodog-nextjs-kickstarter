import { encode } from 'next-auth/jwt';
import { expect, privilegedStorageState, requiredEnvironmentVariable, test } from './fixtures/test.ts';

test.use({ storageState: privilegedStorageState });

test('When the session has expired, then BFF requests are rejected and protected pages require sign-in', async ({
  baseURL,
  context,
  page,
}) => {
  // Arrange: keep a cookie present but expire its encrypted JWT, rather than just removing the session.
  const cookies = await context.cookies();
  const sessionCookie = cookies.find(cookie => /authjs\.session-token(?:\.\d+)?$/u.test(cookie.name));
  expect(sessionCookie).toBeDefined();
  const cookieName = sessionCookie?.name.replace(/\.\d+$/u, '') ?? 'authjs.session-token';

  const expiredToken = await encode({
    maxAge: -60,
    salt: cookieName,
    secret: requiredEnvironmentVariable('AUTH_SECRET'),
    token: {},
  });

  await context.clearCookies();

  await context.addCookies([
    {
      httpOnly: true,
      name: cookieName,
      sameSite: 'Lax',
      secure: sessionCookie?.secure,
      url: baseURL,
      value: expiredToken,
    },
  ]);

  // Act
  const response = await page.request.get('/api/example');
  await page.goto('/');

  // Assert
  expect(response.status()).toBe(401);
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { exact: true, name: 'Sign in' })).toBeVisible();
});
