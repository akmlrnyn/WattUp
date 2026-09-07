-- CreateEnum
CREATE TYPE "ChargingInputMode" AS ENUM ('KWH', 'TOKEN');

-- CreateEnum
CREATE TYPE "ChargingSource" AS ENUM ('MANUAL', 'IMPORTED');

-- CreateTable
CREATE TABLE "wattup_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "electricityRate" DECIMAL(12,2) NOT NULL DEFAULT 1699,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 30,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wattup_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "batteryCapacityKwh" DECIMAL(8,2),
    "plateNumber" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "inputMode" "ChargingInputMode" NOT NULL,
    "source" "ChargingSource" NOT NULL DEFAULT 'MANUAL',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "energyKwh" DECIMAL(10,3) NOT NULL,
    "tokenAmount" DECIMAL(14,2),
    "discountedEnergyKwh" DECIMAL(10,3) NOT NULL,
    "ratePerKwh" DECIMAL(12,2) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL,
    "baselineCost" DECIMAL(14,2) NOT NULL,
    "actualCost" DECIMAL(14,2) NOT NULL,
    "savingsAmount" DECIMAL(14,2) NOT NULL,
    "shiftScore" DECIMAL(5,4) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wattup_profiles_userId_key" ON "wattup_profiles"("userId");

-- CreateIndex
CREATE INDEX "vehicles_userId_idx" ON "vehicles"("userId");

-- CreateIndex
CREATE INDEX "charging_sessions_userId_idx" ON "charging_sessions"("userId");

-- CreateIndex
CREATE INDEX "charging_sessions_userId_startedAt_idx" ON "charging_sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "charging_sessions_vehicleId_idx" ON "charging_sessions"("vehicleId");

-- CreateIndex
CREATE INDEX "charging_sessions_startedAt_idx" ON "charging_sessions"("startedAt");

-- AddForeignKey
ALTER TABLE "wattup_profiles" ADD CONSTRAINT "wattup_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
