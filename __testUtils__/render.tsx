import { MantineProvider } from '@mantine/core';
import { render as testingLibraryRender } from '@testing-library/react';
import { type ReactNode } from 'react';
import { theme } from '#theme.ts';

export const renderWithMantine = (ui: ReactNode) => {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MantineProvider env="test" theme={theme}>
        {children}
      </MantineProvider>
    ),
  });
};
