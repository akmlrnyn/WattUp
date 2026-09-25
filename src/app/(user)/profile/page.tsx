import { ArrowLeft, Info, Zap } from "lucide-react";
import Link from "next/link";

import { BillingForm } from "@/modules/billing/presentation/billing-form";
import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { dependencies } from "@/server/dependencies";

export default async function ProfilePage() {
  const { user } = await requireUser();
  const setup = await dependencies.onboarding.getUserChargingSetup.execute(user.id);

  return (
    <div className="electricity-profile-page">
      <Link className="vehicle-back-link" href="/vehicles">
        <ArrowLeft aria-hidden size={16} />
        Kendaraan Saya
      </Link>

      <header className="electricity-profile-heading">
        <div>
          <span className="page-eyebrow">Pengaturan charging</span>
          <h1>Profil Listrik</h1>
          <p>
            Atur mekanisme pembayaran dan tarif untuk menjaga estimasi biaya charging tetap relevan.
          </p>
        </div>
        <Link href="/sessions/new">
          <Zap aria-hidden size={17} />
          Catat charging
        </Link>
      </header>

      <aside className="electricity-profile-notice">
        <Info aria-hidden size={18} />
        <p>
          Perubahan hanya berlaku untuk sesi baru. Setiap sesi lama tetap menggunakan snapshot tarif dan jenis pembayaran saat sesi tersebut dicatat.
        </p>
      </aside>

      <BillingForm
        billingType={setup.billingType}
        discountPercent={setup.discountPercent}
        electricityRate={setup.electricityRate}
      />
    </div>
  );
}
