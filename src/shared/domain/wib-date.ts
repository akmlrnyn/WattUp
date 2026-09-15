const DAY_MS = 24 * 60 * 60 * 1_000;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1_000;

export function toWibDayIndex(date: Date): number {
  return Math.floor(
    (date.getTime() + WIB_OFFSET_MS) / DAY_MS,
  );
}

export function getWibMondayIndex(date: Date): number {
  const wibDayIndex = toWibDayIndex(date);

  const dayOfWeek = new Date(
    wibDayIndex * DAY_MS,
  ).getUTCDay();

  return wibDayIndex - ((dayOfWeek + 6) % 7);
}

export function fromWibDayIndex(dayIndex: number): Date {
  return new Date(
    dayIndex * DAY_MS - WIB_OFFSET_MS,
  );
}

export function getCurrentWibWeekRange(now: Date): {
  start: Date;
  endExclusive: Date;
} {
  const mondayIndex = getWibMondayIndex(now);

  return {
    start: fromWibDayIndex(mondayIndex),
    endExclusive: fromWibDayIndex(mondayIndex + 7),
  };
}

export function formatWibShortDate(
  dayIndex: number,
): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
  }).format(fromWibDayIndex(dayIndex));
}
