// stylelint convention is to export default
// eslint-disable-next-line import-x/no-default-export
export default {
  extends: ['@repodog/stylelint-config'],
  ignoreFiles: ['node_modules/**/*', 'coverage/**/*', 'playwright-report/**/*'],
};
