import { BatteryCharging, Clock3, History } from "lucide-react";

export interface ChargingHistoryItem {
  id: string;
  vehicleLabel: string | null;
  startedAt: Date;
  endedAt: Date;
  energyKwh: number;
  discountedEnergyKwh: number;
  savingsAmount: number;
  shiftScore: number;
}

interface ChargingHistoryListProps {
  sessions: ChargingHistoryItem[];
  showVehicle?: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatTimeRange(startedAt: Date, endedAt: Date): string {
  return `${timeFormatter.format(startedAt).replace(":", ".")}–${timeFormatter.format(endedAt).replace(":", ".")} WIB`;
}

function offPeakLabel(session: ChargingHistoryItem): string {
  if (session.energyKwh <= 0 || session.discountedEnergyKwh <= 0) {
    return "Di luar off-peak";
  }

  const share = Math.min(
    100,
    Math.round((session.discountedEnergyKwh / session.energyKwh) * 100),
  );

  return share >= 100 ? "Off-peak penuh" : `${share}% off-peak`;
}

export function ChargingHistoryList({
  sessions,
  showVehicle = true,
  emptyTitle,
  emptyDescription,
}: ChargingHistoryListProps) {
  if (sessions.length === 0) {
    return (
      <div className="charging-history-empty">
        <span>
          <History aria-hidden size={24} />
        </span>
        <strong>{emptyTitle}</strong>
        <p>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
      <div className="charging-history-table-wrap">
        <table className="charging-history-table">
          <thead>
            <tr>
              {showVehicle ? <th scope="col">Kendaraan</th> : null}
              <th scope="col">Tanggal dan waktu</th>
              <th scope="col">Energi</th>
              <th scope="col">Off-peak</th>
              <th scope="col">Estimasi hemat</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                {showVehicle ? (
                  <td>
                    <strong>{session.vehicleLabel ?? "Kendaraan lama"}</strong>
                  </td>
                ) : null}
                <td>
                  <strong>{dateFormatter.format(session.startedAt)}</strong>
                  <span>{formatTimeRange(session.startedAt, session.endedAt)}</span>
                </td>
                <td className="charging-history-number">
                  {session.energyKwh.toFixed(3)} kWh
                </td>
                <td>
                  <span className="charging-history-offpeak">
                    {offPeakLabel(session)}
                  </span>
                </td>
                <td className="charging-history-saving">
                  {currencyFormatter.format(session.savingsAmount)}
                </td>
                <td className="charging-history-number">
                  {session.shiftScore.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="charging-history-cards">
        {sessions.map((session) => (
          <article className="charging-history-card" key={session.id}>
            <div className="charging-history-card-heading">
              <span>
                <BatteryCharging aria-hidden size={18} />
              </span>
              <div>
                <strong>
                  {showVehicle
                    ? session.vehicleLabel ?? "Kendaraan lama"
                    : dateFormatter.format(session.startedAt)}
                </strong>
                <small>
                  {showVehicle ? dateFormatter.format(session.startedAt) : offPeakLabel(session)}
                </small>
              </div>
            </div>

            <div className="charging-history-card-time">
              <Clock3 aria-hidden size={14} />
              {formatTimeRange(session.startedAt, session.endedAt)}
            </div>

            <dl>
              <div>
                <dt>Energi</dt>
                <dd>{session.energyKwh.toFixed(3)} kWh</dd>
              </div>
              <div>
                <dt>Off-peak</dt>
                <dd>{offPeakLabel(session)}</dd>
              </div>
              <div>
                <dt>Estimasi hemat</dt>
                <dd className="positive">
                  {currencyFormatter.format(session.savingsAmount)}
                </dd>
              </div>
              <div>
                <dt>ShiftMalam Score</dt>
                <dd>{session.shiftScore.toFixed(2)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
