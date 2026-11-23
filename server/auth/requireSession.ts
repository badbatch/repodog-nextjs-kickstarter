import { redirect } from 'next/navigation.js';
import { type Session } from 'next-auth';
import { readApiSession } from './apiAuth.ts';

export const requireSession = async (policy?: string): Promise<Session> => {
  const session = await readApiSession();

  if (!session || session.error) {
    redirect('/login');
  }

  if (policy !== undefined && !session.user.policies.includes(policy)) {
    redirect('/access-denied');
  }

  return session;
};
