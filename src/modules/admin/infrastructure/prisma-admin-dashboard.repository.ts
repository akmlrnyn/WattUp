import type {
  AdminDashboardData,
  AdminDashboardRepository,
  AdminParticipant,
} from "../domain/repositories/admin-dashboard.repository";

import { isAdmin } from "@/modules/auth/domain/roles";
import { prisma } from "@/shared/infrastructure/database/prisma";

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

export class PrismaAdminDashboardRepository
  implements AdminDashboardRepository
{
  async getDashboard(): Promise<AdminDashboardData> {
    const [users, sessionAggregates] =
      await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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
      ]);

    /*
     * Akun admin tidak dihitung sebagai peserta pilot.
     */
    const participantUsers = users.filter(
      (user) => !isAdmin(user.role),
    );

    const aggregateByUserId = new Map(
      sessionAggregates.map((aggregate) => [
        aggregate.userId,
        aggregate,
      ]),
    );

    const participants: AdminParticipant[] =
      participantUsers.map((user) => {
        const aggregate =
          aggregateByUserId.get(user.id);

        const totalEnergyKwh = toNumber(
          aggregate?._sum.energyKwh,
        );

        const shiftedEnergyKwh = toNumber(
          aggregate?._sum.discountedEnergyKwh,
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

          sessionCount:
            aggregate?._count._all ?? 0,

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

          offPeakRate: roundTo(offPeakRate, 1),

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
        right.shiftedEnergyKwh !==
        left.shiftedEnergyKwh
      ) {
        return (
          right.shiftedEnergyKwh -
          left.shiftedEnergyKwh
        );
      }

      return right.sessionCount - left.sessionCount;
    });

    const activeParticipants =
      participants.filter(
        (participant) =>
          participant.sessionCount > 0,
      );

    const totalSessions = participants.reduce(
      (total, participant) =>
        total + participant.sessionCount,
      0,
    );

    const totalEnergyKwh = participants.reduce(
      (total, participant) =>
        total + participant.totalEnergyKwh,
      0,
    );

    const totalShiftedEnergyKwh =
      participants.reduce(
        (total, participant) =>
          total +
          participant.shiftedEnergyKwh,
        0,
      );

    const totalSavings = participants.reduce(
      (total, participant) =>
        total + participant.savingsAmount,
      0,
    );

    const averageOffPeakRate =
      totalEnergyKwh > 0
        ? (totalShiftedEnergyKwh /
            totalEnergyKwh) *
          100
        : 0;

    return {
      registeredUsers: participants.length,

      activeUsers: activeParticipants.length,

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

      participants,
    };
  }
}