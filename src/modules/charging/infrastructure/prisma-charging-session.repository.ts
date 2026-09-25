import { calculateChargingSession } from "../domain/services/calculate-charging-session";
import { ChargingCalculationError } from "../domain/errors/charging-calculation.error";
import { meterEnergy } from "@/modules/billing/domain/billing";
import { lockUser } from "@/modules/vehicles/infrastructure/vehicle-service";
import { getCurrentWibWeekRange } from "@/shared/domain/wib-date";
import type {
  ChargingSessionRecord,
  ChargingSessionRepository,
  CreateChargingSessionRecord,
} from "../domain/repositories/charging-session.repository";

import { prisma } from "@/shared/infrastructure/database/prisma";

interface PrismaChargingSession {
  id: string;
  userId: string;

  vehicleId: string | null;
  vehicle?: { name: string } | null;
  billingType: "PREPAID" | "POSTPAID" | null;
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

    vehicleId: record.vehicleId,
    vehicleLabel: record.vehicle?.name ?? null,
    billingType: record.billingType,
    inputMode: record.inputMode === "METER" ? "METER" : record.inputMode === "TOKEN" ? "TOKEN" : "KWH",

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
    return prisma.$transaction(async tx => {
      await lockUser(tx, data.userId);
      const vehicle = await tx.vehicle.findFirst({ where: { id: data.vehicleId, userId: data.userId, archivedAt: null } });
      if (!vehicle) throw new ChargingCalculationError("Pilih kendaraan aktif milik akunmu.");
      const profile = await tx.wattUpProfile.findUnique({ where: { userId: data.userId } });
      if (!profile?.billingType) throw new ChargingCalculationError("Lengkapi jenis pembayaran listrik terlebih dahulu.");
      if (data.inputMode !== "KWH" && data.inputMode !== "METER") throw new ChargingCalculationError("Metode input tidak valid.");
      if (data.notes && data.notes.length > 2000) throw new ChargingCalculationError("Catatan maksimal 2000 karakter.");
      const energyKwh = data.inputMode === "METER"
        ? meterEnergy(profile.billingType, data.meterBefore ?? NaN, data.meterAfter ?? NaN)
        : data.energyKwh;
      const result = calculateChargingSession({
        inputMode: "KWH", energyKwh, startedAt: data.startedAt, endedAt: data.endedAt,
        ratePerKwh: Number(profile.electricityRate), discountPercent: Number(profile.discountPercent), timezoneOffsetMinutes: 420,
      });
      const session = await tx.chargingSession.create({ data: {
        userId: data.userId, vehicleId: vehicle.id, inputMode: data.inputMode,
        billingType: profile.billingType,
        meterBefore: data.inputMode === "METER" ? data.meterBefore : null,
        meterAfter: data.inputMode === "METER" ? data.meterAfter : null,
        startedAt: result.startedAt, endedAt: result.endedAt, durationMinutes: result.durationMinutes,
        energyKwh: result.energyKwh, discountedEnergyKwh: result.discountedEnergyKwh,
        ratePerKwh: result.ratePerKwh, discountPercent: result.discountPercent,
        baselineCost: result.baselineCost, actualCost: result.actualCost,
        savingsAmount: result.savingsAmount, shiftScore: result.shiftScore, notes: data.notes,
      }, include: { vehicle: { select: { name: true } } } });
      return mapToDomain(session);
    });
  }

  async findCurrentWeekByUserId(userId: string): Promise<ChargingSessionRecord[]> {
    const now = new Date();
    const week = getCurrentWibWeekRange(now);
    const sessions = await prisma.chargingSession.findMany({
      where: { userId, startedAt: { gte: week.start, lt: week.endExclusive, lte: now } },
      include: { vehicle: { select: { name: true } } }, orderBy: { startedAt: "desc" },
    });
    return sessions.map(mapToDomain);
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
        include: { vehicle: { select: { name: true } } },
      });

    return sessions.map(mapToDomain);
  }
}
