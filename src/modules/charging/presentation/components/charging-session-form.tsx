"use client";

import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  Gauge,
  Info,
  LoaderCircle,
  Moon,
  ReceiptText,
  WalletCards,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type FormEvent,
  useMemo,
  useState,
} from "react";

type ChargingInputModeValue = "KWH" | "METER";

interface CreateSessionResponse {
  success: boolean;
  message?: string;
}

const SLOT_MINUTES = 15;

export interface RecentChargingSessionItem {
  id: string;
  vehicleId: string | null;
  vehicleLabel: string | null;
  startedAt: string;
  energyKwh: number;
  savingsAmount: number;
  shiftScore: number;
}

interface ChargingSessionFormProps {
  recentSessions: RecentChargingSessionItem[];
  electricityRate: number;
  discountPercent: number;
  billingType: "PREPAID" | "POSTPAID";
  vehicles: {
    id: string;
    name: string;
    isPrimary: boolean;
  }[];
  preferredVehicleId?: string;
}

function gridLoad(hour: number): number {
  const eveningPeak =
    1.35 * Math.exp(-((hour - 19.2) ** 2) / (2 * 2.3 * 2.3));
  const morningLoad =
    0.35 * Math.exp(-((hour - 9) ** 2) / (2 * 2 * 2));
  const nightTrough =
    0.55 * Math.exp(-((hour - 2) ** 2) / (2 * 3.2 * 3.2));

  return 1 + eveningPeak + morningLoad - nightTrough;
}

const loadSamples = Array.from(
  { length: 96 },
  (_, index) => gridLoad(index / 4),
);
const minGridLoad = Math.min(...loadSamples);
const maxGridLoad = Math.max(...loadSamples);

function scoreForHour(hour: number): number {
  const score =
    (maxGridLoad - gridLoad(hour)) /
    (maxGridLoad - minGridLoad);

  return Math.min(1, Math.max(0, score));
}

function isOffPeak(hour: number): boolean {
  return hour >= 22 || hour < 5;
}

function isPeak(hour: number): boolean {
  return hour >= 17 && hour < 22;
}

function getZone(hour: number): {
  label: string;
  className: "off-peak" | "peak" | "regular";
} {
  if (isOffPeak(hour)) {
    return {
      label: "Off-peak · hemat",
      className: "off-peak",
    };
  }

  if (isPeak(hour)) {
    return {
      label: "Peak · beban tinggi",
      className: "peak",
    };
  }

  return {
    label: "Beban sedang",
    className: "regular",
  };
}

function formatHour(value: number): string {
  const hour = Math.floor(value);
  const minute = Math.round((value - hour) * 60);

  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildWibTimeSlot(hourValue: number): {
  startedAt: Date;
  endedAt: Date;
} {
  const now = new Date();
  const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const year = wibNow.getUTCFullYear();
  const month = String(wibNow.getUTCMonth() + 1).padStart(2, "0");
  const day = String(wibNow.getUTCDate()).padStart(2, "0");
  const hour = Math.floor(hourValue);
  const minute = Math.round((hourValue - hour) * 60);
  const localIso =
    `${year}-${month}-${day}T${String(hour).padStart(2, "0")}` +
    `:${String(minute).padStart(2, "0")}:00+07:00`;
  const startedAt = new Date(localIso);

  return {
    startedAt,
    endedAt: new Date(startedAt.getTime() + SLOT_MINUTES * 60_000),
  };
}

function formatHistoryDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })
    .format(new Date(value))
    .replace(":", ".");
}

