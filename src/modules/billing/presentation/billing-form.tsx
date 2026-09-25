"use client";

import {
  CheckCircle2,
  Info,
  LoaderCircle,
  ReceiptText,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { billingLabels, type BillingType } from "../domain/billing";

interface BillingFormProps {
  billingType: BillingType | null;
  electricityRate: number;
  discountPercent: number;
  completion?: boolean;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
}

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 2,
});

export function BillingForm({
  billingType: initialBillingType,
  electricityRate: initialElectricityRate,
  discountPercent,
  completion = false,
}: BillingFormProps) {
  const router = useRouter();
  const [billingType, setBillingType] = useState<BillingType | "">(
    initialBillingType ?? "",
  );
  const [electricityRate, setElectricityRate] = useState(
    String(initialElectricityRate),
  );
  const [savedBillingType, setSavedBillingType] = useState<BillingType | null>(
    initialBillingType,
  );
  const [savedElectricityRate, setSavedElectricityRate] = useState(
    initialElectricityRate,
  );
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const rate = Number(electricityRate);
  const rateIsValid =
    electricityRate.trim() !== "" &&
    Number.isFinite(rate) &&
    rate >= 500 &&
    rate <= 10_000;
  const dirty =
    billingType !== (savedBillingType ?? "") ||
    !Number.isFinite(rate) ||
    rate !== savedElectricityRate;
  const canSubmit = Boolean(billingType) && rateIsValid && dirty && !pending;

  function markChanged() {
    if (feedback) setFeedback(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !billingType) return;

    setPending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingType, electricityRate: rate }),
      });
      const result = (await response.json()) as ProfileResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Profil listrik gagal disimpan.");
      }

      setSavedBillingType(billingType);
      setSavedElectricityRate(rate);
      setFeedback({
        type: "success",
        message:
          "Profil listrik tersimpan. Sesi sebelumnya tetap memakai tarif dan jenis pembayaran saat dicatat.",
      });

      if (completion) {
        router.replace("/dashboard");
      }
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Profil listrik gagal disimpan.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="billing-settings-form" onSubmit={submit}>
      <section className="billing-settings-section">
        <div className="billing-settings-heading">
          <span>1</span>
          <div>
            <h2>Mekanisme pembayaran listrik</h2>
            <p>Pilih cara pembayaran listrik di rumahmu.</p>
          </div>
        </div>

        <fieldset className="billing-type-options">
          <legend className="sr-only">Jenis pembayaran listrik</legend>
          {(["PREPAID", "POSTPAID"] as const).map((value) => {
            const selected = billingType === value;
            return (
              <label className={selected ? "selected" : ""} key={value}>
                <input
                  checked={selected}
                  name="billingType"
                  onChange={() => {
                    setBillingType(value);
                    markChanged();
                  }}
                  required
                  type="radio"
                  value={value}
                />
                <span className="billing-type-icon">
                  {value === "PREPAID" ? (
                    <WalletCards aria-hidden size={21} />
                  ) : (
                    <ReceiptText aria-hidden size={21} />
                  )}
                </span>
                <span>
                  <strong>{billingLabels[value]}</strong>
                  <small>
                    {value === "PREPAID"
                      ? "Energi dibeli lebih dulu dan saldo kWh berkurang saat digunakan."
                      : "Energi digunakan lebih dulu lalu dibayar melalui tagihan bulanan."}
                  </small>
                </span>
                <i aria-hidden />
              </label>
            );
          })}
        </fieldset>
      </section>

      <section className="billing-settings-section">
        <div className="billing-settings-heading">
          <span>2</span>
          <div>
            <h2>Tarif listrik</h2>
            <p>Tarif ini dipakai untuk estimasi sesi berikutnya.</p>
          </div>
        </div>

        <label className="billing-rate-field" htmlFor="electricity-rate">
          <span>Tarif PLN yang berlaku</span>
          <div className={rateIsValid ? "" : "invalid"}>
            <span>Rp</span>
            <input
              aria-describedby="electricity-rate-help electricity-rate-error"
              aria-invalid={!rateIsValid}
              id="electricity-rate"
              inputMode="decimal"
              max="10000"
              min="500"
              name="electricityRate"
              onChange={(event) => {
                setElectricityRate(event.target.value);
                markChanged();
              }}
              required
              step="0.01"
              type="number"
              value={electricityRate}
            />
            <span>/ kWh</span>
          </div>
          <small id="electricity-rate-help">
            Sesuaikan dengan golongan tarif PLN yang digunakan untuk charging
            {rateIsValid ? ` · ${currencyFormatter.format(rate)}/kWh` : ""}.
          </small>
          {!rateIsValid ? (
            <small className="billing-field-error" id="electricity-rate-error">
              Tarif harus lebih dari nol dan berada di antara Rp500–Rp10.000/kWh.
            </small>
          ) : null}
        </label>
      </section>

      <section className="billing-settings-section">
        <div className="billing-settings-heading">
          <span>3</span>
          <div>
            <h2>Asumsi diskon dan off-peak</h2>
            <p>Konfigurasi ini dipakai sebagai simulasi penghematan.</p>
          </div>
        </div>

        <dl className="billing-assumption-grid">
          <div>
            <dt>Periode off-peak</dt>
            <dd>22.00–05.00 WIB</dd>
          </div>
          <div>
            <dt>Asumsi diskon</dt>
            <dd>{discountPercent.toLocaleString("id-ID")}%</dd>
          </div>
        </dl>

        <div className="billing-assumption-note">
          <Info aria-hidden size={17} />
          <p>
            Program PLN Home Charging Services 2.0 yang terdokumentasi berlaku 1 Juli 2025–30 Juni 2026. Periode tersebut telah berakhir, sehingga WattUp menampilkan nilai ini sebagai asumsi simulasi. Hasil aktual dapat berbeda sesuai ketentuan PLN.
          </p>
        </div>
      </section>

      <details className="billing-calculation-details">
        <summary>Bagaimana estimasi dihitung?</summary>
        <div>
          <p><strong>Estimasi biaya normal</strong> = energi kWh × tarif listrik.</p>
          <p><strong>Estimasi penghematan</strong> = energi off-peak yang memenuhi syarat × tarif × asumsi diskon.</p>
          <p>
            {billingType === "PREPAID"
              ? "Untuk prabayar, hasil biaya menggambarkan estimasi nilai energi yang digunakan."
              : billingType === "POSTPAID"
                ? "Untuk pascabayar, hasil biaya menggambarkan estimasi tambahan tagihan listrik."
                : "Pilih mekanisme pembayaran untuk melihat cara WattUp menjelaskan hasil biaya."}
          </p>
          <small>Estimasi WattUp bukan invoice resmi atau jaminan diskon dari PLN.</small>
        </div>
      </details>

      {feedback ? (
        <div className={`billing-feedback ${feedback.type}`} role="status">
          {feedback.type === "success" ? (
            <CheckCircle2 aria-hidden size={18} />
          ) : (
            <TriangleAlert aria-hidden size={18} />
          )}
          <div>
            <strong>{feedback.type === "success" ? "Perubahan tersimpan" : "Perubahan belum tersimpan"}</strong>
            <span>{feedback.message}</span>
          </div>
        </div>
      ) : null}

      <div className="billing-save-bar">
        <span className={dirty ? "unsaved" : "saved"}>
          {dirty ? "Ada perubahan yang belum disimpan" : "Semua perubahan sudah tersimpan"}
        </span>
        <button disabled={!canSubmit} type="submit">
          {pending ? <LoaderCircle aria-hidden className="catat-spinner" size={17} /> : null}
          {pending ? "Menyimpan..." : "Simpan profil listrik"}
        </button>
      </div>
    </form>
  );
}
