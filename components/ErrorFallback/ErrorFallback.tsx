import { reportBrowserException } from '@next-box/logging/browser';
import { type ReactNode, useEffect } from 'react';
import { tt } from '#content/index.ts';
import { shouldReportBrowserException } from '#libs/Logging/shouldReportBrowserException.ts';

export type ErrorFallbackProps = {
  error: unknown;
  retry: () => void;
};

export const ErrorFallback = ({ error, retry }: ErrorFallbackProps): ReactNode => {
  useEffect(() => {
    if (shouldReportBrowserException(error)) {
      reportBrowserException(error);
    }
  }, [error]);

  return (
    <main style={{ margin: '4rem auto', maxWidth: '36rem', padding: '0 1.5rem' }}>
      <h1>{tt('pages.error.title')}</h1>
      <button onClick={retry} type="button">
        {tt('pages.error.retry')}
      </button>
    </main>
  );
};
