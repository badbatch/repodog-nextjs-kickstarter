import { Button, Paper, Text } from '@mantine/core';
import { type ReactNode } from 'react';
import { PageLayout } from './PageLayout.tsx';

export default { title: 'Layout/Page layout' };

export const WithActions = (): ReactNode => (
  <PageLayout
    actions={<Button>Create project</Button>}
    breadcrumbs={
      <Text c="dimmed" size="sm">
        Catalog / Projects
      </Text>
    }
    description="Manage project schedules, ticket allocations and results."
    title="Projects"
  >
    <Paper p="xl" withBorder>
      Page content
    </Paper>
  </PageLayout>
);
