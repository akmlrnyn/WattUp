import { redirect } from "next/navigation";

import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { UserSetupForm } from "@/modules/onboarding/presentation/components/user-setup-form";
import { dependencies } from "@/server/dependencies";
// import { BrandWordmark } from "@/shared/presentation/components/brand-mark";

export const dynamic =
  "force-dynamic";

export default async function OnboardingPage() {
  const session =
    await requireUser();

  const setup =
    await dependencies.onboarding
      .getUserChargingSetup.execute(
        session.user.id,
      );

  if (setup.vehicleId) {
    redirect("/dashboard");
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <header className="onboarding-heading">
          <div>
            {/* <BrandWordmark
              className="onboarding-logo"
              priority
            /> */}

            <span>
              Langkah 2 dari 2
            </span>
          </div>

          <h1>
            Kenalkan kendaraanmu
          </h1>

          <p>
            Selesaikan setup agar
            kalkulasi charging,
            penghematan, dan leaderboard
            WattUp lebih akurat.
          </p>
        </header>

        <UserSetupForm />
      </section>
    </main>
  );
}