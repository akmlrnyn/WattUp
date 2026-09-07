"use client";

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Zap,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  type CSSProperties,
  type FormEvent,
  useMemo,
  useState,
} from "react";

type ChargingInputModeValue =
  | "KWH"
  | "TOKEN";

interface CreateSessionResponse {
  success: boolean;
  message?: string;
}

const DEFAULT_RATE = 1699;
const DISCOUNT_PERCENT = 30;

/*
 * Mockup hanya menyediakan jam mulai.
 * Karena slider bergerak per 15 menit,
 * setiap pilihan menjadi satu bucket 15 menit.
 */
const SLOT_MINUTES = 15;

export interface RecentChargingSessionItem {
  id: string;
  startedAt: string;

  energyKwh: number;
  savingsAmount: number;
  shiftScore: number;
}

interface ChargingSessionFormProps {
  recentSessions:
    RecentChargingSessionItem[];
}

function gridLoad(hour: number): number {
  const eveningPeak =
    1.35 *
    Math.exp(
      -((hour - 19.2) ** 2) /
        (2 * 2.3 * 2.3),
    );

  const morningLoad =
    0.35 *
    Math.exp(
      -((hour - 9) ** 2) /
        (2 * 2 * 2),
    );

  const nightTrough =
    0.55 *
    Math.exp(
      -((hour - 2) ** 2) /
        (2 * 3.2 * 3.2),
    );

  return (
    1 +
    eveningPeak +
    morningLoad -
    nightTrough
  );
}

const loadSamples = Array.from(
  { length: 96 },
  (_, index) => gridLoad(index / 4),
);

const minGridLoad =
  Math.min(...loadSamples);

const maxGridLoad =
  Math.max(...loadSamples);

function scoreForHour(
  hour: number,
): number {
  const load = gridLoad(hour);

  const score =
    (maxGridLoad - load) /
    (maxGridLoad - minGridLoad);

  return Math.min(
    1,
    Math.max(0, score),
  );
}

function isOffPeak(
  hour: number,
): boolean {
  return hour >= 22 || hour < 5;
}

function isPeak(
  hour: number,
): boolean {
  return hour >= 17 && hour < 22;
}

function getZone(hour: number): {
  label: string;
  className:
    | "off-peak"
    | "peak"
    | "regular";
} {
  if (isOffPeak(hour)) {
    return {
      label:
        "Off-peak (diskon PLN)",
      className: "off-peak",
    };
  }

  if (isPeak(hour)) {
    return {
      label:
        "Peak (beban tinggi)",
      className: "peak",
    };
  }

  return {
    label: "Sedang",
    className: "regular",
  };
}

function formatHour(
  value: number,
): string {
  const hour = Math.floor(value);

  const minute = Math.round(
    (value - hour) * 60,
  );

  return (
    `${String(hour).padStart(
      2,
      "0",
    )}.` +
    String(minute).padStart(
      2,
      "0",
    )
  );
}

function formatRupiah(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function buildWibTimeSlot(
  hourValue: number,
): {
  startedAt: Date;
  endedAt: Date;
} {
  const now = new Date();

  /*
   * Mengubah waktu sekarang
   * menjadi timeline WIB.
   */
  const wibNow = new Date(
    now.getTime() +
      7 * 60 * 60 * 1000,
  );

  const year =
    wibNow.getUTCFullYear();

  const month = String(
    wibNow.getUTCMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    wibNow.getUTCDate(),
  ).padStart(2, "0");

  const hour =
    Math.floor(hourValue);

  const minute = Math.round(
    (hourValue - hour) * 60,
  );

  const localIso =
    `${year}-${month}-${day}` +
    `T${String(hour).padStart(
      2,
      "0",
    )}` +
    `:${String(minute).padStart(
      2,
      "0",
    )}` +
    ":00+07:00";

  const startedAt =
    new Date(localIso);

  const endedAt = new Date(
    startedAt.getTime() +
      SLOT_MINUTES * 60_000,
  );

  return {
    startedAt,
    endedAt,
  };
}

function formatHistoryDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    },
  )
    .format(new Date(value))
    .replace(":", ".");
}

