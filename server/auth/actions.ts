'use server';

import { signOut } from '#auth.ts';

export const logout = async (): Promise<void> => {
  await signOut({ redirectTo: '/login' });
};
