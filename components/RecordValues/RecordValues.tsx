'use client';

import { Box, Group, Input, Paper, SimpleGrid, Stack } from '@mantine/core';
import { type ReactNode } from 'react';
import { isNullish } from 'remeda';
import {
  RelatedRecordAction,
  type RelatedRecordActionProps,
} from '#components/RelatedRecordAction/RelatedRecordAction.tsx';

export type RecordValueFieldProps = {
  actions?: RelatedRecordActionProps[];
  description?: string;
  fullWidth?: boolean;
  label: string;
  value: ReactNode;
};

const RecordValueField = ({ actions, description, fullWidth, label, value }: RecordValueFieldProps): ReactNode => {
  const displayValue = value === '' || isNullish(value) ? '—' : value;

  return (
    <Stack component="dl" gap={0} m={0}>
      <Box component="dt">
        <Input.Label labelElement="div">{label}</Input.Label>
      </Box>
      {description && <Input.Description>{description}</Input.Description>}
      <Box
        component="dd"
        lh={1.55}
        m={0}
        mih={fullWidth ? 79 : 36}
        mt={description ? 5 : 0}
        py={fullWidth ? 6.5 : 0}
        style={{
          alignItems: fullWidth ? undefined : 'center',
          display: fullWidth ? 'block' : 'flex',
          fontSize: 'var(--mantine-font-size-sm)',
          overflowWrap: 'anywhere',
          whiteSpace: 'pre-wrap',
        }}
      >
        {actions && actions.length > 0 ? (
          <Group align="center" gap="md" justify="space-between" wrap="nowrap">
            <Box style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{displayValue}</Box>
            <Stack gap="xs" ml="auto">
              {actions.map(action => (
                <RelatedRecordAction href={action.href} key={`${action.href}-${action.label}`} label={action.label} />
              ))}
            </Stack>
          </Group>
        ) : (
          displayValue
        )}
      </Box>
    </Stack>
  );
};

export type RecordValuesProps = { fields: RecordValueFieldProps[] };

export const RecordValues = ({ fields }: RecordValuesProps): ReactNode => (
  <Paper p="lg" radius="md" withBorder>
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {fields
          .filter(field => !field.fullWidth)
          .map(field => (
            <RecordValueField key={field.label} {...field} />
          ))}
      </SimpleGrid>
      {fields
        .filter(field => field.fullWidth)
        .map(field => (
          <RecordValueField key={field.label} {...field} />
        ))}
    </Stack>
  </Paper>
);
