import type { ChargingInputMode } from "../services/calculate-charging-session";

export interface CreateChargingSessionRecord {
  userId: string;

  inputMode: ChargingInputMode;

  startedAt: Date;
  endedAt: Date;

  durationMinutes: number;

  energyKwh: number;
  tokenAmount?: number;
  discountedEnergyKwh: number;

  ratePerKwh: number;
  discountPercent: number;

  baselineCost: number;
  actualCost: number;
  savingsAmount: number;

  shiftScore: number;

  notes?: string;
}

export interface ChargingSessionRecord {
  id: string;
  userId: string;

  inputMode: ChargingInputMode;

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

  findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<ChargingSessionRecord[]>;
}