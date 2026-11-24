import { type ReactNode } from 'react';
import { getServerRequestContext } from '#server/getServerRequestContext.ts';
import { LoginForm } from './LoginForm.tsx';

const LoginPage = async (): Promise<ReactNode> => {
  const { logger } = await getServerRequestContext();
  logger.info('Rendering page', { page: '/login' });

  return <LoginForm />;
};

export default LoginPage;
