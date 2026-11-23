import { redirect } from 'next/navigation.js';
import { type Session } from 'next-auth';
import { readApiSession } from './apiAuth.ts';

export const requireSession = async (): Promise<Session> => {
  const session = await readApiSession();

  if (!session || session.error) {
    redirect('/login');
  }

  return session;
};
