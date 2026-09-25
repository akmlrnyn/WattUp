import { NextResponse } from "next/server";
import { dependencies } from "@/server/dependencies";
import { isBillingType } from "@/modules/billing/domain/billing";
import { UserSetupValidationError } from "@/modules/onboarding/application/use-cases/setup-user-profile.use-case";
import { readObject, userApiError, verifiedApiUser } from "@/shared/infrastructure/http/user-api";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const user = await verifiedApiUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const body = await readObject(request);
    if (!isBillingType(body.billingType)) throw new UserSetupValidationError("Pilih jenis pembayaran listrik.");
    const data = await dependencies.onboarding.setupUserProfile.execute(user.id, {
      vehicleBrand: typeof body.vehicleBrand === "string" ? body.vehicleBrand : "",
      vehicleModel: typeof body.vehicleModel === "string" ? body.vehicleModel : "",
      billingType: body.billingType,
      electricityRate: typeof body.electricityRate === "number" ? body.electricityRate : NaN,
      reminderEnabled: body.reminderEnabled !== false,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) { return userApiError(error); }
}
