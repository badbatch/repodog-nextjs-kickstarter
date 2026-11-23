import { type ApiResponse } from '#libs/ApiClient/types.ts';

export const createApiResponse = <T>(data: T, status = 200, statusText = ''): ApiResponse<T> => ({
  data,
  ok: status >= 200 && status < 300,
  status,
  statusText,
});
