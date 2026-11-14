import { redirect } from 'next/navigation.js';
import { type ReactNode } from 'react';
import { auth } from '#auth.ts';
import { tt } from '#content/index.ts';
import { logout } from '#server/auth/actions.ts';

const AuthenticatedLayout = async ({ children }: { children: ReactNode }): Promise<ReactNode> => {
  const session = await auth();

  if (!session || session.error) {
    redirect('/login');
  }

  return (
    <>
      <form action={logout}>
        <button type="submit">{tt('actions.signOut')}</button>
      </form>
      {children}
    </>
  );
};

export default AuthenticatedLayout;
