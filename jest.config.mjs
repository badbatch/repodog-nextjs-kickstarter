import createJestConfig from '@repodog/jest-config';
import swcConfig from '@repodog/swc-config';

const baseConfig = createJestConfig({ compilerOptions: swcConfig });

// Required by Jest
// eslint-disable-next-line import-x/no-default-export
export default {
  ...baseConfig,
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'server/**/*.{ts,tsx}',
    'libs/**/*.{ts,tsx}',
    'appSettings/**/*.{ts,tsx}',
    'routeRules.ts',
    '!**/httpClient/**',
    '!**/*.d.ts',
    '!**/types.ts',
    '!**/*.stories.*',
    '!**/*.test.*',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  setupFilesAfterEnv: [...baseConfig.setupFilesAfterEnv, '<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/**/*.test.{ts,tsx}', '!**/*.integration.test.ts'],
};
