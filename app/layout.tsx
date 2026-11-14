import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { getClientAppSettings } from '@next-box/appsettings/server';
import { PublicEnvVarsScript, getPublicEnvs } from '@next-box/envs/server';
import { type Metadata } from 'next';
import { type ReactNode, Suspense } from 'react';
import { loadAppSettings } from '#appSettings/index.ts';
import { languageCode, tt } from '#content/index.ts';
import { theme } from '#theme.ts';
import { AppProviders } from './_components/AppProviders.tsx';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description: tt('app.description'),
  title: tt('app.title'),
};

const RootLayout = async ({ children }: { children: ReactNode }): Promise<ReactNode> => {
  const envs = getPublicEnvs(process.env);
  const settings = getClientAppSettings(await loadAppSettings());

  return (
    <html lang={languageCode} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link href="/favicon.svg" rel="shortcut icon" />
        <meta content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" name="viewport" />
      </head>
      <body>
        <PublicEnvVarsScript />
        <MantineProvider theme={theme}>
          <Suspense fallback={undefined}>
            <AppProviders envs={envs} settings={settings}>
              {children}
            </AppProviders>
          </Suspense>
        </MantineProvider>
      </body>
    </html>
  );
};

export default RootLayout;
