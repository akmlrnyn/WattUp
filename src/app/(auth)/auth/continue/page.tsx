import { redirect } from "next/navigation";

import { isAdmin } from "@/modules/auth/domain/roles";
import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { dependencies } from "@/server/dependencies";

export const dynamic = "force-dynamic";

export default async function AuthContinuePage() {
  const session = await requireUser();

  const userRole = (
    session.user as {
      role?: unknown;
    }
  ).role;

  if (isAdmin(userRole)) {
    redirect("/admin");
  }

  const setup =
    await dependencies.onboarding.getUserChargingSetup.execute(
      session.user.id,
    );

  /*
   * Google user baru sudah memiliki User dan Account,
   * tetapi belum memiliki Vehicle.
   */
  if (!setup.vehicleId) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}