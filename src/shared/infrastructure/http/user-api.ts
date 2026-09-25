import { NextResponse } from "next/server";
import { auth } from "@/modules/auth/infrastructure/auth";
import { VehicleValidationError } from "@/modules/vehicles/domain/vehicle";
import { UserSetupValidationError } from "@/modules/onboarding/application/use-cases/setup-user-profile.use-case";
export async function verifiedApiUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  if (!session.user.emailVerified) return NextResponse.json({ success: false, message: "Verifikasi email terlebih dahulu." }, { status: 403 });
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([new URL(request.url).origin]);
  // Reverse proxies may expose an internal request URL; honor the configured public origin.
  if (process.env.BETTER_AUTH_URL) {
    try { allowedOrigins.add(new URL(process.env.BETTER_AUTH_URL).origin); } catch { /* Auth validates configuration. */ }
  }
  if (origin && !allowedOrigins.has(origin)) return NextResponse.json({ success: false, message: "Origin tidak diizinkan." }, { status: 403 });
  return session.user;
}
export async function readObject(request: Request): Promise<Record<string, unknown>> {
  const body: unknown = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new UserSetupValidationError("Data tidak valid.");
  return body as Record<string, unknown>;
}
export function userApiError(error: unknown) {
  if (error instanceof VehicleValidationError || error instanceof UserSetupValidationError || error instanceof SyntaxError) {
    return NextResponse.json({ success: false, message: error instanceof SyntaxError ? "JSON tidak valid." : error.message }, { status: 400 });
  }
  // Do not log Prisma errors containing submitted data or connection details.
  return NextResponse.json({ success: false, message: "Gagal menyimpan. Silakan coba lagi." }, { status: 500 });
}
