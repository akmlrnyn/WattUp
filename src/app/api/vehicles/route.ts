import { NextResponse } from "next/server";
import { mutateVehicle } from "@/modules/vehicles/infrastructure/vehicle-service";
import { readObject, userApiError, verifiedApiUser } from "@/shared/infrastructure/http/user-api";
export async function POST(request: Request) {
  const user = await verifiedApiUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const vehicle = await mutateVehicle(user.id, await readObject(request));
    return NextResponse.json({ success: true, data: { id: vehicle.id } });
  } catch (error) { return userApiError(error); }
}
