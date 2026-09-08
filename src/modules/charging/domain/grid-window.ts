export type GridWindow = "off-peak" | "peak" | "regular";

export interface GridStatus {
  window: GridWindow;
  title: string;
  subtitle: string;
}

function getJakartaHour(date: Date): number {
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

  return hour + minute / 60;
}

export function getGridStatus(date = new Date()): GridStatus {
  const hour = getJakartaHour(date);

  if (hour >= 22 || hour < 5) {
    return {
      window: "off-peak",
      title: "Diskon off-peak sedang aktif",
      subtitle: "Waktu terbaik untuk charging sampai pukul 05.00",
    };
  }

  if (hour >= 17 && hour < 22) {
    return {
      window: "peak",
      title: "Jam beban puncak",
      subtitle: `${(22 - hour).toFixed(0)} jam lagi menuju diskon pukul 22.00`,
    };
  }

  return {
    window: "regular",
    title: "Menuju jam off-peak",
    subtitle: `${((22 - hour ) % 24).toFixed(0)} jam lagi menuju pukul 22.00`,
  };
}