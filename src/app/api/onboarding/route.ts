import { NextResponse } from "next/server";

import { auth } from "@/modules/auth/infrastructure/auth";
import { UserSetupValidationError } from "@/modules/onboarding/application/use-cases/setup-user-profile.use-case";
import { dependencies } from "@/server/dependencies";

export const runtime = "nodejs";

function parseOptionalNumber(
  value: unknown,
): number | undefined {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : Number.NaN;
}

function getString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
    : "";
}

export async function POST(
  request: Request,
) {
  const session =
    await auth.api.getSession({
      headers: request.headers,
    });

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const rawBody: unknown =
      await request.json();

    if (
      typeof rawBody !== "object" ||
      rawBody === null ||
      Array.isArray(rawBody)
    ) {
      throw new UserSetupValidationError(
        "Data setup tidak valid.",
      );
    }

    const body =
      rawBody as Record<
        string,
        unknown
      >;

    const setup =
      await dependencies.onboarding
        .setupUserProfile.execute(
          session.user.id,
          {
            vehicleName: getString(
              body.vehicleName,
            ),

            vehicleBrand: getString(
              body.vehicleBrand,
            ),

            vehicleModel: getString(
              body.vehicleModel,
            ),

            batteryCapacityKwh:
              parseOptionalNumber(
                body.batteryCapacityKwh,
              ),

            plateNumber: getString(
              body.plateNumber,
            ),

            electricityRate: Number(
              body.electricityRate,
            ),

            reminderEnabled:
              body.reminderEnabled !==
              false,
          },
        );

    return NextResponse.json({
      success: true,
      data: setup,
    });
  } catch (error) {
    if (
      error instanceof
        UserSetupValidationError ||
      error instanceof SyntaxError
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            error instanceof
            UserSetupValidationError
              ? error.message
              : "Request body bukan JSON yang valid.",
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "SETUP_USER_PROFILE_ERROR",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Setup akun gagal disimpan.",
      },
      {
        status: 500,
      },
    );
  }
}