"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function ChargingHistoryError({ reset }: { reset: () => void }) {
  return (
    <section className="feature-error-state" role="alert">
      <span><TriangleAlert aria-hidden size={27} /></span>
      <h1>Riwayat belum dapat dimuat</h1>
      <p>Coba lagi beberapa saat. Sesi charging yang sudah tersimpan tidak berubah.</p>
      <div>
        <button onClick={reset} type="button">
          <RotateCcw aria-hidden size={16} />
          Coba lagi
        </button>
        <Link href="/dashboard">Kembali ke dashboard</Link>
      </div>
    </section>
  );
}
