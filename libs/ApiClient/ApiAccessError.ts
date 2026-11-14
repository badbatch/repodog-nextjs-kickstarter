export class ApiAccessError extends Error {
  readonly status = 403;

  constructor() {
    super('Access denied');
    this.name = 'ApiAccessError';
  }
}

export const assertApiAccess = (result: unknown): void => {
  if (result instanceof Response && result.status === 403) {
    throw new ApiAccessError();
  }
};
