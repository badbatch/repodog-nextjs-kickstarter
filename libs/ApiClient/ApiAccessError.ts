export class ApiAccessError extends Error {
  readonly status = 403;

  constructor() {
    super('Access denied');
    this.name = 'ApiAccessError';
  }
}

export const assertApiAccess = (result: Pick<Response, 'status'>): void => {
  if (result.status === 403) {
    throw new ApiAccessError();
  }
};
