import { Group, Stack, Text, Title } from '@mantine/core';
import { type ReactNode } from 'react';
import { type PageHeaderProps } from './types.ts';

export type { PageHeaderProps } from './types.ts';

export const PageHeader = ({ actions, description, title }: PageHeaderProps): ReactNode => (
  <Group align="flex-start" gap="md" justify="space-between" wrap="wrap">
    <Stack gap={6}>
      <Title order={1}>{title}</Title>
      {description && (
        <Text c="dimmed" maw={680} size="sm">
          {description}
        </Text>
      )}
    </Stack>
    {actions}
  </Group>
);
