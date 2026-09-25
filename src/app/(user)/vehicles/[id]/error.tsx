"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function VehicleDetailError({ reset }: { reset: () => void }) {
  return (
    <section className="feature-error-state" role="alert">
      <span><TriangleAlert aria-hidden size={27} /></span>
      <h1>Detail kendaraan belum dapat dimuat</h1>
      <p>Coba muat kembali. Kendaraan dan riwayat charging yang sudah tersimpan tidak berubah.</p>
      <div>
        <button onClick={reset} type="button">
          <RotateCcw aria-hidden size={16} />
          Coba lagi
        </button>
        <Link href="/vehicles">Kembali ke Kendaraan Saya</Link>
      </div>
    </section>
  );
}
