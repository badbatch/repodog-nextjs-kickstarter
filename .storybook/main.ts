import { config as storybookConfig } from '@repodog/storybook-config';
import swcConfig from '@repodog/swc-config';

const config = storybookConfig({ compiler: ['swc', swcConfig.ts] });

// Storybook requires default export
// eslint-disable-next-line import-x/no-default-export
export default config;
