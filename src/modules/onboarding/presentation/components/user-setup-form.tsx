"use client";

import {
  ArrowRight,
  BellRing,
  CarFront,
  LoaderCircle,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";

interface SetupResponse {
  success: boolean;
  message?: string;
}

const VEHICLE_BRANDS = [
  "BYD",
  "Hyundai",
  "Wuling",
  "MG",
  "Neta",
  "Chery",
  "Tesla",
  "BMW",
  "Mercedes-Benz",
  "Lainnya",
];

export function UserSetupForm() {
  const router = useRouter();

  const [isPending, setIsPending] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const [
    reminderEnabled,
    setReminderEnabled,
  ] = useState(true);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage(null);
    setIsPending(true);

    const formData =
      new FormData(event.currentTarget);

    try {
      const response = await fetch(
        "/api/onboarding",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            vehicleName: String(
              formData.get(
                "vehicleName",
              ),
            ),

            vehicleBrand: String(
              formData.get(
                "vehicleBrand",
              ),
            ),

            vehicleModel: String(
              formData.get(
                "vehicleModel",
              ),
            ),

            batteryCapacityKwh:
              Number(
                formData.get(
                  "batteryCapacityKwh",
                ),
              ),

            plateNumber: String(
              formData.get(
                "plateNumber",
              ),
            ),

            electricityRate: Number(
              formData.get(
                "electricityRate",
              ),
            ),

            reminderEnabled,
          }),
        },
      );

      const result =
        (await response.json()) as
          SetupResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ??
            "Setup akun gagal disimpan.",
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Setup akun gagal disimpan.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="onboarding-form"
      onSubmit={handleSubmit}
    >
      <div className="onboarding-section-title">
        <span>
          <CarFront
            aria-hidden
            size={18}
          />
        </span>

        <div>
          <h2>Kendaraan utama</h2>

          <p>
            Dipakai untuk menghubungkan
            setiap sesi charging.
          </p>
        </div>
      </div>

      <div className="onboarding-grid">
        <label className="onboarding-field onboarding-field-wide">
          <span>
            Nama panggilan kendaraan
          </span>

          <input
            autoFocus
            name="vehicleName"
            placeholder="Contoh: Ioniq Kakak"
            required
            maxLength={60}
          />
        </label>

        <label className="onboarding-field">
          <span>Merek</span>

          <select
            name="vehicleBrand"
            required
            defaultValue=""
          >
            <option
              disabled
              value=""
            >
              Pilih merek
            </option>

            {VEHICLE_BRANDS.map(
              (brand) => (
                <option
                  key={brand}
                  value={brand}
                >
                  {brand}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="onboarding-field">
          <span>Model</span>

          <input
            name="vehicleModel"
            placeholder="Contoh: Ioniq 5"
            required
            maxLength={60}
          />
        </label>

        <label className="onboarding-field">
          <span>
            Kapasitas baterai
          </span>

          <div className="onboarding-input-unit">
            <input
              name="batteryCapacityKwh"
              type="number"
              min={5}
              max={250}
              step={0.1}
              placeholder="72.6"
              required
            />

            <span>kWh</span>
          </div>
        </label>

        <label className="onboarding-field">
          <span>Nomor polisi</span>

          <input
            name="plateNumber"
            placeholder="B 1234 EV"
            maxLength={20}
          />
        </label>
      </div>

      <div className="onboarding-divider" />

      <div className="onboarding-section-title">
        <span>
          <Zap
            aria-hidden
            size={18}
          />
        </span>

        <div>
          <h2>Profil listrik</h2>

          <p>
            Dipakai untuk menghitung
            biaya dan estimasi hemat.
          </p>
        </div>
      </div>

      <label className="onboarding-field onboarding-field-wide">
        <span>
          Tarif listrik rumah
        </span>

        <div className="onboarding-input-unit">
          <span>Rp</span>

          <input
            name="electricityRate"
            type="number"
            min={500}
            max={10000}
            step={1}
            defaultValue={1699}
            required
          />

          <span>/kWh</span>
        </div>

        <small>
          Sesuaikan dengan golongan
          tarif PLN yang digunakan
          untuk charging.
        </small>
      </label>

      <label className="onboarding-reminder">
        <span className="onboarding-reminder-icon">
          <BellRing
            aria-hidden
            size={18}
          />
        </span>

        <span>
          <strong>
            Pengingat ShiftMalam
          </strong>

          <small>
            Ingatkan saya ketika window
            off-peak dimulai.
          </small>
        </span>

        <input
          checked={reminderEnabled}
          onChange={(event) =>
            setReminderEnabled(
              event.target.checked,
            )
          }
          type="checkbox"
          aria-label="Aktifkan pengingat ShiftMalam"
        />
      </label>

      {errorMessage ? (
        <p
          className="onboarding-error"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        className="onboarding-submit"
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <LoaderCircle
            className="catat-spinner"
            size={18}
          />
        ) : (
          <ArrowRight
            aria-hidden
            size={18}
          />
        )}

        {isPending
          ? "Menyimpan setup..."
          : "Simpan dan buka dashboard"}
      </button>
    </form>
  );
}