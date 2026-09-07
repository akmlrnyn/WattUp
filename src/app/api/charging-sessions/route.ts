import { NextResponse } from "next/server";

import { ChargingCalculationError } from "@/modules/charging/domain/errors/charging-calculation.error";
import type { ChargingInputMode } from "@/modules/charging/domain/services/calculate-charging-session";
import { auth } from "@/modules/auth/infrastructure/auth";
import { dependencies } from "@/server/dependencies";

export const runtime = "nodejs";

interface CreateSessionBody {
  inputMode: ChargingInputMode;

  startedAt: string;
  endedAt: string;

  energyKwh?: number;
  tokenAmount?: number;

  ratePerKwh: number;
  notes?: string;
}

function badRequest(message: string): never {
  throw new ChargingCalculationError(message);
}

function parseNumber(
  value: unknown,
  fieldName: string,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    badRequest(`${fieldName} harus berupa angka.`);
  }

  return parsed;
}

function parseOptionalNumber(
  value: unknown,
  fieldName: string,
): number | undefined {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  return parseNumber(value, fieldName);
}

function parseBody(value: unknown): CreateSessionBody {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    badRequest("Request body tidak valid.");
  }

  const body = value as Record<string, unknown>;

  if (
    body.inputMode !== "KWH" &&
    body.inputMode !== "TOKEN"
  ) {
    badRequest("inputMode harus KWH atau TOKEN.");
  }

  if (typeof body.startedAt !== "string") {
    badRequest("startedAt wajib diisi.");
  }

  if (typeof body.endedAt !== "string") {
    badRequest("endedAt wajib diisi.");
  }

  const notes =
    typeof body.notes === "string"
      ? body.notes.trim()
      : undefined;

  return {
    inputMode: body.inputMode,

    startedAt: body.startedAt,
    endedAt: body.endedAt,

    energyKwh: parseOptionalNumber(
      body.energyKwh,
      "energyKwh",
    ),

    tokenAmount: parseOptionalNumber(
      body.tokenAmount,
      "tokenAmount",
    ),

    ratePerKwh: parseNumber(
      body.ratePerKwh,
      "ratePerKwh",
    ),

    notes: notes || undefined,
  };
}

function serializeSession(
  session: Awaited<
    ReturnType<
      typeof dependencies.charging.createSession.execute
    >
  >,
) {
  return {
    ...session,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}

async function getAuthenticatedUser(
  request: Request,
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user ?? null;
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
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

  const url = new URL(request.url);
  const requestedLimit = Number(
    url.searchParams.get("limit") ?? 10,
  );

  const sessions =
    await dependencies.charging.listRecentSessions.execute(
      user.id,
      Number.isFinite(requestedLimit)
        ? requestedLimit
        : 10,
    );

  return NextResponse.json({
    success: true,

    data: sessions.map((session) => ({
      ...session,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
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
    const rawBody: unknown = await request.json();
    const body = parseBody(rawBody);

    const session =
      await dependencies.charging.createSession.execute({
        userId: user.id,

        inputMode: body.inputMode,

        startedAt: new Date(body.startedAt),
        endedAt: new Date(body.endedAt),

        energyKwh: body.energyKwh,
        tokenAmount: body.tokenAmount,

        ratePerKwh: body.ratePerKwh,
        notes: body.notes,
      });

    return NextResponse.json(
      {
        success: true,
        data: serializeSession(session),
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof ChargingCalculationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body bukan JSON yang valid.",
        },
        {
          status: 400,
        },
      );
    }

    console.error("CREATE_CHARGING_SESSION_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      },
    );
  }
}