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

        const currentVehicle =
          await transaction.vehicle.findFirst(
            {
              where: {
                userId,
              },

              orderBy: [
                {
                  isPrimary: "desc",
                },
                {
                  createdAt: "asc",
                },
              ],
            },
          );

        await transaction.vehicle.updateMany(
          {
            where: {
              userId,
            },

            data: {
              isPrimary: false,
            },
          },
        );

        const vehicle =
          currentVehicle
            ? await transaction.vehicle.update(
                {
                  where: {
                    id: currentVehicle.id,
                  },

                  data: {
                    name:
                      input.vehicleName,

                    brand:
                      input.vehicleBrand ??
                      null,

                    model:
                      input.vehicleModel ??
                      null,

                    batteryCapacityKwh:
                      input.batteryCapacityKwh ??
                      null,

                    plateNumber:
                      input.plateNumber ??
                      null,

                    isPrimary: true,
                  },
                },
              )
            : await transaction.vehicle.create(
                {
                  data: {
                    userId,

                    name:
                      input.vehicleName,

                    brand:
                      input.vehicleBrand ??
                      null,

                    model:
                      input.vehicleModel ??
                      null,

                    batteryCapacityKwh:
                      input.batteryCapacityKwh ??
                      null,

                    plateNumber:
                      input.plateNumber ??
                      null,

                    isPrimary: true,
                  },
                },
              );

        return {
          electricityRate: Number(
            profile.electricityRate,
          ),

          discountPercent: Number(
            profile.discountPercent,
          ),

          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
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

          vehicles: {
            select: {
              id: true,
              name: true,
            },

            orderBy: [
              {
                isPrimary: "desc",
              },
              {
                createdAt: "asc",
              },
            ],

            take: 1,
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
        user?.vehicles[0]?.id,

      vehicleName:
        user?.vehicles[0]?.name,
    };
  }
}