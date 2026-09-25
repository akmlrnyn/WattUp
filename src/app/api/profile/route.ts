import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { lockUser } from "@/modules/vehicles/infrastructure/vehicle-service";
import { isBillingType } from "@/modules/billing/domain/billing";
import { UserSetupValidationError } from "@/modules/onboarding/application/use-cases/setup-user-profile.use-case";
import { readObject, userApiError, verifiedApiUser } from "@/shared/infrastructure/http/user-api";
export async function PATCH(request: Request) {
  const user = await verifiedApiUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const body = await readObject(request);
    const { billingType, electricityRate } = body;
    if (!isBillingType(billingType)) throw new UserSetupValidationError("Pilih jenis pembayaran listrik.");
    if (typeof electricityRate !== "number" || !Number.isFinite(electricityRate) || electricityRate < 500 || electricityRate > 10000) {
      throw new UserSetupValidationError("Tarif listrik harus Rp500–Rp10.000/kWh.");
    }
    await prisma.$transaction(async tx => {
      await lockUser(tx, user.id);
      await tx.wattUpProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, billingType, electricityRate }, update: { billingType, electricityRate } });
    });
    return NextResponse.json({ success: true });
  } catch (error) { return userApiError(error); }
}
