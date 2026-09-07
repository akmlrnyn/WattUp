import {
  CheckCircle2,
  Flame,
  Moon,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/modules/auth/infrastructure/auth";
import { dependencies } from "@/server/dependencies";

import {
  ChallengeShareButton,
} from "./challenge-share-button";

export const dynamic =
  "force-dynamic";

const DAY_MS =
  24 * 60 * 60 * 1_000;

const WIB_OFFSET_MS =
  7 * 60 * 60 * 1_000;

const WEEK_TARGET = 5;

const DAY_LABELS = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
];

function toWibDayIndex(
  date: Date,
): number {
  return Math.floor(
    (
      date.getTime() +
      WIB_OFFSET_MS
    ) / DAY_MS,
  );
}

function getWeekStartDayIndex(
  now: Date,
): number {
  const localDate = new Date(
    now.getTime() +
      WIB_OFFSET_MS,
  );

  const dayFromMonday =
    (
      localDate.getUTCDay() +
      6
    ) % 7;

  return (
    toWibDayIndex(now) -
    dayFromMonday
  );
}

function formatRupiah(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function formatDayNumber(
  dayIndex: number,
): string {
  const date = new Date(
    dayIndex * DAY_MS -
      WIB_OFFSET_MS,
  );

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      timeZone: "Asia/Jakarta",
    },
  ).format(date);
}

