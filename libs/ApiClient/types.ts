import { type FetchResponse } from 'getta';
import { type createApiClient as createBffApiClient } from '#bff/httpClient/client.ts';
import { type createApiClient as createServerApiClient } from '#server/httpClient/client.ts';

export type BffApiClient = ReturnType<typeof createBffApiClient>;

export type ServerApiClient = ReturnType<typeof createServerApiClient>;

export type ApiState<T> = {
  data: T | undefined;
  error: Error | undefined;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
};

export type ApiResult<T> =
  | {
      data: T;
      success: true;
    }
  | {
      error: Error;
      success: false;
    };

export type ApiResponse<T> = Pick<FetchResponse<T>, 'data' | 'ok' | 'status' | 'statusText'>;

export type UseApiOptions = {
  onError?: (error: Error) => void;
};

export type UseApiResult<T, TArgs extends unknown[]> = ApiState<T> & {
  execute: (...args: TArgs) => Promise<ApiResult<T>>;
  reset: () => void;
};
