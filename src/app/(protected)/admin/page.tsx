import {
  ArrowLeft,
  Flame,
} from "lucide-react";
import Link from "next/link";

import { dependencies } from "@/server/dependencies";
import { BrandWordmark } from "@/shared/presentation/components/brand-mark";

export const dynamic = "force-dynamic";

const PILOT_TARGET = 20;

function formatRupiah(
  value: number,
): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(value);
}

function getParticipantStatus(
  offPeakRate: number,
): {
  label: string;
  className:
    | "on-track"
    | "needs-push"
    | "at-risk";
} {
  if (offPeakRate >= 60) {
    return {
      label: "On track",
      className: "on-track",
    };
  }

  if (offPeakRate >= 35) {
    return {
      label: "Perlu dorongan",
      className: "needs-push",
    };
  }

  return {
    label: "Berisiko drop",
    className: "at-risk",
  };
}

export default async function AdminDashboardPage() {
  const dashboard =
    await dependencies.admin.getDashboard.execute();

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <Link
            className="admin-dashboard-back"
            href="/dashboard"
          >
            <ArrowLeft
              aria-hidden
              size={16}
            />
            Kembali ke aplikasi
          </Link>

          <BrandWordmark
  className="admin-header-logo"
  priority
/>

<h1>WattUp Admin Dashboard</h1>

          <p>
            Monitoring pilot #ShiftMalam ·
            data diperbarui otomatis
          </p>
        </div>

        <div className="admin-cycle-card">
          <span>Siklus berjalan</span>

          <strong>
            #{dashboard.currentCycleNumber}
            <i>·</i>
            Hari{" "}
            {dashboard.currentCycleDay}/7
          </strong>
        </div>
      </header>

      <section
        className="admin-dashboard-kpis"
        aria-label="Ringkasan pilot"
      >
        <article className="admin-dashboard-kpi">
          <span>
            Responden terdaftar
          </span>

          <strong>
            {dashboard.registeredUsers} /{" "}
            {PILOT_TARGET}
          </strong>

          <small>
            {dashboard.activeUsers} responden
            sudah aktif
          </small>
        </article>

        <article className="admin-dashboard-kpi">
          <span>
            Rata-rata off-peak rate
          </span>

          <strong>
            {formatNumber(
              dashboard.averageOffPeakRate,
            )}
            %
          </strong>

          <small>
            Dari total energi seluruh
            responden
          </small>
        </article>

        <article className="admin-dashboard-kpi">
          <span>
            Menyelesaikan 1 siklus
          </span>

          <strong>
            {formatNumber(
              dashboard.cycleCompletionRate,
            )}
            %
          </strong>

          <small>
            {dashboard.completedCycleUsers}{" "}
            responden mencapai 7 hari
          </small>
        </article>

        <article className="admin-dashboard-kpi">
          <span>
            Total kWh dialihkan
          </span>

          <strong>
            {formatNumber(
              dashboard.totalShiftedEnergyKwh,
            )} kWh
          </strong>

          <small>
            Hemat{" "}
            {formatRupiah(
              dashboard.totalSavings,
            )}
          </small>
        </article>
      </section>

      <div className="admin-dashboard-content">
        <section className="admin-dashboard-panel admin-respondent-panel">
          <div className="admin-panel-title">
            <div>
              <h2>
                Responden (
                {dashboard.registeredUsers})
              </h2>

              <p>
                {dashboard.totalSessions} sesi
                charging tercatat
              </p>
            </div>
          </div>

          <div className="admin-respondent-table-wrap">
            <table className="admin-respondent-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>EV</th>
                  <th>Streak</th>
                  <th>Off-peak %</th>
                  <th>Hemat (Rp)</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.participants
                  .length === 0 ? (
                  <tr>
                    <td
                      className="admin-table-empty"
                      colSpan={6}
                    >
                      Belum ada responden yang
                      terdaftar.
                    </td>
                  </tr>
                ) : (
                  dashboard.participants.map(
                    (participant) => {
                      const status =
                        getParticipantStatus(
                          participant.offPeakRate,
                        );

                      return (
                        <tr
                          key={
                            participant.userId
                          }
                        >
                          <td>
                            <span className="admin-participant-name">
                              {
                                participant.name
                              }
                            </span>

                            <small>
                              {
                                participant.email
                              }
                            </small>
                          </td>

                          <td>
                            <span className="admin-vehicle-name">
                              {
                                participant.vehicleName
                              }
                            </span>
                          </td>

                          <td>
                            <span className="admin-streak-value">
                              {
                                participant.streakDays
                              }

                              <Flame
                                aria-label="hari beruntun"
                                size={13}
                                strokeWidth={2}
                                fill="currentColor"
                              />
                            </span>
                          </td>

                          <td>
                            <strong>
                              {formatNumber(
                                participant.offPeakRate,
                              )}
                              %
                            </strong>
                          </td>

                          <td>
                            <strong>
                              {formatRupiah(
                                participant.savingsAmount,
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`admin-status-pill ${status.className}`}
                            >
                              {
                                status.label
                              }
                            </span>
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-dashboard-panel admin-chart-panel">
          <div className="admin-panel-title">
            <div>
              <h2>
                Off-peak rate harian
              </h2>

              <p>
                Rata-rata kohort pada minggu
                berjalan
              </p>
            </div>
          </div>

          <div
            className="admin-daily-chart"
            aria-label="Grafik off-peak rate harian"
          >
            {dashboard.dailyOffPeakRates.map(
              (day) => {
                const barHeight =
                  day.rate > 0
                    ? Math.max(
                        7,
                        Math.min(
                          day.rate,
                          100,
                        ),
                      )
                    : 0;

                return (
                  <div
                    className="admin-chart-column"
                    key={day.label}
                  >
                    <div className="admin-chart-track">
                      {day.rate > 0 ? (
                        <span>
                          {formatNumber(
                            day.rate,
                          )}
                          %
                        </span>
                      ) : null}

                      <i
                        style={{
                          height: `${barHeight}%`,
                        }}
                      />
                    </div>

                    <strong>
                      {day.label}
                    </strong>
                  </div>
                );
              },
            )}
          </div>

          <p className="admin-chart-note">
            Persentase membandingkan energi
            pada window off-peak dengan total
            energi charging per hari. Hari
            tanpa sesi ditampilkan sebagai 0%.
          </p>
        </section>
      </div>
    </main>
  );
}