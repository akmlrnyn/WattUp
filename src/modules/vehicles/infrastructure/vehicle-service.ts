import { prisma } from "@/shared/infrastructure/database/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { generateVehicleLabel, validateVehicle, VehicleValidationError } from "../domain/vehicle";

// All profile, vehicle and charging writes lock the same user row. This prevents
// concurrent default changes, duplicate labels, and charging/archive races.
export async function lockUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT "id" FROM "user" WHERE "id" = ${userId} FOR UPDATE`;
}

export async function addVehicle(tx: Prisma.TransactionClient, userId: string, brand: string, model: string) {
  const vehicles = await tx.vehicle.findMany({ where: { userId }, select: { name: true, archivedAt: true } });
  return tx.vehicle.create({ data: {
    userId, brand, model,
    name: generateVehicleLabel(brand, model, vehicles.map(v => v.name)),
    isPrimary: !vehicles.some(v => v.archivedAt === null),
  } });
}

export async function mutateVehicle(userId: string, body: Record<string, unknown>) {
  return prisma.$transaction(async tx => {
    await lockUser(tx, userId);
    if (body.action === "add") {
      const { brand, model } = validateVehicle(body.brand, body.model);
      return addVehicle(tx, userId, brand, model);
    }
    if (typeof body.id !== "string") throw new VehicleValidationError("Kendaraan wajib dipilih.");
    const vehicle = await tx.vehicle.findFirst({ where: { id: body.id, userId, archivedAt: null } });
    if (!vehicle) throw new VehicleValidationError("Kendaraan tidak tersedia.");
    if (body.action === "edit") {
      const { brand, model } = validateVehicle(body.brand, body.model);
      const others = await tx.vehicle.findMany({ where: { userId, id: { not: vehicle.id } }, select: { name: true } });
      return tx.vehicle.update({ where: { id: vehicle.id }, data: {
        brand, model, name: generateVehicleLabel(brand, model, others.map(v => v.name)),
      } });
    }
    if (body.action === "default") {
      await tx.vehicle.updateMany({ where: { userId, isPrimary: true }, data: { isPrimary: false } });
      return tx.vehicle.update({ where: { id: vehicle.id }, data: { isPrimary: true } });
    }
    if (body.action === "archive") {
      const replacement = await tx.vehicle.findFirst({ where: { userId, archivedAt: null, id: { not: vehicle.id } }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] });
      const archived = await tx.vehicle.update({ where: { id: vehicle.id }, data: { archivedAt: new Date(), isPrimary: false } });
      if (vehicle.isPrimary && replacement) await tx.vehicle.update({ where: { id: replacement.id }, data: { isPrimary: true } });
      return archived;
    }
    throw new VehicleValidationError("Aksi kendaraan tidak valid.");
  });
}
