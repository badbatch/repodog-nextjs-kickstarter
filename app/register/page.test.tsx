import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { userEvent } from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { cleanup, renderWithMantine, screen, waitFor } from '#__testUtils__/index.ts';
import { tt } from '#content/index.ts';
import { type RegistrationInput } from '#features/auth/register/types.ts';
import { type FormActionResult } from '#libs/Forms/types.ts';

const action = jest.fn<(data: FormData) => Promise<FormActionResult<RegistrationInput> | undefined>>();

jest.unstable_mockModule('./actions.ts', () => ({ register: action }));
jest.unstable_mockModule('next/navigation.js', () => ({ useSearchParams: jest.fn(() => new URLSearchParams()) }));

jest.unstable_mockModule('@next-box/link-extra', () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const { default: Page } = await import('./page.tsx');

describe('register form', () => {
  beforeEach(() => {
    action.mockReset();
    action.mockResolvedValue(undefined);
  });

  afterEach(cleanup);

  it('When an invalid email loses focus and is corrected, then the field error appears and clears without submitting', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithMantine(<Page />);
    const email = screen.getByLabelText(tt('pages.register.email'), { exact: false });

    // Act
    await user.type(email, 'invalid');
    await user.tab();

    // Assert
    await expect(screen.findByText(tt('forms.validation.email'))).resolves.toBeVisible();
    expect(action).not.toHaveBeenCalled();

    // Act
    await user.clear(email);
    await user.type(email, 'user@example.com');

    // Assert
    await waitFor(() => {
      expect(screen.queryByText(tt('forms.validation.email'))).not.toBeInTheDocument();
    });
  });

  it('When an empty form is submitted, then field errors are displayed without calling the server action', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithMantine(<Page />);

    // Act
    await user.click(screen.getByRole('button', { name: tt('pages.register.submit') }));

    // Assert
    await expect(screen.findByText(tt('forms.validation.passwordRequired'))).resolves.toBeVisible();
    expect(action).not.toHaveBeenCalled();
  });

  it('When passwords do not match, then confirmation has an error and the action is not called', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithMantine(<Page />);
    await user.type(screen.getByLabelText(tt('pages.register.email'), { exact: false }), 'user@example.com');

    await user.type(
      screen.getByLabelText(tt('pages.register.password'), { exact: false, selector: 'input[name="password"]' }),
      'Password1!',
    );

    await user.type(screen.getByLabelText(tt('pages.register.confirmPassword'), { exact: false }), 'Different1!');

    // Act
    await user.click(screen.getByRole('button', { name: tt('pages.register.submit') }));

    // Assert
    await expect(screen.findByText(tt('pages.register.errors.passwordMismatch'))).resolves.toBeVisible();
    expect(action).not.toHaveBeenCalled();
  });

  it('When the server returns field and form errors, then they are displayed in the form', async () => {
    // Arrange
    const user = userEvent.setup();
    action.mockResolvedValue({ fieldErrors: { email: ['Server email error'] }, formError: 'Service unavailable' });
    renderWithMantine(<Page />);
    await user.type(screen.getByLabelText(tt('pages.register.email'), { exact: false }), 'user@example.com');

    await user.type(
      screen.getByLabelText(tt('pages.register.password'), { exact: false, selector: 'input[name="password"]' }),
      'Password1!',
    );

    await user.type(screen.getByLabelText(tt('pages.register.confirmPassword'), { exact: false }), 'Password1!');

    // Act
    await user.click(screen.getByRole('button', { name: tt('pages.register.submit') }));

    // Assert
    await expect(screen.findByText('Server email error')).resolves.toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
    const data = action.mock.calls[0]?.[0];
    expect(data?.get('email')).toBe('user@example.com');
    expect(data?.get('password')).toBe('Password1!');
  });
});
