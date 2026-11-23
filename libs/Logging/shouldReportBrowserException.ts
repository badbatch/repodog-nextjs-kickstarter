export const shouldReportBrowserException = (error: unknown): boolean =>
  !(error instanceof Error && 'digest' in error && typeof error.digest === 'string');
