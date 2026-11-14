import baseConfig from '@repodog/eslint-config';
import jestConfig from '@repodog/eslint-config-jest';
import playwrightConfig from '@repodog/eslint-config-playwright';
import reactConfig from '@repodog/eslint-config-react';

// Required by Prettier
// eslint-disable-next-line import-x/no-default-export
export default [
  {
    ignores: [
      'appSettings.generated.d.ts',
      'mantine-styles.d.ts',
      'storybook-static/**',
      'bff/httpClient/**',
      'server/httpClient/**',
      'playwright/.auth/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...baseConfig,
  ...reactConfig,
  ...jestConfig,
  ...playwrightConfig.map(entry => ({
    ...entry,
    files: ['e2e/**/*.ts'],
  })),
  {
    files: ['e2e/**/*.ts', 'scripts/**/*.ts'],
    rules: {
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'unicorn/filename-case': ['error', { cases: { camelCase: true, kebabCase: true } }],
    },
  },
  {
    files: ['app/**/layout.tsx', 'app/**/page.tsx', 'components/**/*.stories.tsx'],
    rules: {
      'import-x/no-default-export': 0,
    },
  },
];
