import { Anchor, Text, Title } from '@mantine/core';
import { type ReactNode } from 'react';
import { tt } from '#content/index.ts';
import classes from './Welcome.module.css';

export const Welcome = (): ReactNode => (
  <>
    <Title className={classes.title} mt={100} ta="center">
      {tt('pages.home.title')}
    </Title>
    <Text c="dimmed" maw={580} mt="xl" mx="auto" size="lg" ta="center">
      {tt('pages.home.description')}{' '}
      <Anchor href="https://mantine.dev/guides/next/" size="lg">
        {tt('pages.home.linkText')}
      </Anchor>
    </Text>
  </>
);
