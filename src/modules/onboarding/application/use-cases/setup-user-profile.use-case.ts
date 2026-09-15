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
    const vehicleBrand =
      input.vehicleBrand.trim();

    const vehicleModel =
      input.vehicleModel.trim();

    const plateNumber =
      input.plateNumber
        ?.trim()
        .replace(/\s+/g, " ")
        .toUpperCase() ||
      undefined;

    if (
      !vehicleBrand ||
      vehicleBrand.length > 60
    ) {
      throw new UserSetupValidationError(
        "Merek kendaraan wajib diisi dan maksimal 60 karakter.",
      );
    }

    if (
      !vehicleModel ||
      vehicleModel.length > 60
    ) {
      throw new UserSetupValidationError(
        "Tipe atau model kendaraan wajib diisi dan maksimal 60 karakter.",
      );
    }

    if (
      plateNumber &&
      (plateNumber.length < 3 ||
        plateNumber.length > 20)
    ) {
      throw new UserSetupValidationError(
        "Nomor polisi harus terdiri dari 3–20 karakter.",
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
