/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react';
import { type ConstructorOptions, type HeadersFactory } from 'getta';

const createRestClient = jest.fn<(options: ConstructorOptions) => object>(() => ({}));

const mockAppSettings = jest.fn(() => ({ BaseUrl: '/api' }));
const useSession = jest.fn<() => { data: { correlationId: string } | undefined }>();

jest.unstable_mockModule('getta', () => ({ createRestClient }));
jest.unstable_mockModule('next-auth/react', () => ({ useSession }));

jest.unstable_mockModule('#appSettings/hooks.ts', () => ({
  useAppSettingsOrThrow: mockAppSettings,
}));

const { ApiProvider } = await import('./ApiProvider.tsx');

describe('ApiProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('When the session changes, then the API client uses the current session correlation ID', () => {
    // Arrange
    useSession.mockReturnValue({ data: { correlationId: 'first-session' } });
    const { rerender } = render(<ApiProvider>Child</ApiProvider>);
    useSession.mockReturnValue({ data: { correlationId: 'second-session' } });

    // Act
    rerender(<ApiProvider>Child</ApiProvider>);

    // Assert
    const firstHeaders = createRestClient.mock.calls[0]?.[0].headers as HeadersFactory;
    const secondHeaders = createRestClient.mock.calls[1]?.[0].headers as HeadersFactory;
    expect(typeof firstHeaders).toBe('function');
    expect(typeof secondHeaders).toBe('function');
    expect(firstHeaders()).toEqual(expect.objectContaining({ 'x-correlation-id': 'first-session' }));
    expect(secondHeaders()).toEqual(expect.objectContaining({ 'x-correlation-id': 'second-session' }));
  });

  it('When the session is unavailable, then the API client omits the correlation header', () => {
    // Arrange
    useSession.mockReturnValue({ data: undefined });

    // Act
    render(<ApiProvider>Child</ApiProvider>);

    // Assert
    const headers = createRestClient.mock.calls[0]?.[0].headers as HeadersFactory;
    expect(typeof headers).toBe('function');
    expect(headers()).not.toHaveProperty('x-correlation-id');
  });

  it('When headers are resolved for successive requests, then each has a fresh request ID and the same correlation ID', () => {
    // Arrange
    useSession.mockReturnValue({ data: { correlationId: 'current-session' } });
    render(<ApiProvider>Child</ApiProvider>);
    const headers = createRestClient.mock.calls[0]?.[0].headers as HeadersFactory;

    // Act
    const firstHeaders = headers();
    const secondHeaders = headers();

    // Assert
    expect(firstHeaders['x-request-id']).toEqual(expect.any(String));
    expect(secondHeaders['x-request-id']).toEqual(expect.any(String));
    expect(firstHeaders['x-request-id']).not.toBe(secondHeaders['x-request-id']);
    expect(firstHeaders['x-correlation-id']).toBe('current-session');
    expect(secondHeaders['x-correlation-id']).toBe('current-session');
  });
});
