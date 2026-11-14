import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { type Preview } from '@repodog/storybook-config';
import { preview as repodogPreview } from '@repodog/storybook-config/preview';
import { type ReactElement, useEffect } from 'react';
import { useGlobals } from 'storybook/preview-api';
import { theme } from '../theme.ts';

type ColorScheme = 'light' | 'dark';

const isColorScheme = (value: unknown): value is ColorScheme => value === 'light' || value === 'dark';

const preview: Preview = {
  ...repodogPreview,
  decorators: [
    (renderStory, context): ReactElement => {
      const [{ theme: storybookTheme }, updateGlobals] = useGlobals();

      useEffect(() => {
        const onKeyDown = (event: KeyboardEvent): void => {
          const isMod = event.metaKey || event.ctrlKey;
          const isJ = event.code === 'KeyJ';

          if (!isMod || !isJ) {
            return;
          }

          event.preventDefault();
          updateGlobals({ theme: storybookTheme === 'dark' ? 'light' : 'dark' });
        };

        addEventListener('keydown', onKeyDown);

        return (): void => {
          removeEventListener('keydown', onKeyDown);
        };
      }, [storybookTheme, updateGlobals]);

      const scheme: ColorScheme = isColorScheme(context.globals.theme) ? context.globals.theme : 'light';

      return (
        <MantineProvider forceColorScheme={scheme} theme={theme}>
          <ColorSchemeScript />
          {renderStory()}
        </MantineProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      defaultValue: 'light',
      description: 'Mantine color scheme',
      name: 'Theme',
      toolbar: {
        icon: 'mirror',
        items: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
      },
    },
  },
  parameters: {
    ...repodogPreview.parameters,
    backgrounds: { disable: true },
    layout: 'fullscreen',
    options: {
      showPanel: false,
      storySort: {
        locales: 'en',
        method: 'alphabetical',
      },
    },
  },
};

// Storybook requires default export
// eslint-disable-next-line import-x/no-default-export
export default preview;
