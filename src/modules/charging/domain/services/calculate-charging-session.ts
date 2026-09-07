import { ChargingCalculationError } from "../errors/charging-calculation.error";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const DEFAULT_TIMEZONE_OFFSET_MINUTES = 7 * 60;
const MAX_SESSION_DURATION_HOURS = 48;
const SCORE_CALCULATION_STEP_MS = MINUTE_MS;

export type ChargingInputMode = "KWH" | "TOKEN";

export interface CalculateChargingSessionInput {
  inputMode: ChargingInputMode;

  startedAt: Date;
  endedAt: Date;

  energyKwh?: number;
  tokenAmount?: number;

  ratePerKwh: number;
  discountPercent: number;

  /**
   * Offset dari UTC dalam menit.
   * WIB = UTC+7 = 420 menit.
   */
  timezoneOffsetMinutes?: number;
}

export interface ChargingCalculationResult {
  inputMode: ChargingInputMode;

  startedAt: Date;
  endedAt: Date;

  durationMinutes: number;
  offPeakMinutes: number;
  offPeakRatio: number;

  energyKwh: number;
  tokenAmount?: number;
  discountedEnergyKwh: number;

  ratePerKwh: number;
  discountPercent: number;

  baselineCost: number;
  actualCost: number;
  savingsAmount: number;

  shiftScore: number;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;

  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function ensureFiniteNumber(
  value: number,
  fieldName: string,
): void {
  if (!Number.isFinite(value)) {
    throw new ChargingCalculationError(
      `${fieldName} harus berupa angka yang valid.`,
    );
  }
}

function validateDate(date: Date, fieldName: string): void {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new ChargingCalculationError(
      `${fieldName} harus berupa tanggal yang valid.`,
    );
  }
}

function validateInput(
  input: CalculateChargingSessionInput,
): void {
  validateDate(input.startedAt, "startedAt");
  validateDate(input.endedAt, "endedAt");

  if (input.endedAt <= input.startedAt) {
    throw new ChargingCalculationError(
      "Waktu selesai harus lebih besar dari waktu mulai.",
    );
  }

  const durationHours =
    (input.endedAt.getTime() - input.startedAt.getTime()) /
    HOUR_MS;

  if (durationHours > MAX_SESSION_DURATION_HOURS) {
    throw new ChargingCalculationError(
      `Durasi charging maksimal ${MAX_SESSION_DURATION_HOURS} jam.`,
    );
  }

  ensureFiniteNumber(input.ratePerKwh, "ratePerKwh");
  ensureFiniteNumber(input.discountPercent, "discountPercent");

  if (input.ratePerKwh <= 0 || input.ratePerKwh > 100_000) {
    throw new ChargingCalculationError(
      "Tarif listrik harus lebih besar dari 0 dan maksimal Rp100.000/kWh.",
    );
  }

  if (
    input.discountPercent < 0 ||
    input.discountPercent > 100
  ) {
    throw new ChargingCalculationError(
      "Persentase diskon harus berada di antara 0 dan 100.",
    );
  }

  if (input.inputMode === "KWH") {
    if (input.energyKwh === undefined) {
      throw new ChargingCalculationError(
        "energyKwh wajib diisi untuk mode KWH.",
      );
    }

    ensureFiniteNumber(input.energyKwh, "energyKwh");

    if (input.energyKwh <= 0 || input.energyKwh > 500) {
      throw new ChargingCalculationError(
        "Energi harus lebih besar dari 0 dan maksimal 500 kWh.",
      );
    }
  }

  if (input.inputMode === "TOKEN") {
    if (input.tokenAmount === undefined) {
      throw new ChargingCalculationError(
        "tokenAmount wajib diisi untuk mode TOKEN.",
      );
    }

    ensureFiniteNumber(input.tokenAmount, "tokenAmount");

    if (
      input.tokenAmount <= 0 ||
      input.tokenAmount > 100_000_000
    ) {
      throw new ChargingCalculationError(
        "Nominal token harus lebih besar dari 0 dan maksimal Rp100.000.000.",
      );
    }
  }

  const timezoneOffsetMinutes =
    input.timezoneOffsetMinutes ??
    DEFAULT_TIMEZONE_OFFSET_MINUTES;

  ensureFiniteNumber(
    timezoneOffsetMinutes,
    "timezoneOffsetMinutes",
  );

  if (
    timezoneOffsetMinutes < -720 ||
    timezoneOffsetMinutes > 840
  ) {
    throw new ChargingCalculationError(
      "Timezone offset tidak valid.",
    );
  }
}

