import type { BillingType } from "@/modules/billing/domain/billing";
export interface SetupUserProfileInput {
  vehicleBrand: string;
  vehicleModel: string;
  billingType: BillingType;
  electricityRate: number;
  reminderEnabled: boolean;
}
export interface UserChargingSetup {
  electricityRate: number;
  discountPercent: number;
  billingType: BillingType | null;
  hasVehicles: boolean;
  vehicles: { id: string; name: string; isPrimary: boolean }[];
  vehicleId?: string;
  vehicleLabel?: string;
}
export interface UserSetupRepository {
  setup(userId: string, input: SetupUserProfileInput): Promise<UserChargingSetup>;
  getChargingSetup(userId: string): Promise<UserChargingSetup>;
}
