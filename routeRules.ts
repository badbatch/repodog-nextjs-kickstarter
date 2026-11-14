import { type BreadcrumbItem, type BreadcrumbRouteRule, type CreateRouteRules } from '@next-box/breadcrumb';

const sectionLabels: Record<string, string> = { restricted: 'Restricted example' };

const homeBreadcrumbRule: BreadcrumbRouteRule<Record<string, never>> = {
  regex: '^/$',
  resolve: (_captured, existing) => ({ ...existing, label: 'Home' }),
};

const sectionBreadcrumbRule: BreadcrumbRouteRule<{ detail?: string; section?: string }> = {
  regex: String.raw`^/(?<section>[^/?]+)(?:/(?<detail>[^/?]+))?(?:\?.*)?$`,
  resolve: ({ detail, section }, existing: BreadcrumbItem): BreadcrumbItem => {
    const sectionName = section ?? 'page';
    const label = sectionLabels[sectionName] ?? sectionName.replaceAll('-', ' ');

    return {
      ...existing,
      label: detail ? `${label} details` : label,
    };
  },
};

export const createRouteRules: CreateRouteRules = _options => [homeBreadcrumbRule, sectionBreadcrumbRule];
export const routeRules = createRouteRules({});
