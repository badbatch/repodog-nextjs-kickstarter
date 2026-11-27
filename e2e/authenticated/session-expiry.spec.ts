import { type BrowserContext } from '@playwright/test';
import { encode } from 'next-auth/jwt';
import { expect, privilegedStorageState, requiredEnvironmentVariable, test } from '../fixtures/test.ts';
import { HomePage } from '../pages/homePage.ts';
import { SignInPage } from '../pages/signInPage.ts';

const sessionCookiePattern = /authjs\.session-token(?:\.\d+)?$/u;
const cookieChunkPattern = /\.\d+$/u;

type SessionCookie = Awaited<ReturnType<BrowserContext['cookies']>>[number];

const getSessionCookieOrThrow = (cookies: SessionCookie[]): SessionCookie => {
  const sessionCookie = cookies.find(cookie => sessionCookiePattern.test(cookie.name));

  if (!sessionCookie) {
    throw new Error('The privileged session cookie is missing from the test setup.');
  }

  return sessionCookie;
};

test.use({ storageState: privilegedStorageState });

test('When the session has expired, then BFF requests are rejected and protected pages require sign-in', async ({
  baseURL,
  context,
  page,
}) => {
  // Arrange: keep a cookie present but expire its encrypted JWT, rather than just removing the session.
  const sessionCookie = getSessionCookieOrThrow(await context.cookies());
  const cookieName = sessionCookie.name.replace(cookieChunkPattern, '');

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
      secure: sessionCookie.secure,
      url: baseURL,
      value: expiredToken,
    },
  ]);

  // Act
  const response = await page.request.get('/api/example');
  await new HomePage(page).goto();

  // Assert
  expect(response.status()).toBe(401);
  await new SignInPage(page).expectOpen();
});