export function ChargingSessionForm({
  recentSessions,
  electricityRate,
  discountPercent,
  billingType,
  vehicles,
  preferredVehicleId,
}: ChargingSessionFormProps) {
  const router = useRouter();
  const lastUsedVehicleId = recentSessions.find((session) =>
    vehicles.some((vehicle) => vehicle.id === session.vehicleId),
  )?.vehicleId;
  const initialVehicleId =
    vehicles.some((vehicle) => vehicle.id === preferredVehicleId)
      ? preferredVehicleId ?? ""
      : lastUsedVehicleId ??
    vehicles.find((vehicle) => vehicle.isPrimary)?.id ??
    vehicles[0]?.id ??
    "";

  const [isPending, setIsPending] = useState(false);
  const [mode, setMode] =
    useState<ChargingInputModeValue>("KWH");
  const [hour, setHour] = useState(22);
  const [energyKwh, setEnergyKwh] = useState("8");
  const [vehicleId, setVehicleId] = useState(initialVehicleId);
  const [meterBefore, setMeterBefore] = useState("");
  const [meterAfter, setMeterAfter] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === vehicleId,
  );
  const directEnergy = Number(energyKwh);
  const validDirectEnergy =
    energyKwh !== "" &&
    Number.isFinite(directEnergy) &&
    directEnergy >= 0.001 &&
    directEnergy <= 500;
  const meterDifference = Math.round(
    (billingType === "PREPAID"
      ? Number(meterBefore) - Number(meterAfter)
      : Number(meterAfter) - Number(meterBefore)) * 1000,
  ) / 1000;
  const meterHasValues =
    meterBefore !== "" && meterAfter !== "";
  const validMeter =
    meterHasValues &&
    Number(meterBefore) >= 0 &&
    Number(meterAfter) >= 0 &&
    meterDifference >= 0.001 &&
    meterDifference <= 500;
  const validEnergy = mode === "KWH" ? validDirectEnergy : validMeter;
  const canSubmit = Boolean(selectedVehicle) && validEnergy && !isPending;

  const preview = useMemo(() => {
    const resolvedEnergy =
      mode === "KWH"
        ? validDirectEnergy
          ? directEnergy
          : 0
        : validMeter
          ? meterDifference
          : 0;
    const savingsAmount = isOffPeak(hour)
      ? resolvedEnergy * electricityRate * (discountPercent / 100)
      : 0;

    return {
      energyKwh: resolvedEnergy,
      estimatedCost: Math.max(
        0,
        resolvedEnergy * electricityRate - savingsAmount,
      ),
      savingsAmount,
      score: scoreForHour(hour),
      zone: getZone(hour),
    };
  }, [
    directEnergy,
    discountPercent,
    electricityRate,
    hour,
    meterDifference,
    mode,
    validDirectEnergy,
    validMeter,
  ]);

  const sliderStyle = {
    "--catat-slider-progress": `${(hour / 23.75) * 100}%`,
  } as CSSProperties;

  const disabledReason = !selectedVehicle
    ? "Pilih kendaraan untuk melanjutkan."
    : mode === "KWH" && !validDirectEnergy
      ? "Energi harus antara 0,001 dan 500 kWh."
      : mode === "METER" && !meterHasValues
        ? "Isi kedua angka meter untuk melanjutkan."
        : mode === "METER" && !validMeter
          ? billingType === "PREPAID"
            ? "Saldo sesudah harus lebih kecil. Selisih maksimal 500 kWh."
            : "Meter sesudah harus lebih besar. Selisih maksimal 500 kWh."
          : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setFeedback(null);
    setIsPending(true);
    const timeSlot = buildWibTimeSlot(hour);

    try {
      const response = await fetch("/api/charging-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputMode: mode,
          startedAt: timeSlot.startedAt.toISOString(),
          endedAt: timeSlot.endedAt.toISOString(),
          energyKwh: mode === "KWH" ? directEnergy : undefined,
          vehicleId,
          meterBefore:
            mode === "METER" ? Number(meterBefore) : undefined,
          meterAfter:
            mode === "METER" ? Number(meterAfter) : undefined,
        }),
      });
      const result = (await response.json()) as CreateSessionResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Sesi charging gagal disimpan.",
        );
      }

      setFeedback({
        type: "success",
        message: "Sesi charging berhasil disimpan dan progresmu sudah diperbarui.",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Sesi charging gagal disimpan.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="catat-layout">
      <form className="catat-card catat-form" onSubmit={handleSubmit}>
        <section className="catat-form-section">
          <div className="catat-step-heading">
            <span>1</span>
            <div>
              <h2>Pilih kendaraan</h2>
              <p>Sesi akan tersimpan di riwayat kendaraan yang dipilih.</p>
            </div>
          </div>

          <label className="catat-select-field" htmlFor="charging-vehicle">
            <span>Kendaraan</span>
            <div className="catat-select-shell">
              <CarFront aria-hidden size={18} />
              <select
                id="charging-vehicle"
                onChange={(event) => setVehicleId(event.target.value)}
                required
                value={vehicleId}
              >
                <option disabled value="">Pilih kendaraan</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}{vehicle.isPrimary ? " · Utama" : ""}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </section>

        <section className="catat-form-section">
          <div className="catat-step-heading">
            <span>2</span>
            <div>
              <h2>Profil listrik</h2>
              <p>Jenis pembayaran berasal dari profil listrikmu.</p>
            </div>
          </div>

          <div className="catat-billing-card">
            <span className="catat-billing-icon">
              {billingType === "PREPAID" ? (
                <WalletCards aria-hidden size={21} />
              ) : (
                <ReceiptText aria-hidden size={21} />
              )}
            </span>
            <div>
              <strong>
                {billingType === "PREPAID"
                  ? "Token / Prabayar"
                  : "Pascabayar"}
              </strong>
              <p>
                {billingType === "PREPAID"
                  ? "Listrik dibayar melalui saldo token kWh."
                  : "Pemakaian listrik ditambahkan ke tagihan bulanan."}
              </p>
            </div>
            <span className="catat-rate">
              {formatRupiah(electricityRate)} / kWh
            </span>
          </div>

          <Link className="catat-profile-link" href="/profile">
            Perbarui profil listrik <ArrowRight aria-hidden size={14} />
          </Link>
        </section>

        <section className="catat-form-section">
          <div className="catat-step-heading">
            <span>3</span>
            <div>
              <h2>Masukkan data charging</h2>
              <p>Pilih cara pencatatan yang paling sesuai.</p>
            </div>
          </div>

          <div className="catat-mode-toggle" aria-label="Metode input energi">
            <button
              aria-pressed={mode === "KWH"}
              className={mode === "KWH" ? "active" : ""}
              onClick={() => setMode("KWH")}
              type="button"
            >
              <Zap aria-hidden size={16} />
              Input kWh langsung
            </button>
            <button
              aria-pressed={mode === "METER"}
              className={mode === "METER" ? "active" : ""}
              onClick={() => setMode("METER")}
              type="button"
            >
              <Gauge aria-hidden size={16} />
              Selisih meter
            </button>
          </div>

          {mode === "KWH" ? (
            <label className="catat-field" htmlFor="energy-kwh">
              <span>Energi yang terisi</span>
              <div className="catat-input-shell">
                <input
                  id="energy-kwh"
                  inputMode="decimal"
                  max="500"
                  min="0.001"
                  onChange={(event) => setEnergyKwh(event.target.value)}
                  required
                  step="0.001"
                  type="number"
                  value={energyKwh}
                />
                <span>kWh</span>
              </div>
              {!validDirectEnergy ? (
                <small className="catat-field-error">
                  Masukkan 0,001–500 kWh.
                </small>
              ) : null}
            </label>
          ) : (
            <div className="catat-meter-block">
              <div className="catat-meter-grid">
                <label className="catat-field" htmlFor="meter-before">
                  <span>
                    {billingType === "PREPAID"
                      ? "Saldo sebelum"
                      : "Meter sebelum"}
                  </span>
                  <div className="catat-input-shell">
                    <input
                      id="meter-before"
                      inputMode="decimal"
                      max="99999999999"
                      min="0"
                      onChange={(event) => setMeterBefore(event.target.value)}
                      required
                      step="0.001"
                      type="number"
                      value={meterBefore}
                    />
                    <span>kWh</span>
                  </div>
                </label>
                <label className="catat-field" htmlFor="meter-after">
                  <span>
                    {billingType === "PREPAID"
                      ? "Saldo sesudah"
                      : "Meter sesudah"}
                  </span>
                  <div className="catat-input-shell">
                    <input
                      id="meter-after"
                      inputMode="decimal"
                      max="99999999999"
                      min="0"
                      onChange={(event) => setMeterAfter(event.target.value)}
                      required
                      step="0.001"
                      type="number"
                      value={meterAfter}
                    />
                    <span>kWh</span>
                  </div>
                </label>
              </div>

              <p className="catat-meter-help">
                <Info aria-hidden size={15} />
                {billingType === "PREPAID"
                  ? "Energi dihitung dari saldo sebelum dikurangi saldo sesudah. Jangan isi token di antara pembacaan."
                  : "Energi dihitung dari meter sesudah dikurangi meter sebelum."}
              </p>
              {meterHasValues && !validMeter ? (
                <p className="catat-field-error" role="alert">
                  {billingType === "PREPAID"
                    ? "Saldo sesudah harus lebih kecil dari saldo sebelum."
                    : "Meter sesudah harus lebih besar dari meter sebelum."}
                  {" "}Selisih maksimal 500 kWh.
                </p>
              ) : null}
            </div>
          )}

          <div className="catat-time-block">
            <div className="catat-label-row">
              <label htmlFor="charging-hour">Jam mulai charging</label>
              <output htmlFor="charging-hour">
                {formatHour(hour)} WIB
              </output>
            </div>
            <input
              aria-label="Jam mulai charging"
              className="catat-hour-slider"
              id="charging-hour"
              max="23.75"
              min="0"
              onChange={(event) => setHour(Number(event.target.value))}
              step="0.25"
              style={sliderStyle}
              type="range"
              value={hour}
            />
            <div className="catat-slider-labels" aria-hidden>
              <span>00.00</span>
              <strong>{formatHour(hour)}</strong>
              <span>23.45</span>
            </div>
            <div className="catat-timeline" aria-label="Kurva beban listrik">
              {Array.from({ length: 24 }, (_, index) => {
                const score = scoreForHour(index + 0.5);
                const className =
                  score > 0.66 ? "low" : score > 0.33 ? "medium" : "high";
                return <i className={className} key={index} />;
              })}
              <span
                className="catat-timeline-cursor"
                style={{ left: `${(hour / 24) * 100}%` }}
              />
            </div>
          </div>
        </section>

        <section className="catat-preview" aria-live="polite">
          <div className="catat-preview-heading">
            <div>
              <span>4</span>
              <div>
                <h2>Ringkasan sesi</h2>
                <p>Periksa estimasi sebelum menyimpan.</p>
              </div>
            </div>
            <strong className={`catat-zone ${preview.zone.className}`}>
              {preview.zone.label}
            </strong>
          </div>

          <dl className="catat-summary-grid">
            <div>
              <dt>Kendaraan</dt>
              <dd>{selectedVehicle?.name ?? "Belum dipilih"}</dd>
            </div>
            <div>
              <dt>Energi tercatat</dt>
              <dd>{preview.energyKwh.toFixed(3)} kWh</dd>
            </div>
            <div>
              <dt><Clock3 aria-hidden size={14} /> Waktu charging</dt>
              <dd>{formatHour(hour)} WIB · {preview.zone.label}</dd>
            </div>
            <div>
              <dt>
                {billingType === "PREPAID"
                  ? "Estimasi saldo berkurang"
                  : "Estimasi tambahan tagihan"}
              </dt>
              <dd>
                {billingType === "PREPAID"
                  ? `${preview.energyKwh.toFixed(3)} kWh`
                  : formatRupiah(preview.estimatedCost)}
              </dd>
            </div>
            <div>
              <dt>Estimasi biaya listrik</dt>
              <dd>{formatRupiah(preview.estimatedCost)}</dd>
            </div>
            <div>
              <dt>Estimasi hemat</dt>
              <dd className="positive">{formatRupiah(preview.savingsAmount)}</dd>
            </div>
          </dl>

          <div className="catat-score-summary">
            <div>
              <span>ShiftMalam Score</span>
              <strong>{preview.score.toFixed(2)} / 1.00</strong>
            </div>
            <div className="catat-score-track">
              <i style={{ width: `${preview.score * 100}%` }} />
            </div>
            <small>
              Score memperkirakan rendahnya beban grid pada waktu yang dipilih. Diskon DSM yang digunakan: {discountPercent}%.
            </small>
          </div>
        </section>

        {feedback ? (
          <div className={`catat-feedback ${feedback.type}`} role="status">
            {feedback.type === "success" ? (
              <CheckCircle2 aria-hidden size={18} />
            ) : (
              <Info aria-hidden size={18} />
            )}
            <div>
              <strong>
                {feedback.type === "success"
                  ? "Sesi berhasil disimpan"
                  : "Sesi belum tersimpan"}
              </strong>
              <span>{feedback.message}</span>
              {feedback.type === "success" ? (
                <Link href="/dashboard">Lihat dashboard</Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="catat-submit-wrap">
          <button className="catat-submit" disabled={!canSubmit} type="submit">
            {isPending ? (
              <LoaderCircle aria-hidden className="catat-spinner" size={18} />
            ) : (
              <Zap aria-hidden fill="currentColor" size={18} />
            )}
            <span>
              {isPending ? "Menyimpan sesi..." : "Simpan sesi charging"}
            </span>
          </button>
          {disabledReason ? (
            <p className="catat-submit-reason">{disabledReason}</p>
          ) : null}
        </div>
      </form>

      <aside className="catat-history-section">
        <div className="catat-history-heading">
          <div>
            <h2>Riwayat terbaru</h2>
            <p>Enam pencatatan terakhir kamu</p>
          </div>
          <Link className="catat-history-all-link" href="/sessions">
            Lihat semua <ArrowRight aria-hidden size={14} />
          </Link>
        </div>

        <div className="catat-card catat-history-card">
          {recentSessions.length === 0 ? (
            <div className="catat-empty-history">
              <span><Moon aria-hidden size={22} /></span>
              <strong>Belum ada sesi dicatat</strong>
              <p>Sesi yang kamu simpan akan muncul di sini.</p>
            </div>
          ) : (
            recentSessions.map((item) => (
              <article className="catat-history-row" key={item.id}>
                <div>
                  <strong>{formatHistoryDate(item.startedAt)}</strong>
                  <span>{item.vehicleLabel ?? "Kendaraan lama"}</span>
                  <small>
                    {item.energyKwh.toFixed(1)} kWh · Score {item.shiftScore.toFixed(2)}
                  </small>
                </div>
                <strong>{formatRupiah(item.savingsAmount)}</strong>
              </article>
            ))
          )}
        </div>

        <div className="catat-history-note">
          <CreditCard aria-hidden size={16} />
          Tarif dan jenis pembayaran tersimpan sebagai snapshot di setiap sesi.
        </div>
      </aside>
    </div>
  );
}
