-- WattUp memakai satu kendaraan aktif untuk setiap pengguna.
-- Migration akan berhenti jika data lama masih memiliki lebih dari satu
-- kendaraan untuk user yang sama; rapikan duplikat tersebut sebelum deploy.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "vehicles"
    GROUP BY "userId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'One vehicle migration blocked: a user still has multiple vehicle rows.';
  END IF;
END $$;

DROP INDEX IF EXISTS "vehicles_userId_idx";

CREATE UNIQUE INDEX "vehicles_userId_key"
ON "vehicles"("userId");

-- Samakan format nomor polisi sebelum menjadikannya unique.
UPDATE "vehicles"
SET "plateNumber" = NULL
WHERE "plateNumber" IS NOT NULL
  AND BTRIM("plateNumber") = '';

UPDATE "vehicles"
SET "plateNumber" = UPPER(
  REGEXP_REPLACE(
    BTRIM("plateNumber"),
    '\s+',
    ' ',
    'g'
  )
)
WHERE "plateNumber" IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "vehicles"
    WHERE "plateNumber" IS NOT NULL
    GROUP BY "plateNumber"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Unique plate migration blocked: duplicate plate numbers still exist.';
  END IF;
END $$;

CREATE UNIQUE INDEX "vehicles_plateNumber_key"
ON "vehicles"("plateNumber");

-- Hubungkan sesi lama yang belum memiliki vehicleId ke kendaraan user.
UPDATE "charging_sessions" AS session
SET "vehicleId" = vehicle."id"
FROM "vehicles" AS vehicle
WHERE session."userId" = vehicle."userId"
  AND session."vehicleId" IS DISTINCT FROM vehicle."id";
