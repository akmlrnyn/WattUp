import type { SetupUserProfileInput, UserSetupRepository } from "../../domain/repositories/user-setup.repository";
import { isBillingType } from "@/modules/billing/domain/billing";
import { validateVehicle } from "@/modules/vehicles/domain/vehicle";
export class UserSetupValidationError extends Error {}
export class SetupUserProfileUseCase {
  constructor(private readonly repository: UserSetupRepository) {}
  async execute(userId: string, input: SetupUserProfileInput) {
    const { brand, model } = validateVehicle(input.vehicleBrand, input.vehicleModel);
    if (!isBillingType(input.billingType)) throw new UserSetupValidationError("Pilih jenis pembayaran listrik.");
    if (!Number.isFinite(input.electricityRate) || input.electricityRate < 500 || input.electricityRate > 10_000) {
      throw new UserSetupValidationError("Tarif listrik harus berada di antara Rp500–Rp10.000 per kWh.");
    }
    return this.repository.setup(userId, { ...input, vehicleBrand: brand, vehicleModel: model });
  }
}
