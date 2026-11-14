/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { cleanup } from '@testing-library/react';
import { type Session } from 'next-auth';
import { renderWithMantine, screen } from '#__testUtils__/index.ts';
import { tt } from '#content/index.ts';

const auth = jest.fn<() => Promise<Session | undefined>>();
const logout = jest.fn<() => Promise<void>>();

const redirect = jest.fn<(path: string) => never>(path => {
  throw new Error(`Redirect: ${path}`);
});

jest.unstable_mockModule('#auth.ts', () => ({ auth }));
jest.unstable_mockModule('#server/auth/actions.ts', () => ({ logout }));
jest.unstable_mockModule('next/navigation.js', () => ({ redirect }));

const { default: AuthenticatedLayout } = await import('#app/(authenticated)/layout.tsx');
const { default: RestrictedPage } = await import('#app/(authenticated)/restricted/page.tsx');
const { default: AccessDeniedPage } = await import('#app/access-denied/page.tsx');

const createSession = (policies: string[]): Session => ({
  expires: '2030-01-01T00:00:00Z',
  user: { id: 'user-id', policies, roles: ['ExampleUser'] },
});

describe('authenticated and policy-restricted pages', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('When there is no session, then the authenticated layout redirects to login', async () => {
    // Arrange
    auth.mockResolvedValue(undefined);

    // Act
    const result = AuthenticatedLayout({ children: 'Protected content' });

    // Assert
    await expect(result).rejects.toThrow('Redirect: /login');
  });

  it('When the example policy is absent, then the restricted page denies access', async () => {
    // Arrange
    auth.mockResolvedValue(createSession([]));
    // Act
    const result = RestrictedPage();
    // Assert
    await expect(result).rejects.toThrow('Redirect: /access-denied');
  });

  it('When the example policy is absent, then ordinary authenticated content still renders', async () => {
    // Arrange
    auth.mockResolvedValue(createSession([]));
    // Act
    renderWithMantine(await AuthenticatedLayout({ children: 'Protected content' }));
    // Assert
    expect(screen.getByText('Protected content')).toBeTruthy();
  });

  it('When ExampleAccess is present, then the authenticated layout renders its content', async () => {
    // Arrange
    auth.mockResolvedValue(createSession(['ExampleAccess']));

    // Act
    renderWithMantine(await AuthenticatedLayout({ children: 'Protected content' }));

    // Assert
    expect(screen.getByText('Protected content')).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('When a regular user opens the access-denied page, then it renders a message and sign-out without a redirect loop', async () => {
    // Arrange
    auth.mockResolvedValue(createSession([]));

    // Act
    renderWithMantine(await AccessDeniedPage());

    // Assert
    expect(screen.getByRole('heading', { name: tt('pages.accessDenied.title') })).toBeTruthy();
    expect(screen.getByRole('button', { name: tt('actions.signOut') })).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('When there is no session, then the access-denied page redirects to login', async () => {
    // Arrange
    auth.mockResolvedValue(undefined);

    // Act
    const result = AccessDeniedPage();

    // Assert
    await expect(result).rejects.toThrow('Redirect: /login');
  });
});
