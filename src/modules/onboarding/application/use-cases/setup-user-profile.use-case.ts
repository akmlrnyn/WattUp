import type {
  SetupUserProfileInput,
  UserSetupRepository,
} from "../../domain/repositories/user-setup.repository";

export class UserSetupValidationError
  extends Error {
  constructor(message: string) {
    super(message);

    this.name =
      "UserSetupValidationError";
  }
}

export class SetupUserProfileUseCase {
  constructor(
    private readonly repository:
      UserSetupRepository,
  ) {}

  async execute(
    userId: string,
    input: SetupUserProfileInput,
  ) {
    const vehicleName =
      input.vehicleName.trim();

    const vehicleBrand =
      input.vehicleBrand?.trim() ||
      undefined;

    const vehicleModel =
      input.vehicleModel?.trim() ||
      undefined;

    const plateNumber =
      input.plateNumber
        ?.trim()
        .toUpperCase() ||
      undefined;

    if (
      !vehicleName ||
      vehicleName.length > 60
    ) {
      throw new UserSetupValidationError(
        "Nama kendaraan wajib diisi dan maksimal 60 karakter.",
      );
    }

    if (
      input.batteryCapacityKwh !==
        undefined &&
      (!Number.isFinite(
        input.batteryCapacityKwh,
      ) ||
        input.batteryCapacityKwh <
          5 ||
        input.batteryCapacityKwh >
          250)
    ) {
      throw new UserSetupValidationError(
        "Kapasitas baterai harus berada di antara 5–250 kWh.",
      );
    }

    if (
      !Number.isFinite(
        input.electricityRate,
      ) ||
      input.electricityRate < 500 ||
      input.electricityRate > 10_000
    ) {
      throw new UserSetupValidationError(
        "Tarif listrik harus berada di antara Rp500–Rp10.000 per kWh.",
      );
    }

    return this.repository.setup(
      userId,
      {
        vehicleName,
        vehicleBrand,
        vehicleModel,

        batteryCapacityKwh:
          input.batteryCapacityKwh,

        plateNumber,

        electricityRate:
          input.electricityRate,

        reminderEnabled:
          input.reminderEnabled,
      },
    );
  }
}