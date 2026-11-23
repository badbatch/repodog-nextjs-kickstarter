import { type ReactNode } from 'react';
import { DashboardShell } from '#components/DashboardShell/DashboardShell.tsx';
import { EXAMPLE_ACCESS_POLICY } from '#libs/Auth/policies.ts';
import { logout } from '#server/auth/actions.ts';
import { requireSession } from '#server/auth/requireSession.ts';

const AuthenticatedLayout = async ({ children }: { children: ReactNode }): Promise<ReactNode> => {
  const session = await requireSession();

  return (
    <DashboardShell canAccessRestricted={session.user.policies.includes(EXAMPLE_ACCESS_POLICY)} signOutAction={logout}>
      {children}
    </DashboardShell>
  );
};

export default AuthenticatedLayout;
