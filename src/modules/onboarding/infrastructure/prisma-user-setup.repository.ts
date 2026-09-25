import type { SetupUserProfileInput, UserChargingSetup, UserSetupRepository } from "../domain/repositories/user-setup.repository";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { addVehicle, lockUser } from "@/modules/vehicles/infrastructure/vehicle-service";
import { UserSetupValidationError } from "../application/use-cases/setup-user-profile.use-case";
export class PrismaUserSetupRepository implements UserSetupRepository {
  async setup(userId: string, input: SetupUserProfileInput): Promise<UserChargingSetup> {
    await prisma.$transaction(async tx => {
      await lockUser(tx, userId);
      if (await tx.vehicle.count({ where: { userId } })) {
        throw new UserSetupValidationError("Setup kendaraan sudah selesai. Gunakan Kendaraan Saya untuk mengubahnya.");
      }
      await tx.wattUpProfile.upsert({ where: { userId }, create: {
        userId, electricityRate: input.electricityRate, billingType: input.billingType,
        reminderEnabled: input.reminderEnabled,
      }, update: {
        electricityRate: input.electricityRate, billingType: input.billingType, reminderEnabled: input.reminderEnabled,
      } });
      const vehicle = await addVehicle(tx, userId, input.vehicleBrand, input.vehicleModel);
      await tx.chargingSession.updateMany({ where: { userId, vehicleId: null }, data: { vehicleId: vehicle.id } });
    });
    return this.getChargingSetup(userId);
  }
  async getChargingSetup(userId: string): Promise<UserChargingSetup> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: {
      wattUpProfile: true,
      vehicles: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }, { id: "asc" }], select: { id: true, name: true, isPrimary: true, archivedAt: true } },
    } });
    const vehicles = (user?.vehicles ?? []).filter(v => !v.archivedAt).map(({ id, name, isPrimary }) => ({ id, name, isPrimary }));
    return {
      electricityRate: Number(user?.wattUpProfile?.electricityRate ?? 1699),
      discountPercent: Number(user?.wattUpProfile?.discountPercent ?? 30),
      billingType: user?.wattUpProfile?.billingType ?? null,
      hasVehicles: Boolean(user?.vehicles.length), vehicles,
      vehicleId: vehicles[0]?.id, vehicleLabel: vehicles[0]?.name,
    };
  }
}
