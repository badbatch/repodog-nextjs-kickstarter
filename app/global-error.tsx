/* eslint-disable unicorn/filename-case -- Next.js requires this filename. */
'use client';

import { type ReactNode } from 'react';
import { ErrorFallback, type ErrorFallbackProps } from '#components/ErrorFallback/ErrorFallback.tsx';
import { languageCode } from '#content/index.ts';

const GlobalError = (props: ErrorFallbackProps): ReactNode => (
  <html lang={languageCode}>
    <body>
      <ErrorFallback {...props} />
    </body>
  </html>
);

// Next.js requires the fallback as a default export.
// eslint-disable-next-line import-x/no-default-export
export default GlobalError;
