/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, cleanup, renderHook } from '@testing-library/react';
import { createApiResponse } from '#__testUtils__/createApiResponse.ts';
import { ApiAccessError } from './ApiAccessError.ts';
import { ApiResponseError } from './ApiResponseError.ts';
import { type ApiResponse } from './types.ts';
import { useApi } from './useApi.ts';

type Data = { id: string };

describe('useApi error handling', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('When an API response is forbidden, then it records an error and invokes onError', async () => {
    // Arrange
    const error = new ApiAccessError();

    const request = jest
      .fn<() => Promise<ApiResponse<Data>>>()
      .mockResolvedValue(createApiResponse({ id: 'item-id' }, 403));

    const onError = jest.fn<(error: Error) => void>();

    const { result } = renderHook(() => useApi(request, { onError }));

    // Act
    await act(async () => {
      await result.current.execute();
    });

    // Assert
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.error).toEqual(error);
    expect(result.current.isError).toBe(true);
    expect(result.current.isSuccess).toBe(false);
  });

  it('When an API response is allowed, then it records success without invoking onError', async () => {
    // Arrange
    const data = { id: 'item-id' };
    const request = jest.fn<() => Promise<ApiResponse<Data>>>().mockResolvedValue(createApiResponse(data));
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
    const request = jest.fn<() => Promise<ApiResponse<Data>>>().mockRejectedValue('Service unavailable');
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
    const request = jest.fn<() => Promise<ApiResponse<Data>>>().mockRejectedValue(error);
    const { result } = renderHook(() => useApi(request));

    // Act
    await act(async () => {
      await result.current.execute();
    });

    // Assert
    expect(result.current.error).toEqual(error);
    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('When a pending request is reset, then its later failure does not invoke onError or change state', async () => {
    // Arrange
    const request = jest.fn(async (): Promise<ApiResponse<Data>> => {
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

  it('When an older request succeeds after the latest request, then its result does not replace the latest data', async () => {
    // Arrange
    const older = Promise.withResolvers<ApiResponse<Data>>();
    const latest = Promise.withResolvers<ApiResponse<Data>>();

    const request = jest
      .fn<() => Promise<ApiResponse<Data>>>()
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(latest.promise);

    const { result } = renderHook(() => useApi(request));
    const executions: Promise<unknown>[] = [];

    act(() => {
      executions.push(result.current.execute(), result.current.execute());
    });

    // Act
    await act(async () => {
      latest.resolve(createApiResponse({ id: 'latest' }));
      await latest.promise;
    });

    await act(async () => {
      older.resolve(createApiResponse({ id: 'older' }));
      await Promise.all(executions);
    });

    // Assert
    expect(result.current.data).toEqual({ id: 'latest' });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('When an older request fails after the latest request succeeds, then its error does not replace success or invoke onError', async () => {
    // Arrange
    const older = Promise.withResolvers<ApiResponse<Data>>();
    const latest = Promise.withResolvers<ApiResponse<Data>>();

    const request = jest
      .fn<() => Promise<ApiResponse<Data>>>()
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(latest.promise);

    const onError = jest.fn<(error: Error) => void>();
    const { result } = renderHook(() => useApi(request, { onError }));
    const executions: Promise<unknown>[] = [];

    act(() => {
      executions.push(result.current.execute(), result.current.execute());
    });

    // Act
    await act(async () => {
      latest.resolve(createApiResponse({ id: 'latest' }));
      await latest.promise;
    });

    await act(async () => {
      older.reject(new Error('Stale failure'));
      await Promise.all(executions);
    });

    // Assert
    expect(result.current.data).toEqual({ id: 'latest' });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(onError).not.toHaveBeenCalled();
  });

  it('When an older request fails while the latest request is pending, then loading continues without displaying the stale error', async () => {
    // Arrange
    const older = Promise.withResolvers<ApiResponse<Data>>();
    const latest = Promise.withResolvers<ApiResponse<Data>>();

    const request = jest
      .fn<() => Promise<ApiResponse<Data>>>()
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(latest.promise);

    const onError = jest.fn<(error: Error) => void>();
    const { result } = renderHook(() => useApi(request, { onError }));
    const executions: Promise<unknown>[] = [];

    act(() => {
      executions.push(result.current.execute(), result.current.execute());
    });

    // Act
    await act(async () => {
      older.reject(new Error('Stale failure'));
      await executions[0];
    });

    // Assert
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(onError).not.toHaveBeenCalled();

    // Act
    await act(async () => {
      latest.resolve(createApiResponse({ id: 'latest' }));
      await Promise.all(executions);
    });

    // Assert
    expect(result.current.data).toEqual({ id: 'latest' });
    expect(result.current.isLoading).toBe(false);
  });

  it('When a reset request later succeeds, then the initial state is preserved', async () => {
    // Arrange
    const pending = Promise.withResolvers<ApiResponse<Data>>();
    const request = jest.fn<() => Promise<ApiResponse<Data>>>().mockReturnValue(pending.promise);
    const { result } = renderHook(() => useApi(request));
    const executions: Promise<unknown>[] = [];

    act(() => {
      executions.push(result.current.execute());
      result.current.reset();
    });

    // Act
    await act(async () => {
      pending.resolve(createApiResponse({ id: 'late' }));
      await Promise.all(executions);
    });

    // Assert
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it.each([401, 404, 409, 422, 500, 503])(
    'When the response status is %s, then it exposes an HTTP error without recording success',
    async status => {
      // Arrange
      const request = jest
        .fn<() => Promise<ApiResponse<Data>>>()
        .mockResolvedValue(createApiResponse({ id: 'not-success' }, status, 'Failure'));

      const onError = jest.fn<(error: Error) => void>();
      const { result } = renderHook(() => useApi(request, { onError }));

      // Act
      await act(async () => {
        await result.current.execute();
      });

      // Assert
      expect(result.current.error).toBeInstanceOf(ApiResponseError);
      expect(result.current.error).toMatchObject({ status });
      expect(result.current.data).toBeUndefined();
      expect(result.current.isError).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(onError.mock.calls[0]?.[0]).toBe(result.current.error);
    },
  );

  it('When a generated-style method takes positional arguments and request options, then execute forwards them and returns the payload', async () => {
    // Arrange
    const request = jest
      .fn<(id: string, options: { body: { name: string }; signal: AbortSignal }) => Promise<ApiResponse<Data>>>()
      .mockResolvedValue(createApiResponse({ id: 'updated' }, 201));

    const { result } = renderHook(() => useApi(request));
    const controller = new AbortController();
    const options = { body: { name: 'New name' }, signal: controller.signal };

    // Act
    let response;

    await act(async () => {
      response = await result.current.execute('item-id', options);
    });

    // Assert
    expect(request).toHaveBeenCalledWith('item-id', options);
    expect(result.current.data).toEqual({ id: 'updated' });
    expect(response).toEqual({ data: { id: 'updated' }, success: true });
  });

  it('When a response has no content, then it records success with an undefined payload', async () => {
    // Arrange
    const request = jest
      .fn<() => Promise<ApiResponse<undefined>>>()
      .mockResolvedValue(createApiResponse(undefined, 204));

    const { result } = renderHook(() => useApi(request));

    // Act
    await act(async () => {
      await result.current.execute();
    });

    // Assert
    expect(result.current.data).toBeUndefined();
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});
