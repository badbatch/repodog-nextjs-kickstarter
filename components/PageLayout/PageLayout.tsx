import { Container, Stack } from '@mantine/core';
import { type ReactNode } from 'react';
import { PageHeader } from './PageHeader.tsx';
import classes from './PageLayout.module.css';
import { type PageLayoutProps } from './types.ts';

export const PageLayout = ({ breadcrumbs, children, ...header }: PageLayoutProps): ReactNode => (
  <Container
    aria-label={header.title}
    className={classes.content}
    component="section"
    size="var(--admin-content-width, 960px)"
  >
    <Stack gap="xl">
      <div>
        {breadcrumbs}
        <PageHeader {...header} />
      </div>
      {children}
    </Stack>
  </Container>
);
