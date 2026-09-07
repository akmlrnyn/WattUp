import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/modules/auth/infrastructure/auth";
import { isAdmin } from "@/modules/auth/domain/roles";
import { AppShell } from "@/shared/presentation/components/app-shell";

export const dynamic = "force-dynamic";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default async function UserLayout({
  children,
}: UserLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

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