import {
  Archive,
  BatteryCharging,
  CarFront,
  ChevronDown,
  CircleDollarSign,
  Gauge,
  History,
  Settings2,
  Star,
} from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { VehicleControls } from "@/modules/vehicles/presentation/vehicle-controls";
import { prisma } from "@/shared/infrastructure/database/prisma";

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function VehiclesPage() {
  const { user } = await requireUser();
  const [vehicles, aggregates] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId: user.id },
      orderBy: [
        { archivedAt: "asc" },
        { isPrimary: "desc" },
        { createdAt: "asc" },
      ],
    }),
    prisma.chargingSession.groupBy({
      by: ["vehicleId"],
      where: { userId: user.id },
      _count: { _all: true },
      _sum: {
        energyKwh: true,
        savingsAmount: true,
      },
      _avg: { shiftScore: true },
    }),
  ]);

  const summaries = new Map(
    aggregates.map((aggregate) => [
      aggregate.vehicleId,
      aggregate,
    ]),
  );
  const activeVehicles = vehicles.filter(
    (vehicle) => !vehicle.archivedAt,
  );
  const primaryVehicle = activeVehicles.find(
    (vehicle) => vehicle.isPrimary,
  );
  const otherVehicles = activeVehicles.filter(
    (vehicle) => !vehicle.isPrimary,
  );
  const archivedVehicles = vehicles.filter(
    (vehicle) => vehicle.archivedAt,
  );

  function vehicleCard(
    vehicle: (typeof vehicles)[number],
    variant: "primary" | "active" | "archived",
  ) {
    const summary = summaries.get(vehicle.id);

    return (
      <article
        className={`vehicle-card vehicle-card-${variant}`}
        key={vehicle.id}
      >
        <div className="vehicle-card-topline">
          <span className="vehicle-card-icon">
            <CarFront aria-hidden size={22} />
          </span>
          <span className={`vehicle-status vehicle-status-${variant}`}>
            {variant === "primary" ? (
              <Star aria-hidden fill="currentColor" size={13} />
            ) : variant === "archived" ? (
              <Archive aria-hidden size={13} />
            ) : null}
            {variant === "primary"
              ? "Kendaraan utama"
              : variant === "archived"
                ? "Diarsipkan"
                : "Aktif"}
          </span>
        </div>

        <div className="vehicle-card-title">
          <h3>{vehicle.name}</h3>
          <p>
            {[vehicle.brand, vehicle.model]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <dl className="vehicle-summary">
          <div>
            <dt><BatteryCharging aria-hidden size={14} /> Sesi</dt>
            <dd>{summary?._count._all ?? 0}</dd>
          </div>
          <div>
            <dt><Gauge aria-hidden size={14} /> Total energi</dt>
            <dd>{Number(summary?._sum.energyKwh ?? 0).toFixed(1)} kWh</dd>
          </div>
          <div>
            <dt><CircleDollarSign aria-hidden size={14} /> Total hemat</dt>
            <dd>{formatRupiah(Number(summary?._sum.savingsAmount ?? 0))}</dd>
          </div>
          <div>
            <dt><Star aria-hidden size={14} /> Rata-rata score</dt>
            <dd>{Number(summary?._avg.shiftScore ?? 0).toFixed(2)}</dd>
          </div>
        </dl>

        <div className="vehicle-card-footer">
          <Link
            className="vehicle-history-link"
            href={`/vehicles/${vehicle.id}`}
          >
            <History aria-hidden size={16} />
            Lihat riwayat
          </Link>

          {variant !== "archived" ? (
            <VehicleControls
              vehicle={{
                id: vehicle.id,
                name: vehicle.name,
                brand: vehicle.brand,
                model: vehicle.model,
                isPrimary: vehicle.isPrimary,
              }}
            />
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <div className="vehicles-page">
      <header className="vehicles-heading">
        <div>
          <span className="page-eyebrow">Garasi WattUp</span>
          <h1>Kendaraan Saya</h1>
          <p>
            Kelola kendaraan yang digunakan untuk mencatat charging. Dashboard, streak, dan peringkat tetap dihitung untuk seluruh akunmu.
          </p>
        </div>

        <div className="vehicles-heading-actions">
          <Link className="vehicle-profile-link" href="/profile">
            <Settings2 aria-hidden size={17} />
            Profil listrik
          </Link>
          <VehicleControls />
        </div>
      </header>

      {activeVehicles.length === 0 ? (
        <section className="vehicle-empty-state">
          <span><CarFront aria-hidden size={28} /></span>
          <h2>Belum ada kendaraan aktif</h2>
          <p>
            Tambahkan merek dan model kendaraan agar kamu bisa mencatat sesi charging baru. Riwayat kendaraan yang pernah diarsipkan tetap aman.
          </p>
        </section>
      ) : (
        <>
          {primaryVehicle ? (
            <section className="vehicle-section">
              <div className="vehicle-section-heading">
                <div>
                  <h2>Kendaraan utama</h2>
                  <p>Dipilih otomatis saat kamu mencatat sesi baru.</p>
                </div>
              </div>
              <div className="vehicle-primary-grid">
                {vehicleCard(primaryVehicle, "primary")}
              </div>
            </section>
          ) : null}

          {otherVehicles.length > 0 ? (
            <section className="vehicle-section">
              <div className="vehicle-section-heading">
                <div>
                  <h2>Kendaraan aktif lainnya</h2>
                  <p>Pilih kendaraan utama atau buka riwayat masing-masing kendaraan.</p>
                </div>
                <strong>{otherVehicles.length} kendaraan</strong>
              </div>
              <div className="vehicle-grid">
                {otherVehicles.map((vehicle) =>
                  vehicleCard(vehicle, "active"),
                )}
              </div>
            </section>
          ) : null}
        </>
      )}

      {archivedVehicles.length > 0 ? (
        <details className="vehicle-archive-section">
          <summary>
            <span>
              <Archive aria-hidden size={17} />
              <h2>Kendaraan diarsipkan</h2>
              <small>{archivedVehicles.length}</small>
            </span>
            <ChevronDown aria-hidden size={18} />
          </summary>
          <p className="vehicle-archive-copy">
            Kendaraan ini tidak dapat dipakai untuk sesi baru. Riwayat charging tetap dapat dibuka.
          </p>
          <div className="vehicle-grid vehicle-archive-grid">
            {archivedVehicles.map((vehicle) =>
              vehicleCard(vehicle, "archived"),
            )}
          </div>
        </details>
      ) : null}
    </div>
  );
}
