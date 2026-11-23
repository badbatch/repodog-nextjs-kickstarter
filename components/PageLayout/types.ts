import { type ReactNode } from 'react';
export type PageHeaderProps = { actions?: ReactNode; description?: string; title: string };
export type PageLayoutProps = PageHeaderProps & { breadcrumbs?: ReactNode; children: ReactNode };
