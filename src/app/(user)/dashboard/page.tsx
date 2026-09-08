import {
  ArrowRight,
  Flame,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { getGridStatus } from "@/modules/charging/domain/grid-window";
import { dependencies } from "@/server/dependencies";

export const dynamic = "force-dynamic";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getGridStatusClass(
  window: "off-peak" | "peak" | "regular",
): string {
  if (window === "peak") {
    return "peak";
  }

  if (window === "regular") {
    return "regular";
  }

  return "off-peak";
}

export default async function DashboardPage() {
  const session = await requireUser();

  const dashboard =
    await dependencies.dashboard.getUserDashboard.execute(
      session.user.id,
    );

  const gridStatus = getGridStatus();

  const gridStatusClass = getGridStatusClass(
    gridStatus.window,
  );

  const stats = [
    {
      label: "Hemat minggu ini",
      value: formatRupiah(dashboard.weekSavings),
      subtitle: "dari sesi off-peak",
    },
    {
      label: "kWh dialihkan",
      value:
        dashboard.weekShiftedEnergyKwh.toFixed(1) + " kWh",
      subtitle: "minggu ini",
    },
    {
      label: "Total hemat",
      value: formatRupiah(dashboard.totalSavings),
      subtitle: "sejak bergabung",
    },
    {
      label: "Skor rata-rata",
      value: dashboard.averageScore.toFixed(2),
      subtitle: "dari 1.0",
    },
  ];

  return (
    <>
      <header className="dashboard-heading">
        <h1>Dashboard</h1>

        <p>
          Pantau kebiasaan charging, penghematan, dan
          kontribusi kamu terhadap pergeseran beban listrik.
        </p>
      </header>

      <div className="dashboard-top-grid">
        <section
          className={`status-banner ${gridStatusClass}`}
        >
          <div className="status-dot" />

          <div>
            <strong>{gridStatus.title}</strong>
            <span>{gridStatus.subtitle}</span>
          </div>
        </section>

        <section className="streak-row">
          <div className="streak-icon">
            <Flame
              aria-hidden
              size={22}
              strokeWidth={1.8}
              fill="currentColor"
            />
          </div>

          <div className="streak-content">
            <strong className="streak-value">
              {dashboard.streakDays}
            </strong>

            <span className="streak-label">
              hari beruntun ShiftMalam
            </span>
          </div>
        </section>
      </div>

      <section
        className="stat-grid"
        aria-label="Ringkasan charging"
      >
        {stats.map((stat) => (
          <article
            className="stat-card"
            key={stat.label}
          >
            <div className="stat-label">
              {stat.label}
            </div>

            <div className="stat-value">
              {stat.value}
            </div>

            <div className="stat-subtitle">
              {stat.subtitle}
            </div>
          </article>
        ))}
      </section>

      <div className="dashboard-bottom-grid">
        <section>
          <h2 className="section-title">
            Papan peringkat komunitas
          </h2>

          <div className="surface-card leaderboard-card">
            {dashboard.leaderboardPreview.length ===
            0 ? (
              <div className="empty-history">
                Belum ada data komunitas.
              </div>
            ) : (
              dashboard.leaderboardPreview.map(
                (member) => (
                  <div
                    key={member.userId}
                    className={`leader-row ${
                      member.isCurrentUser
                        ? "me"
                        : ""
                    }`}
                  >
                    <span className="leader-rank">
                      {member.rank === 1 ? (
                        <Trophy
                          aria-label="Peringkat pertama"
                          size={17}
                          strokeWidth={1.8}
                        />
                      ) : (
                        member.rank
                      )}
                    </span>

                    <span>
                      {member.isCurrentUser
                        ? "Kamu"
                        : member.displayName}
                    </span>

                    <strong className="leader-energy">
                      {member.shiftedEnergyKwh.toFixed(
                        1,
                      )}{" "}
                      kWh
                    </strong>
                  </div>
                ),
              )
            )}
          </div>
        </section>

        <aside className="dashboard-action-card">
          <div className="dashboard-action-icon">
            <Zap
              aria-hidden
              size={22}
              strokeWidth={1.8}
              fill="currentColor"
            />
          </div>

          <h2>Siap charging malam ini?</h2>

          <p>
            Catat sesi charging setelah pukul 22.00 untuk
            meningkatkan ShiftMalam Score dan melihat
            estimasi penghematanmu.
          </p>

          <Link
            className="primary-button"
            href="/sessions/new"
          >
            Catat Sesi Charging
            <ArrowRight aria-hidden size={17} />
          </Link>
        </aside>
      </div>
    </>
  );
}