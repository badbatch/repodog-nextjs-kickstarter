export const register = async (): Promise<void> => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { configureServerLogging } = await import('@next-box/logging/server');
  await configureServerLogging();
};
