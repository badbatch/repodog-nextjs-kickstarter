'use client';

import { Breadcrumbs, Text } from '@mantine/core';
import { useBreadcrumb } from '@next-box/breadcrumb';
import { Link } from '@next-box/link-extra';
import { type ReactNode } from 'react';
import { tt } from '#content/index.ts';

export const BreadcrumbNavigation = (): ReactNode => {
  const { breadcrumb, onBreadcrumbLinkClick } = useBreadcrumb();

  if (breadcrumb.length === 0) {
    return undefined;
  }

  return (
    <Breadcrumbs aria-label={tt('navigation.breadcrumb')} mb="md">
      {breadcrumb.map((item, index) =>
        index < breadcrumb.length - 1 ? (
          <Link
            href={item.href}
            key={`${item.index.toString()}-${item.href}`}
            onClick={event => {
              onBreadcrumbLinkClick?.(item, event);
            }}
          >
            {item.label}
          </Link>
        ) : (
          <Text aria-current="page" key={`${item.index.toString()}-${item.href}`}>
            {item.label}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
};
