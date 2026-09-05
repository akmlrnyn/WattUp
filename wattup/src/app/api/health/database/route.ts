import { prisma } from "@/shared/infrastructure/database/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<Array<{ value: number }>>`
      SELECT 1 AS value
    `;

    return Response.json({
      success: result[0]?.value === 1,
      service: "WattUp API",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DATABASE_HEALTH_CHECK]", error);

    return Response.json(
      {
        success: false,
        service: "WattUp API",
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}