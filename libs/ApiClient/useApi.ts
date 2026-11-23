import { useCallback, useRef, useState } from 'react';
import { assertApiAccess } from './ApiAccessError.ts';
import { ApiResponseError } from './ApiResponseError.ts';
import { type ApiResponse, type ApiResult, type ApiState, type UseApiOptions, type UseApiResult } from './types.ts';

export const useApi = <T, TArgs extends unknown[]>(
  request: (...args: TArgs) => Promise<ApiResponse<T>>,
  { onError }: UseApiOptions = {},
): UseApiResult<T, TArgs> => {
  const [state, setState] = useState<ApiState<T>>({
    data: undefined,
    error: undefined,
    isError: false,
    isLoading: false,
    isSuccess: false,
  });

  const executionIdRef = useRef(0);

  const reset = useCallback(() => {
    executionIdRef.current++;

    setState({
      data: undefined,
      error: undefined,
      isError: false,
      isLoading: false,
      isSuccess: false,
    });
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<ApiResult<T>> => {
      const id = ++executionIdRef.current;

      setState(previous => ({
        ...previous,
        error: undefined,
        isError: false,
        isLoading: true,
        isSuccess: false,
      }));

      try {
        const response = await request(...args);
        assertApiAccess(response);

        if (!response.ok) {
          throw new ApiResponseError(response.status, response.statusText, response.data);
        }

        const { data } = response;

        if (executionIdRef.current === id) {
          setState({
            data,
            error: undefined,
            isError: false,
            isLoading: false,
            isSuccess: true,
          });
        }

        return {
          data,
          success: true,
        };
      } catch (error_) {
        const error = error_ instanceof Error ? error_ : new Error(String(error_));

        if (executionIdRef.current === id) {
          setState(previous => ({
            ...previous,
            error,
            isError: true,
            isLoading: false,
            isSuccess: false,
          }));

          onError?.(error);
        }

        return {
          error,
          success: false,
        };
      }
    },
    [onError, request],
  );

  return {
    ...state,
    execute,
    reset,
  };
};
