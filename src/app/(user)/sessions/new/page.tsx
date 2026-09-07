import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { dependencies } from "@/server/dependencies";

import {
  ChargingSessionForm,
  type RecentChargingSessionItem,
} from "@/modules/charging/presentation/components/charging-session-form";

export const dynamic = "force-dynamic";

export default async function NewChargingSessionPage() {
  const session = await requireUser();

  const sessions =
    await dependencies.charging
      .listRecentSessions.execute(
        session.user.id,
      );

  const recentSessions:
    RecentChargingSessionItem[] =
    sessions.slice(0, 6).map(
      (item) => ({
        id: item.id,

        startedAt:
          item.startedAt.toISOString(),

        energyKwh: item.energyKwh,

        savingsAmount:
          item.savingsAmount,

        shiftScore: item.shiftScore,
      }),
    );

  return (
    <div className="catat-page">
      <header className="catat-page-heading">
        <div>
          <h1>Catat Sesi Charging</h1>

          <p>
            Masukkan waktu dan energi
            charging untuk menghitung
            ShiftMalam Score serta estimasi
            penghematanmu.
          </p>
        </div>

        <span>#ShiftMalam</span>
      </header>

      <ChargingSessionForm
        recentSessions={recentSessions}
      />
    </div>
  );
}