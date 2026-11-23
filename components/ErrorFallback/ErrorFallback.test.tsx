/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { tt } from '#content/index.ts';

const reportBrowserException = jest.fn();
jest.unstable_mockModule('@next-box/logging/browser', () => ({ reportBrowserException }));

const { ErrorFallback } = await import('./ErrorFallback.tsx');

describe('ErrorFallback', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('When a browser render fails, then it reports the error and offers a retry', () => {
    // Arrange
    const error = new Error('Private error details');
    const retry = jest.fn();

    // Act
    render(<ErrorFallback error={error} retry={retry} />);
    fireEvent.click(screen.getByRole('button', { name: tt('pages.error.retry') }));

    // Assert
    expect(reportBrowserException).toHaveBeenCalledWith(error);
    expect(screen.getByRole('heading', { name: tt('pages.error.title') })).toBeVisible();
    expect(screen.queryByText(error.message)).toBeNull();
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('When Next.js supplies a server error digest, then it renders the fallback without reporting a browser exception', () => {
    // Arrange
    const error = Object.assign(new Error('Server render failed'), { digest: 'server-error' });

    // Act
    render(<ErrorFallback error={error} retry={jest.fn()} />);

    // Assert
    expect(screen.getByRole('heading', { name: tt('pages.error.title') })).toBeVisible();
    expect(reportBrowserException).not.toHaveBeenCalled();
  });
});
