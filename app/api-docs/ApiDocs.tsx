'use client';

import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';
import { type ReactElement } from 'react';

export const ApiDocs = (): ReactElement => {
  return (
    <ApiReferenceReact
      configuration={{
        _integration: 'nextjs',
        url: '/openapi.json',
      }}
    />
  );
};
