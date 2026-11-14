import { type ReactNode } from 'react';
import { ColorSchemeToggle } from '#components/ColorSchemeToggle/ColorSchemeToggle.tsx';
import { ExamplePanel } from '#components/ExamplePanel/ExamplePanel.tsx';
import { Welcome } from '#components/Welcome/Welcome.tsx';

const HomePage = (): ReactNode => (
  <>
    <Welcome />
    <ExamplePanel />
    <ColorSchemeToggle />
  </>
);

export default HomePage;