export function ChargingSessionForm({
  recentSessions,
}: ChargingSessionFormProps) {
  const router = useRouter();

  const [
    isPending,
    setIsPending,
  ] = useState(false);

  const [
    mode,
    setMode,
  ] =
    useState<ChargingInputModeValue>(
      "KWH",
    );

  const [
    hour,
    setHour,
  ] = useState(22);

  const [
    energyKwh,
    setEnergyKwh,
  ] = useState(8);

  const [
    tokenAmount,
    setTokenAmount,
  ] = useState(13592);

  const [
    ratePerKwh,
    setRatePerKwh,
  ] = useState(DEFAULT_RATE);

  const [
    feedback,
    setFeedback,
  ] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const preview = useMemo(() => {
    const safeRate =
      Number.isFinite(
        ratePerKwh,
      ) &&
      ratePerKwh > 0
        ? ratePerKwh
        : DEFAULT_RATE;

    const resolvedEnergy =
      mode === "KWH"
        ? Math.max(
            0,
            energyKwh || 0,
          )
        : Math.max(
              0,
              tokenAmount || 0,
            ) / safeRate;

    const offPeak =
      isOffPeak(hour);

    return {
      energyKwh:
        resolvedEnergy,

      savingsAmount:
        offPeak
          ? resolvedEnergy *
            safeRate *
            (
              DISCOUNT_PERCENT /
              100
            )
          : 0,

      score:
        scoreForHour(hour),

      zone:
        getZone(hour),
    };
  }, [
    energyKwh,
    hour,
    mode,
    ratePerKwh,
    tokenAmount,
  ]);

  const sliderStyle = {
    "--catat-slider-progress":
      `${
        (hour / 23.75) *
        100
      }%`,
  } as CSSProperties;

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFeedback(null);
    setIsPending(true);

    const timeSlot =
      buildWibTimeSlot(hour);

    try {
      const response =
        await fetch(
          "/api/charging-sessions",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              inputMode: mode,

              startedAt:
                timeSlot
                  .startedAt
                  .toISOString(),

              endedAt:
                timeSlot
                  .endedAt
                  .toISOString(),

              energyKwh:
                mode === "KWH"
                  ? energyKwh
                  : undefined,

              tokenAmount:
                mode === "TOKEN"
                  ? tokenAmount
                  : undefined,

              ratePerKwh,
            }),
          },
        );

      const result =
        (
          await response.json()
        ) as CreateSessionResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ??
            "Sesi charging gagal disimpan.",
        );
      }

      setFeedback({
        type: "success",

        message:
          "Sesi charging berhasil disimpan.",
      });

      /*
       * Memuat ulang riwayat dan
       * data dashboard terbaru.
       */
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
      <form
        className={
          "catat-card catat-form"
        }
        onSubmit={handleSubmit}
      >
        <div
          className={
            "catat-mode-toggle"
          }
          aria-label={
            "Metode input energi"
          }
        >
          <button
            className={
              mode === "KWH"
                ? "active"
                : ""
            }
            onClick={() =>
              setMode("KWH")
            }
            type="button"
          >
            Saya tahu kWh
          </button>

          <button
            className={
              mode === "TOKEN"
                ? "active"
                : ""
            }
            onClick={() =>
              setMode("TOKEN")
            }
            type="button"
          >
            Saya isi token (Rp)
          </button>
        </div>

        <div className="catat-field">
          <div
            className={
              "catat-label-row"
            }
          >
            <label
              htmlFor={
                "charging-hour"
              }
            >
              Jam mulai charging
            </label>

            <output
              htmlFor={
                "charging-hour"
              }
            >
              {formatHour(hour)}
              {" WIB"}
            </output>
          </div>

          <input
            aria-label={
              "Jam mulai charging"
            }
            className={
              "catat-hour-slider"
            }
            id="charging-hour"
            max="23.75"
            min="0"
            onChange={(event) =>
              setHour(
                Number(
                  event.target
                    .value,
                ),
              )
            }
            step="0.25"
            style={sliderStyle}
            type="range"
            value={hour}
          />

          <div
            className={
              "catat-slider-labels"
            }
            aria-hidden
          >
            <span>00.00</span>

            <strong>
              {formatHour(hour)}
            </strong>

            <span>23.45</span>
          </div>
        </div>

        <div
          className={
            "catat-timeline"
          }
          aria-label={
            "Kurva beban listrik"
          }
        >
          {Array.from(
            { length: 24 },

            (_, index) => {
              const score =
                scoreForHour(
                  index + 0.5,
                );

              const className =
                score > 0.66
                  ? "low"
                  : score >
                      0.33
                    ? "medium"
                    : "high";

              return (
                <i
                  className={
                    className
                  }
                  key={index}
                />
              );
            },
          )}

          <span
            className={
              "catat-timeline-cursor"
            }
            style={{
              left:
                `${
                  (
                    hour /
                    24
                  ) *
                  100
                }%`,
            }}
          />
        </div>

        {mode === "KWH" ? (
          <div className="catat-field">
            <label
              htmlFor="energy-kwh"
            >
              Energi terisi (kWh)
            </label>

            <div
              className={
                "catat-input-shell"
              }
            >
              <input
                id="energy-kwh"
                min="0.5"
                onChange={(
                  event,
                ) =>
                  setEnergyKwh(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                required
                step="0.5"
                type="number"
                value={energyKwh}
              />

              <span>kWh</span>
            </div>
          </div>
        ) : (
          <div className="catat-field">
            <label
              htmlFor={
                "token-amount"
              }
            >
              Nominal token
              dibeli (Rp)
            </label>

            <div
              className={
                "catat-input-shell"
              }
            >
              <span>Rp</span>

              <input
                id="token-amount"
                min="100"
                onChange={(
                  event,
                ) =>
                  setTokenAmount(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                required
                step="100"
                type="number"
                value={
                  tokenAmount
                }
              />
            </div>
          </div>
        )}

        <div className="catat-field">
          <label
            htmlFor={
              "electricity-rate"
            }
          >
            Tarif listrik
            (Rp/kWh)
          </label>

          <div
            className={
              "catat-input-shell"
            }
          >
            <span>Rp</span>

            <input
              id={
                "electricity-rate"
              }
              min="1"
              onChange={(
                event,
              ) =>
                setRatePerKwh(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
              required
              step="1"
              type="number"
              value={ratePerKwh}
            />

            <span>/kWh</span>
          </div>
        </div>

        <section
          className={
            "catat-preview"
          }
          aria-live="polite"
        >
          <div
            className={
              "catat-preview-row"
            }
          >
            <span>
              Zona tarif saat ini
            </span>

            <strong
              className={
                `catat-zone ` +
                preview.zone
                  .className
              }
            >
              {
                preview.zone
                  .label
              }
            </strong>
          </div>

          <div
            className={
              "catat-preview-row"
            }
          >
            <span>
              ShiftMalam Score
            </span>

            <strong>
              {preview.score.toFixed(
                2,
              )}
              {" / 1.00"}
            </strong>
          </div>

          <div
            className={
              "catat-score-track"
            }
          >
            <i
              style={{
                width:
                  `${
                    preview.score *
                    100
                  }%`,
              }}
            />
          </div>

          <div
            className={
              "catat-preview-row result"
            }
          >
            <span>
              Estimasi kWh
              dialihkan
            </span>

            <strong>
              {preview.energyKwh.toFixed(
                1,
              )}
              {" kWh"}
            </strong>
          </div>

          <div
            className={
              "catat-preview-row result"
            }
          >
            <span>
              Estimasi hemat
              {" "}
              (diskon DSM 30%)
            </span>

            <strong>
              {formatRupiah(
                preview.savingsAmount,
              )}
            </strong>
          </div>

          {!isOffPeak(hour) ? (
            <p
              className={
                "catat-no-discount"
              }
            >
              Di luar jam
              diskon PLN.
            </p>
          ) : null}

          <p
            className={
              "catat-formula"
            }
          >
            Score = 1 − beban
            grid ternormalisasi.
            Pukul 22.00–05.00
            merupakan jam lembah
            beban, sedangkan
            17.00–22.00 merupakan
            jam beban puncak.
          </p>
        </section>

        {feedback ? (
          <div
            className={
              `catat-feedback ` +
              feedback.type
            }
            role="status"
          >
            {feedback.type ===
            "success" ? (
              <CheckCircle2
                size={17}
              />
            ) : null}

            {feedback.message}
          </div>
        ) : null}

        <button
          className={
            "catat-submit"
          }
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <LoaderCircle
              className={
                "catat-spinner"
              }
              size={18}
            />
          ) : (
            <Zap
              fill="currentColor"
              size={18}
            />
          )}

          {isPending
            ? "Menyimpan sesi..."
            : "Simpan sesi & update streak"}
        </button>
      </form>

      <aside
        className={
          "catat-history-section"
        }
      >
        <div
          className={
            "catat-history-heading"
          }
        >
          <div>
            <h2>
              Riwayat sesi terbaru
            </h2>

            <p>
              Enam pencatatan
              terakhir kamu
            </p>
          </div>

          <Clock3
            aria-hidden
            size={21}
          />
        </div>

        <div
          className={
            "catat-card catat-history-card"
          }
        >
          {recentSessions.length ===
          0 ? (
            <div
              className={
                "catat-empty-history"
              }
            >
              <span>
                <Zap
                  aria-hidden
                  size={22}
                />
              </span>

              <strong>
                Belum ada sesi
                dicatat
              </strong>

              <p>
                Sesi yang kamu
                simpan akan muncul
                di sini.
              </p>
            </div>
          ) : (
            recentSessions.map(
              (item) => (
                <article
                  className={
                    "catat-history-row"
                  }
                  key={item.id}
                >
                  <div>
                    <strong>
                      {formatHistoryDate(
                        item.startedAt,
                      )}
                    </strong>

                    <span>
                      Score{" "}
                      {item.shiftScore.toFixed(
                        2,
                      )}
                      {" · "}
                      {item.energyKwh.toFixed(
                        1,
                      )}
                      {" kWh"}
                    </span>
                  </div>

                  <strong>
                    {formatRupiah(
                      item.savingsAmount,
                    )}
                  </strong>
                </article>
              ),
            )
          )}
        </div>
      </aside>
    </div>
  );
}