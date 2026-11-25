import { type ApiSession } from '@next-box/auth';
import { redirect } from 'next/navigation.js';
import { readApiSession } from '#auth.ts';

export const requireSession = async (policy?: string): Promise<ApiSession> => {
  const session = await readApiSession();

  if (!session || session.error) {
    redirect('/login');
  }

  if (policy !== undefined && !session.user.policies.includes(policy)) {
    redirect('/access-denied');
  }

  return session;
};
