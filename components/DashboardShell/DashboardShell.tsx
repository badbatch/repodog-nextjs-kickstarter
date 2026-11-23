'use client';

import { AppShell, Burger, Button, Group, NavLink, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@next-box/link-extra';
import { usePathname } from 'next/navigation.js';
import { type ReactNode } from 'react';
import { tt } from '#content/index.ts';

type DashboardShellProps = {
  canAccessRestricted: boolean;
  children: ReactNode;
  signOutAction: () => Promise<void>;
};

export const DashboardShell = ({ canAccessRestricted, children, signOutAction }: DashboardShellProps): ReactNode => {
  const [opened, { close, toggle }] = useDisclosure(false);
  const pathname = usePathname();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ breakpoint: 'sm', collapsed: { mobile: !opened }, width: 240 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" justify="space-between" px="md">
          <Group>
            <Burger
              aria-expanded={opened}
              aria-label={tt('navigation.navigation')}
              hiddenFrom="sm"
              onClick={toggle}
              opened={opened}
            />
            <Text fw={600}>{tt('app.title')}</Text>
          </Group>
          <form action={signOutAction}>
            <Button type="submit" variant="subtle">
              {tt('actions.signOut')}
            </Button>
          </form>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar aria-label={tt('navigation.navigation')} component="nav" p="sm">
        <Stack gap="xs">
          <NavLink
            active={pathname === '/'}
            aria-current={pathname === '/' ? 'page' : undefined}
            component={Link}
            href="/"
            label={tt('navigation.home')}
            onClick={close}
          />
          {canAccessRestricted && (
            <NavLink
              active={pathname === '/restricted'}
              aria-current={pathname === '/restricted' ? 'page' : undefined}
              component={Link}
              href="/restricted"
              label={tt('pages.restricted.title')}
              onClick={close}
            />
          )}
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};
