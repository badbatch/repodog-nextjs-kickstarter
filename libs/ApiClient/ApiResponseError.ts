export class ApiResponseError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, statusText: string, details?: unknown) {
    super(`Request failed (${String(status)})${statusText ? `: ${statusText}` : ''}`);
    this.name = 'ApiResponseError';
    this.status = status;
    this.details = details;
  }
}
