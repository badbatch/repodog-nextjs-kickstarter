import { type ReactNode } from 'react';
import { getServerRequestContext } from '#server/getServerRequestContext.ts';
import { RegisterForm } from './RegisterForm.tsx';

const RegisterPage = async (): Promise<ReactNode> => {
  const { logger } = await getServerRequestContext();
  logger.info('Rendering page', { page: '/register' });

  return <RegisterForm />;
};

export default RegisterPage;
