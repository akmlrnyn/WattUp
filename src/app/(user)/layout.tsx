import { isAdmin } from "@/modules/auth/domain/roles";
import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { dependencies } from "@/server/dependencies";
import { AppShell } from "@/shared/presentation/components/app-shell";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default async function UserLayout({
  children,
}: UserLayoutProps) {
  const session =
    await requireUser();

  if (!session.user.emailVerified) {
    redirect("/verify-email");
  }

  const userRole = (
    session.user as {
      role?: unknown;
    }
  ).role;

  if (!isAdmin(userRole)) {
    const setup =
      await dependencies.onboarding
        .getUserChargingSetup.execute(
          session.user.id,
        );

    if (!setup.vehicleId) {
      redirect("/onboarding");
    }
  }

  return (
    <AppShell
      userName={session.user.name}
      isAdmin={isAdmin(userRole)}
    >
      {children}
    </AppShell>
  );
}
