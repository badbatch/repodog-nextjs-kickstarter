import { Anchor, Blockquote, Code, Divider, List, Text, Title } from '@mantine/core';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

const p = ({ children, ...otherProps }: ComponentPropsWithoutRef<'p'>): ReactNode => (
  <Text component="p" mb="sm" {...otherProps}>
    {children}
  </Text>
);

const h1 = ({ children, ...otherProps }: ComponentPropsWithoutRef<'h1'>): ReactNode => (
  <Title mb="lg" order={1} {...otherProps}>
    {children}
  </Title>
);

const h2 = ({ children, ...otherProps }: ComponentPropsWithoutRef<'h2'>): ReactNode => (
  <Title mb="md" order={2} {...otherProps}>
    {children}
  </Title>
);

const h3 = ({ children, ...otherProps }: ComponentPropsWithoutRef<'h3'>): ReactNode => (
  <Title mb="md" order={3} {...otherProps}>
    {children}
  </Title>
);

const h4 = ({ children, ...otherProps }: ComponentPropsWithoutRef<'h4'>): ReactNode => (
  <Title mb="sm" order={4} {...otherProps}>
    {children}
  </Title>
);

const h5 = ({ children, ...otherProps }: ComponentPropsWithoutRef<'h5'>): ReactNode => (
  <Title mb="sm" order={5} {...otherProps}>
    {children}
  </Title>
);

const h6 = ({ children, ...otherProps }: ComponentPropsWithoutRef<'h6'>): ReactNode => (
  <Title mb="xs" order={6} {...otherProps}>
    {children}
  </Title>
);

const a = ({ children, ...otherProps }: ComponentPropsWithoutRef<'a'>): ReactNode => (
  <Anchor {...otherProps}>{children}</Anchor>
);

const ul = ({ children, ...otherProps }: ComponentPropsWithoutRef<'ul'>): ReactNode => (
  <List component="ul" {...otherProps}>
    {children}
  </List>
);

const li = ({ children, ...otherProps }: ComponentPropsWithoutRef<'li'>): ReactNode => (
  <List.Item {...otherProps}>{children}</List.Item>
);

const hr = (props: ComponentPropsWithoutRef<'hr'>): ReactNode => <Divider {...props} />;

const blockquote = ({ children, ...otherProps }: ComponentPropsWithoutRef<'blockquote'>): ReactNode => (
  <Blockquote {...otherProps}>{children}</Blockquote>
);

const code = ({ children, ...otherProps }: ComponentPropsWithoutRef<'code'>): ReactNode => (
  <Code {...otherProps}>{children}</Code>
);

const pre = ({ children, ...otherProps }: ComponentPropsWithoutRef<'pre'>): ReactNode => (
  <Code block {...otherProps}>
    {children}
  </Code>
);

export const componentMapper = { a, blockquote, code, h1, h2, h3, h4, h5, h6, hr, li, p, pre, ul };
