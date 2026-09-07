import type { ChargingSessionRepository } from "../../domain/repositories/charging-session.repository";
import {
  calculateChargingSession,
  type ChargingInputMode,
} from "../../domain/services/calculate-charging-session";

export interface CreateChargingSessionInput {
  userId: string;

  inputMode: ChargingInputMode;

  startedAt: Date;
  endedAt: Date;

  energyKwh?: number;
  tokenAmount?: number;

  ratePerKwh: number;
  notes?: string;
}

export class CreateChargingSessionUseCase {
  constructor(
    private readonly repository: ChargingSessionRepository,
  ) {}

  async execute(input: CreateChargingSessionInput) {
    /*
     * Diskon dan timezone ditentukan backend.
     * Jangan menerima discountPercent dari browser.
     */
    const calculation = calculateChargingSession({
      inputMode: input.inputMode,

      startedAt: input.startedAt,
      endedAt: input.endedAt,

      energyKwh: input.energyKwh,
      tokenAmount: input.tokenAmount,

      ratePerKwh: input.ratePerKwh,

      discountPercent: 30,
      timezoneOffsetMinutes: 420,
    });

    return this.repository.create({
      userId: input.userId,

      inputMode: calculation.inputMode,

      startedAt: calculation.startedAt,
      endedAt: calculation.endedAt,

      durationMinutes: calculation.durationMinutes,

      energyKwh: calculation.energyKwh,
      tokenAmount: calculation.tokenAmount,
      discountedEnergyKwh:
        calculation.discountedEnergyKwh,

      ratePerKwh: calculation.ratePerKwh,
      discountPercent:
        calculation.discountPercent,

      baselineCost: calculation.baselineCost,
      actualCost: calculation.actualCost,
      savingsAmount: calculation.savingsAmount,

      shiftScore: calculation.shiftScore,

      notes: input.notes,
    });
  }
}