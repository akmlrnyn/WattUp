import type {
  SetupUserProfileInput,
  UserChargingSetup,
  UserSetupRepository,
} from "../domain/repositories/user-setup.repository";

import { prisma } from "@/shared/infrastructure/database/prisma";

const DEFAULT_ELECTRICITY_RATE =
  1699;

const DEFAULT_DISCOUNT_PERCENT =
  30;

export class PrismaUserSetupRepository
  implements UserSetupRepository
{
  async setup(
    userId: string,
    input: SetupUserProfileInput,
  ): Promise<UserChargingSetup> {
    return prisma.$transaction(
      async (transaction) => {
        const profile =
          await transaction.wattUpProfile.upsert(
            {
              where: {
                userId,
              },

              create: {
                userId,

                timezone:
                  "Asia/Jakarta",

                electricityRate:
                  input.electricityRate,

                discountPercent:
                  DEFAULT_DISCOUNT_PERCENT,

                reminderEnabled:
                  input.reminderEnabled,
              },

              update: {
                electricityRate:
                  input.electricityRate,

                reminderEnabled:
                  input.reminderEnabled,
              },
            },
          );

        const vehicleLabel = `${input.vehicleBrand} ${input.vehicleModel}`;

        const vehicle =
          await transaction.vehicle.upsert({
            where: {
              userId,
            },

            create: {
              userId,
              name: vehicleLabel,
              brand: input.vehicleBrand,
              model: input.vehicleModel,
              batteryCapacityKwh:
                input.batteryCapacityKwh ?? null,
              plateNumber:
                input.plateNumber ?? null,
              isPrimary: true,
            },

            update: {
              name: vehicleLabel,
              brand: input.vehicleBrand,
              model: input.vehicleModel,
              batteryCapacityKwh:
                input.batteryCapacityKwh ?? null,
              plateNumber:
                input.plateNumber ?? null,
              isPrimary: true,
            },
          });

        return {
          electricityRate: Number(
            profile.electricityRate,
          ),

          discountPercent: Number(
            profile.discountPercent,
          ),

          vehicleId: vehicle.id,
          vehicleLabel: vehicle.name,
        };
      },
    );
  }

  async getChargingSetup(
    userId: string,
  ): Promise<UserChargingSetup> {
    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          wattUpProfile: {
            select: {
              electricityRate: true,
              discountPercent: true,
            },
          },

          vehicle: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

    return {
      electricityRate: Number(
        user?.wattUpProfile
          ?.electricityRate ??
          DEFAULT_ELECTRICITY_RATE,
      ),

      discountPercent: Number(
        user?.wattUpProfile
          ?.discountPercent ??
          DEFAULT_DISCOUNT_PERCENT,
      ),

      vehicleId:
        user?.vehicle?.id,

      vehicleLabel:
        user?.vehicle?.name,
    };
  }
}
