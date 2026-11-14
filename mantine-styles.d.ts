declare module '@mantine/core/styles.css';

declare module '*.module.css' {
  const classes: Record<string, string>;

  export default classes;
}