export default async function ChallengePage() {
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const [
    dashboard,
    recentSessions,
  ] = await Promise.all([
    dependencies.dashboard
      .getUserDashboard
      .execute(
        session.user.id,
      ),

    dependencies.charging
      .listRecentSessions
      .execute(
        session.user.id,
        50,
      ),
  ]);

  const now = new Date();

  const todayIndex =
    toWibDayIndex(now);

  const weekStartIndex =
    getWeekStartDayIndex(now);

  const weekEndIndex =
    weekStartIndex + 6;

  const currentWeekSessions =
    recentSessions.filter(
      (chargingSession) => {
        const dayIndex =
          toWibDayIndex(
            chargingSession
              .startedAt,
          );

        return (
          dayIndex >=
            weekStartIndex &&
          dayIndex <=
            weekEndIndex &&
          chargingSession.startedAt <=
            now
        );
      },
    );

  const weekDays =
    DAY_LABELS.map(
      (label, index) => {
        const dayIndex =
          weekStartIndex + index;

        const daySessions =
          currentWeekSessions.filter(
            (
              chargingSession,
            ) =>
              toWibDayIndex(
                chargingSession
                  .startedAt,
              ) === dayIndex,
          );

        const bestOffPeakRatio =
          daySessions.reduce(
            (
              best,
              chargingSession,
            ) => {
              if (
                chargingSession
                  .energyKwh <= 0
              ) {
                return best;
              }

              return Math.max(
                best,

                chargingSession
                  .discountedEnergyKwh /
                  chargingSession
                    .energyKwh,
              );
            },
            0,
          );

        const status =
          dayIndex > todayIndex
            ? "future"
            : bestOffPeakRatio >=
                0.99
              ? "full"
              : bestOffPeakRatio >
                  0
                ? "partial"
                : "miss";

        return {
          label,

          date:
            formatDayNumber(
              dayIndex,
            ),

          status,

          isToday:
            dayIndex ===
            todayIndex,
        };
      },
    );

  const completedDays =
    weekDays.filter(
      (day) =>
        day.status === "full",
    ).length;

  const progressPercent =
    Math.min(
      100,

      (
        completedDays /
        WEEK_TARGET
      ) * 100,
    );

  const weekShiftedEnergyKwh =
    currentWeekSessions.reduce(
      (
        total,
        chargingSession,
      ) =>
        total +
        chargingSession
          .discountedEnergyKwh,
      0,
    );

  const weekSavings =
    currentWeekSessions.reduce(
      (
        total,
        chargingSession,
      ) =>
        total +
        chargingSession
          .savingsAmount,
      0,
    );

  const offPeakSessions =
    recentSessions.filter(
      (chargingSession) =>
        chargingSession
          .discountedEnergyKwh >
        0,
    );

  const uniqueOffPeakDays =
    new Set(
      offPeakSessions.map(
        (
          chargingSession,
        ) =>
          toWibDayIndex(
            chargingSession
              .startedAt,
          ),
      ),
    ).size;

  const highScoreSessionCount =
    recentSessions.filter(
      (chargingSession) =>
        chargingSession
          .shiftScore >= 0.8,
    ).length;

  const badges = [
    {
      name:
        "First ShiftMalam",

      description:
        "Selesaikan sesi off-peak pertama",

      unlocked:
        offPeakSessions.length >=
        1,

      icon: Moon,
    },

    {
      name:
        "WattWarrior",

      description:
        "Pertahankan streak selama 5 hari",

      unlocked:
        dashboard.streakDays >=
        5,

      icon: Zap,
    },

    {
      name:
        "DuckSlayer",

      description:
        "Catat 10 sesi dengan score ≥0.8",

      unlocked:
        highScoreSessionCount >=
        10,

      icon: Sparkles,
    },

    {
      name:
        "GridGuardian",

      description:
        "Charging off-peak pada 7 hari berbeda",

      unlocked:
        uniqueOffPeakDays >= 7,

      icon: ShieldCheck,
    },
  ];

  const unlockedBadgeCount =
    badges.filter(
      (badge) =>
        badge.unlocked,
    ).length;

  return (
    <div className="challenge-page">
      <header
        className={
          "challenge-heading"
        }
      >
        <div>
          <h1>Challenge</h1>

          <p>
            Bangun kebiasaan
            charging malam dan
            buka lencana dari
            kontribusimu.
          </p>
        </div>

        <div
          className={
            "challenge-streak-pill"
          }
        >
          <Flame
            aria-hidden
            fill="currentColor"
            size={18}
          />

          <strong>
            {
              dashboard
                .streakDays
            }
          </strong>

          <span>
            hari streak
          </span>
        </div>
      </header>

      <section
        className={
          "challenge-progress-card"
        }
      >
        <div
          className={
            "challenge-progress-heading"
          }
        >
          <div>
            <span>
              Siklus #ShiftMalam
              minggu ini
            </span>

            <h2>
              {completedDays}
              {" dari "}
              {WEEK_TARGET}
              {" malam tercapai"}
            </h2>
          </div>

          <strong>
            {Math.round(
              progressPercent,
            )}
            %
          </strong>
        </div>

        <div
          className={
            "challenge-progress-track"
          }
        >
          <i
            style={{
              width:
                `${progressPercent}%`,
            }}
          />
        </div>

        <div
          className={
            "challenge-week-grid"
          }
        >
          {weekDays.map(
            (day) => (
              <article
                className={
                  `challenge-day ` +
                  `${day.status} ` +
                  `${
                    day.isToday
                      ? "today"
                      : ""
                  }`
                }
                key={day.label}
              >
                <span>
                  {day.label}
                </span>

                <strong>
                  {day.date}
                </strong>

                <i>
                  {day.status ===
                  "full" ? (
                    <CheckCircle2
                      aria-hidden
                      size={16}
                    />
                  ) : null}
                </i>
              </article>
            ),
          )}
        </div>

        <div
          className={
            "challenge-legend"
          }
        >
          <span>
            <i className="full" />
            Off-peak penuh
          </span>

          <span>
            <i className="partial" />
            Sebagian
          </span>

          <span>
            <i className="miss" />
            Belum tercapai
          </span>
        </div>
      </section>

      <div
        className={
          "challenge-content-grid"
        }
      >
        <section>
          <div
            className={
              "challenge-section-heading"
            }
          >
            <div>
              <h2>Lencana</h2>

              <p>
                {
                  unlockedBadgeCount
                }
                {" dari "}
                {badges.length}
                {" lencana terbuka"}
              </p>
            </div>
          </div>

          <div
            className={
              "challenge-badge-grid-grid"
            }
          >
            {badges.map(
              ({
                name,
                description,
                unlocked,
                icon: Icon,
              }) => (
                <article
                  className={
                    `challenge-badge-card ${
                      unlocked
                        ? "unlocked"
                        : ""
                    }`
                  }
                  key={name}
                >
                  <div
                    className={
                      "challenge-badge-icon"
                    }
                  >
                    <Icon
                      aria-hidden
                      size={24}
                    />
                  </div>

                  <div>
                    <strong>
                      {name}
                    </strong>

                    <span>
                      {
                        description
                      }
                    </span>
                  </div>

                  <small>
                    {unlocked
                      ? "Terbuka"
                      : "Terkunci"}
                  </small>
                </article>
              ),
            )}
          </div>
        </section>

        <aside>
          <div
            className={
              "challenge-section-heading"
            }
          >
            <div>
              <h2>
                Kartu dampak
                mingguan
              </h2>

              <p>
                Ringkasan
                kontribusimu
                minggu ini
              </p>
            </div>
          </div>

          <div
            className={
              "challenge-impact-card"
            }
          >
            <span>
              Minggu ini ·
              {" #ShiftMalam"}
            </span>

            <h2>
              Dampak charging
              malam kamu
            </h2>

            <div
              className={
                "challenge-impact-grid"
              }
            >
              <div>
                <strong>
                  {weekShiftedEnergyKwh.toFixed(
                    1,
                  )}
                  {" kWh"}
                </strong>

                <span>
                  dialihkan ke
                  off-peak
                </span>
              </div>

              <div>
                <strong>
                  {formatRupiah(
                    weekSavings,
                  )}
                </strong>

                <span>
                  hemat minggu ini
                </span>
              </div>

              <div>
                <strong>
                  {
                    dashboard
                      .streakDays
                  }
                  {" hari"}
                </strong>

                <span>
                  streak
                  ShiftMalam
                </span>
              </div>

              <div>
                <strong>
                  {dashboard
                    .currentUserRank >
                  0
                    ? `#${dashboard.currentUserRank}`
                    : "—"}
                </strong>

                <span>
                  peringkat
                  komunitas
                </span>
              </div>
            </div>
          </div>

          <ChallengeShareButton
            rank={
              dashboard
                .currentUserRank
            }
            savingsAmount={
              weekSavings
            }
            shiftedEnergyKwh={
              weekShiftedEnergyKwh
            }
            streakDays={
              dashboard
                .streakDays
            }
          />
        </aside>
      </div>
    </div>
  );
}