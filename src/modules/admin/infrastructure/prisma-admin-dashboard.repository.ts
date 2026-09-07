import type {
  AdminDailyOffPeakRate,
  AdminDashboardData,
  AdminDashboardRepository,
  AdminParticipant,
} from "../domain/repositories/admin-dashboard.repository";

import { isAdmin } from "@/modules/auth/domain/roles";
import { prisma } from "@/shared/infrastructure/database/prisma";

const DAY_MS = 24 * 60 * 60 * 1_000;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1_000;
const HISTORY_WINDOW_DAYS = 365;

const DAY_LABELS = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
];

function toNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function roundTo(
  value: number,
  decimalPlaces: number,
): number {
  const factor = 10 ** decimalPlaces;

  return (
    Math.round(
      (value + Number.EPSILON) * factor,
    ) / factor
  );
}

function toWibDayIndex(date: Date): number {
  return Math.floor(
    (date.getTime() + WIB_OFFSET_MS) / DAY_MS,
  );
}

function getWibMondayIndex(date: Date): number {
  const wibDayIndex = toWibDayIndex(date);

  const dayOfWeek = new Date(
    wibDayIndex * DAY_MS,
  ).getUTCDay();

  const daysSinceMonday = (dayOfWeek + 6) % 7;

  return wibDayIndex - daysSinceMonday;
}