function resolveEnergyKwh(
  input: CalculateChargingSessionInput,
): number {
  if (input.inputMode === "KWH") {
    return input.energyKwh as number;
  }

  return (input.tokenAmount as number) / input.ratePerKwh;
}

function calculateOverlapMs(
  rangeStartMs: number,
  rangeEndMs: number,
  windowStartMs: number,
  windowEndMs: number,
): number {
  const overlapStart = Math.max(rangeStartMs, windowStartMs);
  const overlapEnd = Math.min(rangeEndMs, windowEndMs);

  return Math.max(0, overlapEnd - overlapStart);
}

/**
 * Menghitung durasi sesi yang overlap dengan jam 22.00–05.00.
 *
 * Timestamp UTC diubah menjadi local timeline menggunakan timezone
 * offset. Karena hanya terjadi pergeseran timestamp, panjang durasi
 * tidak berubah.
 */
function calculateOffPeakDurationMs(
  startedAtMs: number,
  endedAtMs: number,
  timezoneOffsetMinutes: number,
): number {
  const offsetMs = timezoneOffsetMinutes * MINUTE_MS;

  const localStartMs = startedAtMs + offsetMs;
  const localEndMs = endedAtMs + offsetMs;

  const firstDayIndex =
    Math.floor(localStartMs / DAY_MS) - 1;

  const lastDayIndex =
    Math.floor((localEndMs - 1) / DAY_MS) + 1;

  let offPeakDurationMs = 0;

  for (
    let dayIndex = firstDayIndex;
    dayIndex <= lastDayIndex;
    dayIndex += 1
  ) {
    const dayStartMs = dayIndex * DAY_MS;

    const midnightToFiveStart = dayStartMs;
    const midnightToFiveEnd = dayStartMs + 5 * HOUR_MS;

    const tenToMidnightStart =
      dayStartMs + 22 * HOUR_MS;

    const tenToMidnightEnd = dayStartMs + DAY_MS;

    offPeakDurationMs += calculateOverlapMs(
      localStartMs,
      localEndMs,
      midnightToFiveStart,
      midnightToFiveEnd,
    );

    offPeakDurationMs += calculateOverlapMs(
      localStartMs,
      localEndMs,
      tenToMidnightStart,
      tenToMidnightEnd,
    );
  }

  return offPeakDurationMs;
}

/**
 * Kurva sintetis beban listrik dari mockup WattUp.
 *
 * Nilai tinggi sekitar pukul 17.00–22.00.
 * Nilai rendah pada malam sampai dini hari.
 */
function gridLoadForHour(hour: number): number {
  const eveningPeak =
    1.35 *
    Math.exp(
      -((hour - 19.2) ** 2) / (2 * 2.3 * 2.3),
    );

  const morningLoad =
    0.35 *
    Math.exp(
      -((hour - 9) ** 2) / (2 * 2 * 2),
    );

  const nightTrough =
    0.55 *
    Math.exp(
      -((hour - 2) ** 2) / (2 * 3.2 * 3.2),
    );

  return 1 + eveningPeak + morningLoad - nightTrough;
}

const GRID_LOAD_SAMPLES = Array.from(
  { length: 96 },
  (_, index) => gridLoadForHour(index / 4),
);

const MIN_GRID_LOAD = Math.min(...GRID_LOAD_SAMPLES);
const MAX_GRID_LOAD = Math.max(...GRID_LOAD_SAMPLES);

