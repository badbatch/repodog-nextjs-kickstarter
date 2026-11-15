/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { tt } from '#content/index.ts';

const registerUser =
  jest.fn<
    (options: {
      body: { email: string; password: string };
      signal: AbortSignal;
    }) => Promise<{ data?: unknown; status: number }>
  >();

const redirect = jest.fn<(url: string) => never>(() => {
  throw new Error('Redirected');
});

const createServerApiClient = jest.fn(() => Promise.resolve({ registerUser }));

jest.unstable_mockModule('next/navigation.js', () => ({ redirect }));

jest.unstable_mockModule('#appSettings/index.ts', () => ({
  loadAppSettings: () => Promise.resolve({ Server: { Api: { TimeoutMs: 10_000 } } }),
}));

jest.unstable_mockModule('#server/createServerApiClient.ts', () => ({ createServerApiClient }));

const { register } = await import('./actions.ts');

const createForm = (values: Record<string, string> = {}): FormData => {
  const form = new FormData();

  const entries = Object.entries({
    confirmPassword: 'SecurePassword1!',
    email: 'new@example.com',
    password: 'SecurePassword1!',
    ...values,
  });

  for (const [key, value] of entries) {
    form.set(key, value);
  }

  return form;
};

describe('registration action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registerUser.mockResolvedValue({ status: 201 });
  });

  it('When registration succeeds, then only account credentials are sent and the user is redirected to sign in', async () => {
    // Arrange
    const form = createForm({ email: ' new@example.com ', policies: 'ExampleAccess', roles: 'ExampleUser' });

    // Act / Assert
    await expect(register(undefined, form)).rejects.toThrow('Redirected');

    expect(registerUser).toHaveBeenCalledWith({
      body: { email: 'new@example.com', password: 'SecurePassword1!' },
      signal: expect.any(AbortSignal),
    });

    expect(redirect).toHaveBeenCalledWith('/login?registered=1');
  });

  it('When the email is invalid, then validation fails before calling the API', async () => {
    // Arrange
    const form = createForm({ email: 'invalid' });

    // Act
    const result = await register(undefined, form);

    // Assert
    expect(result).toBe(tt('pages.register.errors.invalidDetails'));
    expect(createServerApiClient).not.toHaveBeenCalled();
  });

  it('When the passwords differ, then validation fails before calling the API', async () => {
    // Arrange
    const form = createForm({ confirmPassword: 'different' });

    // Act
    const result = await register(undefined, form);

    // Assert
    expect(result).toBe(tt('pages.register.errors.passwordMismatch'));
    expect(createServerApiClient).not.toHaveBeenCalled();
  });

  it('When required fields are absent, then the API is not called', async () => {
    // Arrange / Act
    const result = await register(undefined, new FormData());

    // Assert
    expect(result).toBe(tt('pages.register.errors.invalidDetails'));
    expect(createServerApiClient).not.toHaveBeenCalled();
  });

  it.each([400, 409])(
    'When the API rejects registration with %s, then the localized rejection is returned without backend details',
    async status => {
      // Arrange
      registerUser.mockResolvedValue({ data: { title: 'Internal error details' }, status });

      // Act
      const result = await register(undefined, createForm());

      // Assert
      expect(result).toBe(tt('pages.register.errors.rejected'));
      expect(redirect).not.toHaveBeenCalled();
    },
  );

  it('When the API is unavailable, then the user can retry without a redirect', async () => {
    // Arrange
    registerUser.mockRejectedValueOnce(new Error('Connection failed'));

    // Act
    const result = await register(undefined, createForm());

    // Assert
    expect(result).toBe(tt('pages.register.errors.unavailable'));
    expect(redirect).not.toHaveBeenCalled();
  });

  it('When the API returns an unexpected status, then the localized unavailable message is returned', async () => {
    // Arrange
    registerUser.mockResolvedValue({ status: 500 });

    // Act
    const result = await register(undefined, createForm());

    // Assert
    expect(result).toBe(tt('pages.register.errors.unavailable'));
    expect(redirect).not.toHaveBeenCalled();
  });
});