function calculateStreak(
  sessionDates: Date[],
  now: Date,
): number {
  if (sessionDates.length === 0) {
    return 0;
  }

  const activeDays = new Set(
    sessionDates.map(toWibDayIndex),
  );

  const today = toWibDayIndex(now);

  let cursor = activeDays.has(today)
    ? today
    : today - 1;

  let streak = 0;

  while (activeDays.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}

export class PrismaAdminDashboardRepository
  implements AdminDashboardRepository
{
  async getDashboard(
    now = new Date(),
  ): Promise<AdminDashboardData> {
    const historyStart = new Date(
      now.getTime() -
        HISTORY_WINDOW_DAYS * DAY_MS,
    );

    const [
      users,
      sessionAggregates,
      recentSessions,
      firstSession,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,

          vehicles: {
            select: {
              name: true,
            },

            orderBy: [
              {
                isPrimary: "desc",
              },
              {
                createdAt: "asc",
              },
            ],

            take: 1,
          },
        },

        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.chargingSession.groupBy({
        by: ["userId"],

        _count: {
          _all: true,
        },

        _sum: {
          energyKwh: true,
          discountedEnergyKwh: true,
          savingsAmount: true,
        },

        _avg: {
          shiftScore: true,
        },
      }),

      prisma.chargingSession.findMany({
        where: {
          startedAt: {
            gte: historyStart,
            lte: now,
          },
        },

        select: {
          userId: true,
          startedAt: true,
          energyKwh: true,
          discountedEnergyKwh: true,
        },

        orderBy: {
          startedAt: "asc",
        },
      }),

      prisma.chargingSession.findFirst({
        select: {
          startedAt: true,
        },

        orderBy: {
          startedAt: "asc",
        },
      }),
    ]);

    /*
     * Akun admin tidak dihitung sebagai
     * responden pilot.
     */
    const participantUsers = users.filter(
      (user) => !isAdmin(user.role),
    );

    const participantIds = new Set(
      participantUsers.map((user) => user.id),
    );

    const aggregateByUserId = new Map(
      sessionAggregates.map((aggregate) => [
        aggregate.userId,
        aggregate,
      ]),
    );

    const offPeakDatesByUserId =
      new Map<string, Date[]>();

    for (const session of recentSessions) {
      if (
        !participantIds.has(session.userId) ||
        toNumber(
          session.discountedEnergyKwh,
        ) <= 0
      ) {
        continue;
      }

      const dates =
        offPeakDatesByUserId.get(
          session.userId,
        ) ?? [];

      dates.push(session.startedAt);

      offPeakDatesByUserId.set(
        session.userId,
        dates,
      );
    }

    const participants: AdminParticipant[] =
      participantUsers.map((user) => {
        const aggregate =
          aggregateByUserId.get(user.id);

        const totalEnergyKwh = toNumber(
          aggregate?._sum.energyKwh,
        );

        const shiftedEnergyKwh = toNumber(
          aggregate?._sum
            .discountedEnergyKwh,
        );

        const offPeakRate =
          totalEnergyKwh > 0
            ? (shiftedEnergyKwh /
                totalEnergyKwh) *
              100
            : 0;

        return {
          userId: user.id,
          name: user.name,
          email: user.email,

          vehicleName:
            user.vehicles[0]?.name ??
            "Belum diatur",

          sessionCount:
            aggregate?._count._all ?? 0,

          streakDays: calculateStreak(
            offPeakDatesByUserId.get(
              user.id,
            ) ?? [],
            now,
          ),

          totalEnergyKwh: roundTo(
            totalEnergyKwh,
            1,
          ),

          shiftedEnergyKwh: roundTo(
            shiftedEnergyKwh,
            1,
          ),

          savingsAmount: roundTo(
            toNumber(
              aggregate?._sum.savingsAmount,
            ),
            2,
          ),

          offPeakRate: roundTo(
            offPeakRate,
            1,
          ),

          averageScore: roundTo(
            toNumber(
              aggregate?._avg.shiftScore,
            ),
            2,
          ),
        };
      });

    participants.sort((left, right) => {
      if (
        right.offPeakRate !==
        left.offPeakRate
      ) {
        return (
          right.offPeakRate -
          left.offPeakRate
        );
      }

      if (
        right.shiftedEnergyKwh !==
        left.shiftedEnergyKwh
      ) {
        return (
          right.shiftedEnergyKwh -
          left.shiftedEnergyKwh
        );
      }

      return left.name.localeCompare(
        right.name,
        "id",
      );
    });

    const activeUsers = participants.filter(
      (participant) =>
        participant.sessionCount > 0,
    ).length;

    const totalSessions =
      participants.reduce(
        (total, participant) =>
          total +
          participant.sessionCount,
        0,
      );

    const totalEnergyKwh =
      participants.reduce(
        (total, participant) =>
          total +
          participant.totalEnergyKwh,
        0,
      );

    const totalShiftedEnergyKwh =
      participants.reduce(
        (total, participant) =>
          total +
          participant.shiftedEnergyKwh,
        0,
      );

    const totalSavings =
      participants.reduce(
        (total, participant) =>
          total +
          participant.savingsAmount,
        0,
      );

    /*
     * Menggunakan weighted rate.
     * Jadi responden dengan energi 20 kWh
     * punya bobot lebih besar dari 1 kWh.
     */
    const averageOffPeakRate =
      totalEnergyKwh > 0
        ? (totalShiftedEnergyKwh /
            totalEnergyKwh) *
          100
        : 0;

    /*
     * Satu siklus dianggap selesai setelah
     * responden mempunyai tujuh hari unik
     * dengan energi off-peak.
     */
    const completedCycleUsers =
      participantUsers.filter((user) => {
        const uniqueOffPeakDays =
          new Set(
            (
              offPeakDatesByUserId.get(
                user.id,
              ) ?? []
            ).map(toWibDayIndex),
          );

        return uniqueOffPeakDays.size >= 7;
      }).length;

    const cycleCompletionRate =
      participantUsers.length > 0
        ? (completedCycleUsers /
            participantUsers.length) *
          100
        : 0;

    const currentMondayIndex =
      getWibMondayIndex(now);

    const currentDayIndex =
      toWibDayIndex(now);

    const currentCycleDay = Math.min(
      7,
      Math.max(
        1,
        currentDayIndex -
          currentMondayIndex +
          1,
      ),
    );

    const firstMondayIndex = firstSession
      ? getWibMondayIndex(
          firstSession.startedAt,
        )
      : currentMondayIndex;

    const currentCycleNumber = Math.max(
      1,
      Math.floor(
        (currentMondayIndex -
          firstMondayIndex) /
          7,
      ) + 1,
    );

    const dailyTotals = Array.from(
      {
        length: 7,
      },
      () => ({
        energyKwh: 0,
        shiftedEnergyKwh: 0,
      }),
    );

    for (const session of recentSessions) {
      if (
        !participantIds.has(
          session.userId,
        )
      ) {
        continue;
      }

      const sessionDayIndex =
        toWibDayIndex(
          session.startedAt,
        );

      const index =
        sessionDayIndex -
        currentMondayIndex;

      if (index < 0 || index > 6) {
        continue;
      }

      dailyTotals[index].energyKwh +=
        toNumber(session.energyKwh);

      dailyTotals[
        index
      ].shiftedEnergyKwh += toNumber(
        session.discountedEnergyKwh,
      );
    }

    const dailyOffPeakRates:
      AdminDailyOffPeakRate[] =
      dailyTotals.map(
        (total, index) => ({
          label: DAY_LABELS[index],

          rate: roundTo(
            total.energyKwh > 0
              ? (total.shiftedEnergyKwh /
                  total.energyKwh) *
                100
              : 0,
            1,
          ),
        }),
      );

    return {
      registeredUsers:
        participants.length,

      activeUsers,
      totalSessions,

      totalShiftedEnergyKwh: roundTo(
        totalShiftedEnergyKwh,
        1,
      ),

      totalSavings: roundTo(
        totalSavings,
        2,
      ),

      averageOffPeakRate: roundTo(
        averageOffPeakRate,
        1,
      ),

      cycleCompletionRate: roundTo(
        cycleCompletionRate,
        1,
      ),

      completedCycleUsers,

      currentCycleNumber,
      currentCycleDay,

      dailyOffPeakRates,
      participants,
    };
  }
}