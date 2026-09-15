export type GridWindow = "off-peak" | "peak" | "regular";

export interface GridStatus {
  window: GridWindow;
  title: string;
  subtitle: string;
}

function getJakartaMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );

  return hour * 60 + minute;
}

function formatRemaining(minutes: number): string {
  const roundedMinutes = Math.max(1, Math.ceil(minutes));
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} menit`;
  }

  if (remainingMinutes === 0) {
    return `${hours} jam`;
  }

  return `${hours} jam ${remainingMinutes} menit`;
}

export function getGridStatus(date = new Date()): GridStatus {
  const minuteOfDay = getJakartaMinutes(date);
  const offPeakStart = 22 * 60;
  const offPeakEnd = 5 * 60;

  if (
    minuteOfDay >= offPeakStart ||
    minuteOfDay < offPeakEnd
  ) {
    const minutesUntilEnd =
      minuteOfDay < offPeakEnd
        ? offPeakEnd - minuteOfDay
        : 24 * 60 - minuteOfDay + offPeakEnd;

    return {
      window: "off-peak",
      title: "Diskon off-peak sedang aktif",
      subtitle: `${formatRemaining(minutesUntilEnd)} tersisa · berakhir pukul 05.00 WIB`,
    };
  }

  const minutesUntilOffPeak =
    offPeakStart - minuteOfDay;

  if (minuteOfDay >= 17 * 60) {
    return {
      window: "peak",
      title: "Jam beban puncak",
      subtitle: `${formatRemaining(minutesUntilOffPeak)} lagi menuju off-peak pukul 22.00 WIB`,
    };
  }

  return {
    window: "regular",
    title: "Menuju jam off-peak",
    subtitle: `${formatRemaining(minutesUntilOffPeak)} lagi menuju pukul 22.00 WIB`,
  };
}
