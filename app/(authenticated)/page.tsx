import { type ReactNode } from 'react';
import { ColorSchemeToggle } from '#components/ColorSchemeToggle/ColorSchemeToggle.tsx';
import { ExamplePanel } from '#components/ExamplePanel/ExamplePanel.tsx';
import { Welcome } from '#components/Welcome/Welcome.tsx';
import { getServerRequestContext } from '#server/getServerRequestContext.ts';

const HomePage = async (): Promise<ReactNode> => {
  const { logger } = await getServerRequestContext();
  logger.info('Rendering page', { page: '/' });

  return (
    <>
      <Welcome />
      <ExamplePanel />
      <ColorSchemeToggle />
    </>
  );
};

export default HomePage;
