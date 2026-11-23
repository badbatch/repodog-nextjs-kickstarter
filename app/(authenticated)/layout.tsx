import { redirect } from 'next/navigation.js';
import { type ReactNode } from 'react';
import { DashboardShell } from '#components/DashboardShell/DashboardShell.tsx';
import { EXAMPLE_ACCESS_POLICY } from '#libs/Auth/policies.ts';
import { logout } from '#server/auth/actions.ts';
import { readApiSession } from '#server/auth/apiAuth.ts';

const AuthenticatedLayout = async ({ children }: { children: ReactNode }): Promise<ReactNode> => {
  const session = await readApiSession();

  if (!session || session.error) {
    redirect('/login');
  }

  return (
    <DashboardShell canAccessRestricted={session.user.policies.includes(EXAMPLE_ACCESS_POLICY)} signOutAction={logout}>
      {children}
    </DashboardShell>
  );
};

export default AuthenticatedLayout;
