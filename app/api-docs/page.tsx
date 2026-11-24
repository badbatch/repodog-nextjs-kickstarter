import { type ReactNode } from 'react';
import { getServerRequestContext } from '#server/getServerRequestContext.ts';
import { ApiDocs } from './ApiDocs.tsx';

const ApiDocsPage = async (): Promise<ReactNode> => {
  const { logger } = await getServerRequestContext();
  logger.info('Rendering page', { page: '/api-docs' });

  return <ApiDocs />;
};

export default ApiDocsPage;
