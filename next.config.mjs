import bundleAnalyzer from '@next/bundle-analyzer';

const { DEBUG } = process.env;

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Required for Next.js
// eslint-disable-next-line import-x/no-default-export
export default withBundleAnalyzer({
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  output: 'standalone',
  outputFileTracingIncludes: {
    '/*': ['./config/*.json'],
  },
  productionBrowserSourceMaps: DEBUG === 'true',
  typescript: {
    ignoreBuildErrors: true,
  },
});
