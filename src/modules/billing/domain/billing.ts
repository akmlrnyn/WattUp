import { ChargingCalculationError } from "../../charging/domain/errors/charging-calculation.error";
export type BillingType = "PREPAID" | "POSTPAID";
export const billingLabels = { PREPAID: "Token / Prabayar", POSTPAID: "Pascabayar" } as const;
export function isBillingType(value: unknown): value is BillingType {
  return value === "PREPAID" || value === "POSTPAID";
}
export function meterEnergy(billingType: BillingType, before: number, after: number) {
  if (![before, after].every(value => Number.isFinite(value) && value >= 0 && value <= 99_999_999_999)) {
    throw new ChargingCalculationError("Angka meter harus berupa kWh yang valid dan tidak negatif.");
  }
  const energy = Math.round((billingType === "PREPAID" ? before - after : after - before) * 1000) / 1000;
  if (energy <= 0 || energy > 500) {
    throw new ChargingCalculationError(billingType === "PREPAID"
      ? "Saldo sesudah harus lebih kecil dari saldo sebelum, dengan pemakaian maksimal 500 kWh."
      : "Meter sesudah harus lebih besar dari meter sebelum, dengan pemakaian maksimal 500 kWh.");
  }
  return energy;
}
