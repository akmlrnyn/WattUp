import { isAdmin } from "@/modules/auth/domain/roles";
import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { AppShell } from "@/shared/presentation/components/app-shell";

export const dynamic = "force-dynamic";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default async function UserLayout({
  children,
}: UserLayoutProps) {
  const session =
    await requireUser();

  const userRole = (
    session.user as {
      role?: unknown;
    }
  ).role;

  return (
    <AppShell
      userName={session.user.name}
      isAdmin={isAdmin(userRole)}
    >
      {children}
    </AppShell>
  );
}