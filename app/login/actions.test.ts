/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthError, CredentialsSignin } from 'next-auth';
import { tt } from '#content/index.ts';

const signIn =
  jest.fn<(provider: string, options: { email: string; password: string; redirectTo: string }) => Promise<void>>();

jest.unstable_mockModule('#auth.ts', () => ({ signIn }));

const { login } = await import('./actions.ts');

const createForm = (values: Record<string, string> = {}): FormData => {
  const form = new FormData();
  const entries = Object.entries({ email: 'user@example.com', password: 'Password1!', ...values });

  for (const [key, value] of entries) {
    form.set(key, value);
  }

  return form;
};

const invalidPayloads: Record<string, string>[] = [
  { email: 'invalid' },
  { email: '' },
  { email: `${'a'.repeat(250)}@example.com` },
  { password: '' },
];

describe('login action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    signIn.mockResolvedValue(undefined);
  });

  it('When credentials are valid, then normalized credentials and the fixed redirect are passed to NextAuth', async () => {
    // Arrange
    const form = createForm({
      email: ' user@example.com ',
      password: ' Password1! ',
      redirectTo: 'https://example.invalid',
      roles: 'ExampleUser',
    });

    // Act
    const result = await login(undefined, form);

    // Assert
    expect(result).toBeUndefined();

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'user@example.com',
      password: ' Password1! ',
      redirectTo: '/',
    });
  });

  it.each(invalidPayloads)('When the payload is invalid (%j), then NextAuth is not called', async values => {
    // Arrange
    const form = createForm(values);

    // Act
    const result = await login(undefined, form);

    // Assert
    expect(result).toBe(tt('pages.login.errors.invalidCredentials'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('When required fields are absent, then NextAuth is not called', async () => {
    // Arrange / Act
    const result = await login(undefined, new FormData());

    // Assert
    expect(result).toBe(tt('pages.login.errors.invalidCredentials'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('When a credential is a file instead of text, then NextAuth is not called', async () => {
    // Arrange
    const form = createForm();
    form.set('email', new Blob(['user@example.com']), 'email.txt');

    // Act
    const result = await login(undefined, form);

    // Assert
    expect(result).toBe(tt('pages.login.errors.invalidCredentials'));
    expect(signIn).not.toHaveBeenCalled();
  });

  it('When NextAuth rejects the credentials, then the localized credentials error is returned', async () => {
    // Arrange
    signIn.mockRejectedValueOnce(new CredentialsSignin());

    // Act
    const result = await login(undefined, createForm());

    // Assert
    expect(result).toBe(tt('pages.login.errors.invalidCredentials'));
  });

  it('When NextAuth reports an authentication service error, then internal details are not exposed', async () => {
    // Arrange
    signIn.mockRejectedValueOnce(new AuthError('Internal authentication details'));

    // Act
    const result = await login(undefined, createForm());

    // Assert
    expect(result).toBe(tt('pages.login.errors.unavailable'));
  });

  it('When NextAuth redirects after sign-in, then the redirect is allowed to propagate', async () => {
    // Arrange
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;replace;/;307;' });
    signIn.mockRejectedValueOnce(redirect);

    // Act / Assert
    await expect(login(undefined, createForm())).rejects.toBe(redirect);
  });

  it('When an unexpected error occurs, then it is rethrown', async () => {
    // Arrange
    const error = new Error('Unexpected failure');
    signIn.mockRejectedValueOnce(error);

    // Act / Assert
    await expect(login(undefined, createForm())).rejects.toBe(error);
  });
});
