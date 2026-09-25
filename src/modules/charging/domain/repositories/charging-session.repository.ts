import type { ChargingInputMode } from "../services/calculate-charging-session";

export interface CreateChargingSessionRecord {
  userId: string;
  vehicleId: string;
  inputMode: "KWH" | "METER";
  startedAt: Date;
  endedAt: Date;
  energyKwh?: number;
  meterBefore?: number;
  meterAfter?: number;
  notes?: string;
}

export interface ChargingSessionRecord {
  id: string;
  userId: string;

  vehicleId: string | null;
  vehicleLabel: string | null;
  billingType: "PREPAID" | "POSTPAID" | null;
  inputMode: ChargingInputMode | "METER";

  startedAt: Date;
  endedAt: Date;

  durationMinutes: number;

  energyKwh: number;
  tokenAmount: number | null;
  discountedEnergyKwh: number;

  ratePerKwh: number;
  discountPercent: number;

  baselineCost: number;
  actualCost: number;
  savingsAmount: number;

  shiftScore: number;

  notes: string | null;
  createdAt: Date;
}

export interface ChargingSessionRepository {
  create(
    data: CreateChargingSessionRecord,
  ): Promise<ChargingSessionRecord>;

  findCurrentWeekByUserId(userId: string): Promise<ChargingSessionRecord[]>;

  findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<ChargingSessionRecord[]>;
}