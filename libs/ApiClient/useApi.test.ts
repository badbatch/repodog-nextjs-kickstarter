/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, cleanup, renderHook } from '@testing-library/react';

class ApiAccessError extends Error {}
const assertApiAccess = jest.fn<(result: unknown) => void>();

jest.unstable_mockModule('./ApiAccessError.ts', () => ({ assertApiAccess }));

const { useApi } = await import('./useApi.ts');

describe('useApi error handling', () => {
  afterEach(() => {
    cleanup();
    assertApiAccess.mockReset();
    jest.clearAllMocks();
  });

  it('When an API response is forbidden, then it records an error and invokes onError', async () => {
    // Arrange
    const error = new ApiAccessError('Access denied');
    const request = jest.fn<() => Promise<object>>().mockResolvedValue({});
    const onError = jest.fn<(error: Error) => void>();

    assertApiAccess.mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useApi(request, { onError }));

    // Act
    await act(async () => {
      await result.current.execute();
    });

    // Assert
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.error).toBe(error);
    expect(result.current.isError).toBe(true);
    expect(result.current.isSuccess).toBe(false);
  });

  it('When an API response is allowed, then it records success without invoking onError', async () => {
    // Arrange
    const data = { id: 'item-id' };
    const request = jest.fn<() => Promise<object>>().mockResolvedValue(data);
    const onError = jest.fn<(error: Error) => void>();
    const { result } = renderHook(() => useApi(request, { onError }));

    // Act
    await act(async () => {
      await result.current.execute();
    });

    // Assert
    expect(result.current.data).toEqual(data);
    expect(result.current.isSuccess).toBe(true);
    expect(onError).not.toHaveBeenCalled();
  });

  it('When a request rejects with a non-Error value, then onError receives the normalized error', async () => {
    // Arrange
    const request = jest.fn<() => Promise<object>>().mockRejectedValue('Service unavailable');
    const onError = jest.fn<(error: Error) => void>();
    const { result } = renderHook(() => useApi(request, { onError }));

    // Act
    await act(async () => {
      await result.current.execute();
    });

    // Assert
    expect(onError).toHaveBeenCalledWith(new Error('Service unavailable'));
    expect(result.current.isError).toBe(true);
  });

  it('When onError is omitted, then request failures still update the error state', async () => {
    // Arrange
    const error = new Error('Service unavailable');
    const request = jest.fn<() => Promise<object>>().mockRejectedValue(error);
    const { result } = renderHook(() => useApi(request));

    // Act
    await act(async () => {
      await result.current.execute();
    });

    // Assert
    expect(result.current.error).toBe(error);
    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('When a pending request is reset, then its later failure does not invoke onError or change state', async () => {
    // Arrange
    const request = jest.fn(async (): Promise<object> => {
      await Promise.resolve();
      throw new Error('Late failure');
    });

    const onError = jest.fn<(error: Error) => void>();
    const { result } = renderHook(() => useApi(request, { onError }));

    // Act
    await act(async () => {
      const execution = result.current.execute();
      result.current.reset();
      await execution;
    });

    // Assert
    expect(onError).not.toHaveBeenCalled();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isError).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
