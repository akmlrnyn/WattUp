import { CarFront } from "lucide-react";
import Link from "next/link";

export default function VehicleNotFound() {
  return (
    <section className="feature-error-state">
      <span><CarFront aria-hidden size={27} /></span>
      <h1>Kendaraan tidak ditemukan</h1>
      <p>Kendaraan ini tidak tersedia di akunmu atau tautannya sudah tidak valid.</p>
      <div><Link href="/vehicles">Kembali ke Kendaraan Saya</Link></div>
    </section>
  );
}
