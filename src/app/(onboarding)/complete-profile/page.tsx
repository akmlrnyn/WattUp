import { redirect } from "next/navigation";
import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { dependencies } from "@/server/dependencies";
import { BillingForm } from "@/modules/billing/presentation/billing-form";
import { BrandWordmark } from "@/shared/presentation/components/brand-mark";
export default async function CompleteProfilePage() {
  const { user } = await requireUser();
  if (!user.emailVerified) redirect("/verify-email");
  const setup = await dependencies.onboarding.getUserChargingSetup.execute(user.id);
  if (!setup.hasVehicles) redirect("/onboarding");
  if (setup.billingType) redirect("/dashboard");
  return <main className="onboarding-page"><section className="onboarding-card">
    <header className="onboarding-heading"><BrandWordmark /><h1>Lengkapi profil listrik</h1>
      <p>Pilih jenis pembayaran listrik agar pencatatan charging sesuai dengan meter rumahmu. Kendaraan dan riwayatmu sudah tersimpan.</p>
    </header>
    <BillingForm
      billingType={null}
      completion
      discountPercent={setup.discountPercent}
      electricityRate={setup.electricityRate}
    />
  </section></main>;
}
