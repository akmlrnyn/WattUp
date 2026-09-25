BEGIN;
-- Expand only: legacy TOKEN sessions and optional vehicle fields remain intact.
ALTER TYPE "ChargingInputMode" ADD VALUE 'METER';
CREATE TYPE "ElectricityBillingType" AS ENUM ('PREPAID', 'POSTPAID');
ALTER TABLE "wattup_profiles" ADD COLUMN "billingType" "ElectricityBillingType";
ALTER TABLE "charging_sessions"
  ADD COLUMN "billingType" "ElectricityBillingType",
  ADD COLUMN "meterBefore" DECIMAL(14,3),
  ADD COLUMN "meterAfter" DECIMAL(14,3);
ALTER TABLE "vehicles" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- The preceding migration guarantees at most one original vehicle per user.
UPDATE "vehicles" SET "isPrimary" = true;
UPDATE "charging_sessions" s SET "vehicleId" = v."id"
FROM "vehicles" v WHERE s."userId" = v."userId" AND s."vehicleId" IS NULL;
DROP INDEX "vehicles_userId_key";
CREATE INDEX "vehicles_userId_archivedAt_idx" ON "vehicles" ("userId", "archivedAt");
-- Prisma does not express this partial index: retain it in future migrations.
CREATE UNIQUE INDEX "vehicles_one_active_primary" ON "vehicles" ("userId")
WHERE "isPrimary" = true AND "archivedAt" IS NULL;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_archived_not_primary"
CHECK ("archivedAt" IS NULL OR "isPrimary" = false);
-- Historical billing type cannot be reliably inferred; do not rewrite costs or guess it.

COMMIT;
