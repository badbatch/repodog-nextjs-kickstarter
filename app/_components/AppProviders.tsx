'use client';

import { Anchor, Box, Loader, VisuallyHidden } from '@mantine/core';
import { AppSettingsProvider, type ClientAppSettingsSnapshot } from '@next-box/appsettings';
import { BreadcrumbProvider } from '@next-box/breadcrumb';
import { EnvsProvider } from '@next-box/envs';
import { FeatureFlagProvider } from '@next-box/feature-flags';
import { I18nProvider } from '@next-box/i18n/client';
import { LinkProvider, type OwnLinkProps } from '@next-box/link-extra';
import NextLink from 'next/link.js';
import { usePathname, useSearchParams } from 'next/navigation.js';
import { SessionProvider } from 'next-auth/react';
import { type FC, type ReactNode } from 'react';
import { type AppSettingsConfig } from '#appSettings/schema.ts';
import { clientFilters } from '#clientFilters.ts';
import { componentMapper } from '#content/componentMapper.tsx';
import { featureFlags } from '#featureFlags.config.ts';
import { ApiProvider } from '#libs/ApiClient/ApiProvider.tsx';
import { routeRules } from '#routeRules.ts';
import classes from './AppProviders.module.css';
import { BreadcrumbNavigation } from './BreadcrumbNavigation.tsx';

export type AppProvidersProps = {
  children: ReactNode;
  envs: Record<string, string | undefined>;
  settings: ClientAppSettingsSnapshot<AppSettingsConfig>;
};

const OwnLink = (props: OwnLinkProps): ReactNode => <Anchor {...props} />;

const NavigationLoading = (): ReactNode => (
  <Box
    aria-atomic="true"
    aria-live="polite"
    bg="var(--mantine-color-body)"
    c="var(--mantine-color-text)"
    className={classes.navigationLoading}
    component="div"
    px="md"
    py="xs"
    role="status"
  >
    <Loader aria-hidden="true" size="xs" />
    <VisuallyHidden>Loading page</VisuallyHidden>
  </Box>
);

export const AppProviders: FC<AppProvidersProps> = ({ children, envs, settings }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // TypeScript is interpreting NextLink as the entire module.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const NextLinkComponent = NextLink as unknown as (typeof NextLink)['default'];

  return (
    <AppSettingsProvider settings={settings}>
      <EnvsProvider envs={envs}>
        <FeatureFlagProvider clientFilters={clientFilters} envs={envs} featureFlags={featureFlags}>
          <I18nProvider componentMapper={componentMapper}>
            <SessionProvider>
              <ApiProvider>
                <BreadcrumbProvider currentPathname={pathname} routeRules={routeRules} search={searchParams.toString()}>
                  <LinkProvider
                    LoadingComponent={NavigationLoading}
                    NextLink={NextLinkComponent}
                    OwnLink={OwnLink}
                    loadingTimeout={500}
                    pathname={pathname}
                  >
                    <BreadcrumbNavigation />
                    {children}
                  </LinkProvider>
                </BreadcrumbProvider>
              </ApiProvider>
            </SessionProvider>
          </I18nProvider>
        </FeatureFlagProvider>
      </EnvsProvider>
    </AppSettingsProvider>
  );
};
