import {
  Medal,
  Trophy,
  Zap,
} from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/modules/auth/infrastructure/auth";
import { dependencies } from "@/server/dependencies";

export const dynamic = "force-dynamic";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRankIcon(rank: number) {
  if (rank === 1) {
    return (
      <Trophy
        aria-label="Peringkat pertama"
        size={21}
      />
    );
  }

  if (rank <= 3) {
    return (
      <Medal
        aria-label={`Peringkat ${rank}`}
        size={21}
      />
    );
  }

  return rank;
}

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const dashboard =
    await dependencies.dashboard.getUserDashboard.execute(
      session.user.id,
    );

  const communityEnergy =
    dashboard.leaderboard.reduce(
      (total, user) =>
        total + user.shiftedEnergyKwh,
      0,
    );

  const communitySavings =
    dashboard.leaderboard.reduce(
      (total, user) =>
        total + user.savingsAmount,
      0,
    );

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-heading">
        <div>
          <h1>Papan Peringkat</h1>

          <p>
            Peringkat berdasarkan total energi yang
            dialihkan ke jam off-peak.
          </p>
        </div>

        {dashboard.currentUserRank > 0 ? (
          <div className="current-rank-card">
            <span>Peringkat kamu</span>
            <strong>
              #{dashboard.currentUserRank}
            </strong>
          </div>
        ) : null}
      </header>

      <section className="leaderboard-impact-grid">
        <article className="stat-card">
          <div className="stat-label">
            Total kWh komunitas
          </div>

          <div className="stat-value">
            {communityEnergy.toFixed(1)}
          </div>

          <div className="stat-subtitle">
            dialihkan ke off-peak
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-label">
            Total hemat komunitas
          </div>

          <div className="stat-value">
            {formatRupiah(communitySavings)}
          </div>

          <div className="stat-subtitle">
            seluruh peserta WattUp
          </div>
        </article>
      </section>

      <h2 className="section-title">
        Peringkat ShiftMalam
      </h2>

      <section className="surface-card leaderboard-full-card">
        {dashboard.leaderboard.length === 0 ? (
          <div className="empty-history">
            Belum ada peserta dengan sesi off-peak.
          </div>
        ) : (
          dashboard.leaderboard.map((member) => (
            <article
              key={member.userId}
              className={`leaderboard-full-row ${
                member.isCurrentUser ? "me" : ""
              }`}
            >
              <div className="leaderboard-position">
                {getRankIcon(member.rank)}
              </div>

              <div className="leaderboard-user">
                <strong>
                  {member.isCurrentUser
                    ? "Kamu"
                    : member.displayName}
                </strong>

                <span>
                  ShiftMalam Score{" "}
                  {member.averageScore.toFixed(2)}
                </span>
              </div>

              <div className="leaderboard-result">
                <strong>
                  <Zap aria-hidden size={14} />
                  {member.shiftedEnergyKwh.toFixed(1)}{" "}
                  kWh
                </strong>

                <span>
                  Hemat{" "}
                  {formatRupiah(
                    member.savingsAmount,
                  )}
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}