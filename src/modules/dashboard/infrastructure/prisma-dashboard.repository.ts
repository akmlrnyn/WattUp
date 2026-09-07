import type {
  DashboardLeaderboardEntry,
  DashboardRepository,
  UserDashboardData,
} from "../domain/repositories/dashboard.repository";

import { prisma } from "@/shared/infrastructure/database/prisma";

const DAY_MS = 24 * 60 * 60 * 1_000;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1_000;

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

  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function toWibDayIndex(date: Date): number {
  return Math.floor(
    (date.getTime() + WIB_OFFSET_MS) / DAY_MS,
  );
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

  /*
   * Streak tetap hidup kalau charging terakhir dilakukan:
   * - hari ini, atau
   * - kemarin.
   */
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

function anonymizeName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "Pengguna WattUp";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastInitial = parts.at(-1)?.charAt(0);

  return lastInitial
    ? `${firstName} ${lastInitial.toUpperCase()}.`
    : firstName;
}

export class PrismaDashboardRepository
  implements DashboardRepository
{
  async getUserDashboard(
    userId: string,
    now = new Date(),
  ): Promise<UserDashboardData> {
    const sevenDaysAgo = new Date(
      now.getTime() - 7 * DAY_MS,
    );

    const [
      weeklyAggregate,
      totalAggregate,
      offPeakSessions,
      leaderboardAggregates,
    ] = await Promise.all([
      prisma.chargingSession.aggregate({
        where: {
          userId,

          startedAt: {
            gte: sevenDaysAgo,
            lte: now,
          },
        },

        _sum: {
          savingsAmount: true,
          discountedEnergyKwh: true,
        },
      }),

      prisma.chargingSession.aggregate({
        where: {
          userId,
        },

        _sum: {
          savingsAmount: true,
          discountedEnergyKwh: true,
        },

        _avg: {
          shiftScore: true,
        },
      }),

      prisma.chargingSession.findMany({
        where: {
          userId,

          discountedEnergyKwh: {
            gt: 0,
          },
        },

        select: {
          startedAt: true,
        },

        orderBy: {
          startedAt: "desc",
        },

        take: 365,
      }),

      prisma.chargingSession.groupBy({
        by: ["userId"],

        _sum: {
          discountedEnergyKwh: true,
          savingsAmount: true,
        },

        _avg: {
          shiftScore: true,
        },

        orderBy: {
          _sum: {
            discountedEnergyKwh: "desc",
          },
        },

        take: 100,
      }),
    ]);

    const aggregateByUserId = new Map<
      string,
      {
        shiftedEnergyKwh: number;
        savingsAmount: number;
        averageScore: number;
      }
    >();

    for (const aggregate of leaderboardAggregates) {
    const shiftedEnergyKwh = toNumber(
        aggregate._sum.discountedEnergyKwh,
    );

    /*
    * User lain hanya ditampilkan jika memiliki
    * discountedEnergyKwh lebih besar dari nol.
    *
    * Current user tetap ditampilkan walaupun nol,
    * supaya dia mengetahui posisinya.
    */
    if (
        shiftedEnergyKwh <= 0 &&
        aggregate.userId !== userId
    ) {
        continue;
    }

    aggregateByUserId.set(aggregate.userId, {
        shiftedEnergyKwh,

        savingsAmount: toNumber(
        aggregate._sum.savingsAmount,
        ),

        averageScore: toNumber(
        aggregate._avg.shiftScore,
        ),
    });
    }
    if (!aggregateByUserId.has(userId)) {
      aggregateByUserId.set(userId, {
        shiftedEnergyKwh: 0,
        savingsAmount: 0,
        averageScore: 0,
      });
    }

    const leaderboardUserIds = Array.from(
      aggregateByUserId.keys(),
    );

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: leaderboardUserIds,
        },
      },

      select: {
        id: true,
        name: true,
      },
    });

    const nameByUserId = new Map(
      users.map((user) => [
        user.id,
        anonymizeName(user.name),
      ]),
    );

    const sortedLeaderboard = Array.from(
      aggregateByUserId.entries(),
    )
      .map(([entryUserId, aggregate]) => ({
        userId: entryUserId,

        displayName:
          nameByUserId.get(entryUserId) ??
          "Pengguna WattUp",

        shiftedEnergyKwh: roundTo(
          aggregate.shiftedEnergyKwh,
          1,
        ),

        savingsAmount: roundTo(
          aggregate.savingsAmount,
          2,
        ),

        averageScore: roundTo(
          aggregate.averageScore,
          2,
        ),

        isCurrentUser: entryUserId === userId,
      }))
      .sort((left, right) => {
        if (
          right.shiftedEnergyKwh !==
          left.shiftedEnergyKwh
        ) {
          return (
            right.shiftedEnergyKwh -
            left.shiftedEnergyKwh
          );
        }

        if (
          right.savingsAmount !==
          left.savingsAmount
        ) {
          return (
            right.savingsAmount -
            left.savingsAmount
          );
        }

        return left.displayName.localeCompare(
          right.displayName,
          "id",
        );
      });

    const leaderboard: DashboardLeaderboardEntry[] =
      sortedLeaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return {
      weekSavings: roundTo(
        toNumber(
          weeklyAggregate._sum.savingsAmount,
        ),
        2,
      ),

      weekShiftedEnergyKwh: roundTo(
        toNumber(
          weeklyAggregate._sum.discountedEnergyKwh,
        ),
        1,
      ),

      totalSavings: roundTo(
        toNumber(totalAggregate._sum.savingsAmount),
        2,
      ),

      totalShiftedEnergyKwh: roundTo(
        toNumber(
          totalAggregate._sum.discountedEnergyKwh,
        ),
        1,
      ),

      averageScore: roundTo(
        toNumber(totalAggregate._avg.shiftScore),
        2,
      ),

      streakDays: calculateStreak(
        offPeakSessions.map(
          (session) => session.startedAt,
        ),
        now,
      ),

      leaderboard,
    };
  }
}