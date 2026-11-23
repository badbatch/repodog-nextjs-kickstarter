import { Button } from '@mantine/core';
import { Link } from '@next-box/link-extra';
import { type ReactNode } from 'react';
import { tt } from '#content/index.ts';

export type RelatedRecordActionProps = {
  href: string;
  label: string;
};

export const RelatedRecordAction = ({ href, label }: RelatedRecordActionProps): ReactNode => (
  <Button aria-label={`${tt('records.view')} ${label}`} component={Link} href={href} size="compact-xs" variant="subtle">
    {tt('records.view')}
  </Button>
);