function calculateScoreForHour(hour: number): number {
  const load = gridLoadForHour(hour);

  const normalizedScore =
    (MAX_GRID_LOAD - load) /
    (MAX_GRID_LOAD - MIN_GRID_LOAD);

  return Math.min(1, Math.max(0, normalizedScore));
}

function getLocalHour(
  utcTimestampMs: number,
  timezoneOffsetMinutes: number,
): number {
  const localDate = new Date(
    utcTimestampMs +
      timezoneOffsetMinutes * MINUTE_MS,
  );

  return (
    localDate.getUTCHours() +
    localDate.getUTCMinutes() / 60 +
    localDate.getUTCSeconds() / 3600
  );
}

/**
 * Mengambil weighted average score sepanjang durasi sesi.
 *
 * Sampling dilakukan setiap satu menit agar sesi yang melewati
 * beberapa zona waktu tidak hanya dinilai dari waktu mulainya.
 */
function calculateAverageShiftScore(
  startedAtMs: number,
  endedAtMs: number,
  timezoneOffsetMinutes: number,
): number {
  const totalDurationMs = endedAtMs - startedAtMs;

  let cursorMs = startedAtMs;
  let weightedScore = 0;

  while (cursorMs < endedAtMs) {
    const segmentEndMs = Math.min(
      cursorMs + SCORE_CALCULATION_STEP_MS,
      endedAtMs,
    );

    const segmentDurationMs = segmentEndMs - cursorMs;
    const midpointMs =
      cursorMs + segmentDurationMs / 2;

    const localHour = getLocalHour(
      midpointMs,
      timezoneOffsetMinutes,
    );

    const segmentScore =
      calculateScoreForHour(localHour);

    weightedScore +=
      segmentScore * segmentDurationMs;

    cursorMs = segmentEndMs;
  }

  return weightedScore / totalDurationMs;
}

export function calculateChargingSession(
  input: CalculateChargingSessionInput,
): ChargingCalculationResult {
  validateInput(input);

  const timezoneOffsetMinutes =
    input.timezoneOffsetMinutes ??
    DEFAULT_TIMEZONE_OFFSET_MINUTES;

  const startedAtMs = input.startedAt.getTime();
  const endedAtMs = input.endedAt.getTime();

  const durationMs = endedAtMs - startedAtMs;

  const offPeakDurationMs =
    calculateOffPeakDurationMs(
      startedAtMs,
      endedAtMs,
      timezoneOffsetMinutes,
    );

  const offPeakRatio =
    offPeakDurationMs / durationMs;

  const energyKwh = resolveEnergyKwh(input);

  const discountedEnergyKwh =
    energyKwh * offPeakRatio;

  const baselineCost =
    energyKwh * input.ratePerKwh;

  const savingsAmount =
    discountedEnergyKwh *
    input.ratePerKwh *
    (input.discountPercent / 100);

  const actualCost =
    baselineCost - savingsAmount;

  const shiftScore =
    calculateAverageShiftScore(
      startedAtMs,
      endedAtMs,
      timezoneOffsetMinutes,
    );

  return {
    inputMode: input.inputMode,

    startedAt: input.startedAt,
    endedAt: input.endedAt,

    durationMinutes: Math.max(
      1,
      Math.round(durationMs / MINUTE_MS),
    ),

    offPeakMinutes: roundTo(
      offPeakDurationMs / MINUTE_MS,
      2,
    ),

    offPeakRatio: roundTo(offPeakRatio, 4),

    energyKwh: roundTo(energyKwh, 3),

    tokenAmount:
      input.inputMode === "TOKEN"
        ? roundTo(input.tokenAmount as number, 2)
        : undefined,

    discountedEnergyKwh: roundTo(
      discountedEnergyKwh,
      3,
    ),

    ratePerKwh: roundTo(input.ratePerKwh, 2),

    discountPercent: roundTo(
      input.discountPercent,
      2,
    ),

    baselineCost: roundTo(baselineCost, 2),
    actualCost: roundTo(actualCost, 2),
    savingsAmount: roundTo(savingsAmount, 2),

    shiftScore: roundTo(shiftScore, 4),
  };
}