export interface SetupUserProfileInput {
  vehicleBrand: string;
  vehicleModel: string;

  batteryCapacityKwh?: number;
  plateNumber?: string;

  electricityRate: number;
  reminderEnabled: boolean;
}

export interface UserChargingSetup {
  electricityRate: number;
  discountPercent: number;

  vehicleId?: string;
  vehicleLabel?: string;
}

export interface UserSetupRepository {
  setup(
    userId: string,
    input: SetupUserProfileInput,
  ): Promise<UserChargingSetup>;

  getChargingSetup(
    userId: string,
  ): Promise<UserChargingSetup>;
}
