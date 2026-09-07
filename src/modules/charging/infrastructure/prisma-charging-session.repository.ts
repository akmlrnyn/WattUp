import type {
  ChargingSessionRecord,
  ChargingSessionRepository,
  CreateChargingSessionRecord,
} from "../domain/repositories/charging-session.repository";

import { prisma } from "@/shared/infrastructure/database/prisma";

interface PrismaChargingSession {
  id: string;
  userId: string;

  inputMode: string;

  startedAt: Date;
  endedAt: Date;

  durationMinutes: number;

  energyKwh: unknown;
  tokenAmount: unknown;
  discountedEnergyKwh: unknown;

  ratePerKwh: unknown;
  discountPercent: unknown;

  baselineCost: unknown;
  actualCost: unknown;
  savingsAmount: unknown;

  shiftScore: unknown;

  notes: string | null;
  createdAt: Date;
}

function mapToDomain(
  record: PrismaChargingSession,
): ChargingSessionRecord {
  return {
    id: record.id,
    userId: record.userId,

    inputMode:
      record.inputMode === "TOKEN" ? "TOKEN" : "KWH",

    startedAt: record.startedAt,
    endedAt: record.endedAt,

    durationMinutes: record.durationMinutes,

    energyKwh: Number(record.energyKwh),

    tokenAmount:
      record.tokenAmount === null
        ? null
        : Number(record.tokenAmount),

    discountedEnergyKwh: Number(
      record.discountedEnergyKwh,
    ),

    ratePerKwh: Number(record.ratePerKwh),
    discountPercent: Number(record.discountPercent),

    baselineCost: Number(record.baselineCost),
    actualCost: Number(record.actualCost),
    savingsAmount: Number(record.savingsAmount),

    shiftScore: Number(record.shiftScore),

    notes: record.notes,
    createdAt: record.createdAt,
  };
}

export class PrismaChargingSessionRepository
  implements ChargingSessionRepository
{
  async create(
    data: CreateChargingSessionRecord,
  ): Promise<ChargingSessionRecord> {
    const session = await prisma.chargingSession.create({
      data: {
        userId: data.userId,

        inputMode: data.inputMode,
        source: "MANUAL",

        startedAt: data.startedAt,
        endedAt: data.endedAt,

        durationMinutes: data.durationMinutes,

        energyKwh: data.energyKwh,
        tokenAmount: data.tokenAmount ?? null,
        discountedEnergyKwh: data.discountedEnergyKwh,

        ratePerKwh: data.ratePerKwh,
        discountPercent: data.discountPercent,

        baselineCost: data.baselineCost,
        actualCost: data.actualCost,
        savingsAmount: data.savingsAmount,

        shiftScore: data.shiftScore,

        notes: data.notes ?? null,
      },
    });

    return mapToDomain(session);
  }

  async findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<ChargingSessionRecord[]> {
    const sessions =
      await prisma.chargingSession.findMany({
        where: {
          userId,
        },

        orderBy: {
          startedAt: "desc",
        },

        take: limit,
      });

    return sessions.map(mapToDomain);
  }
}