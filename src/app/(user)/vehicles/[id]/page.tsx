import {
  Archive,
  ArrowLeft,
  BatteryCharging,
  CalendarClock,
  CarFront,
  CircleDollarSign,
  Gauge,
  History,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { ChargingHistoryList } from "@/modules/charging/presentation/components/charging-history-list";
import { VehicleControls } from "@/modules/vehicles/presentation/vehicle-controls";
import { prisma } from "@/shared/infrastructure/database/prisma";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireUser();
  const { id } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id, userId: user.id },
  });

  if (!vehicle) notFound();

  const where = { userId: user.id, vehicleId: id };
  const [summary, sessions] = await Promise.all([
    prisma.chargingSession.aggregate({
      where,
      _count: { _all: true },
      _sum: { energyKwh: true, savingsAmount: true },
      _avg: { shiftScore: true },
    }),
    prisma.chargingSession.findMany({
      where,
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      take: 8,
    }),
  ]);

  const archived = Boolean(vehicle.archivedAt);
  const lastSession = sessions[0];
  const statistics = [
    {
      label: "Jumlah sesi",
      value: String(summary._count._all),
      icon: BatteryCharging,
    },
    {
      label: "Total energi",
      value: `${Number(summary._sum.energyKwh ?? 0).toFixed(1)} kWh`,
      icon: Gauge,
    },
    {
      label: "Estimasi hemat",
      value: currencyFormatter.format(Number(summary._sum.savingsAmount ?? 0)),
      icon: CircleDollarSign,
    },
    {
      label: "Rata-rata score",
      value:
        summary._avg.shiftScore === null
          ? "—"
          : Number(summary._avg.shiftScore).toFixed(2),
      icon: Star,
    },
    {
      label: "Charging terakhir",
      value: lastSession ? dateFormatter.format(lastSession.startedAt) : "Belum ada",
      icon: CalendarClock,
    },
  ];

  const historyItems = sessions.map((session) => ({
    id: session.id,
    vehicleLabel: vehicle.name,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    energyKwh: Number(session.energyKwh),
    discountedEnergyKwh: Number(session.discountedEnergyKwh),
    savingsAmount: Number(session.savingsAmount),
    shiftScore: Number(session.shiftScore),
  }));

  return (
    <div className="vehicle-detail-page">
      <Link className="vehicle-back-link" href="/vehicles">
        <ArrowLeft aria-hidden size={16} />
        Kendaraan Saya
      </Link>

      <header className="vehicle-detail-header">
        <div className="vehicle-detail-identity">
          <span className="vehicle-detail-icon">
            <CarFront aria-hidden size={27} />
          </span>
          <div>
            <div className="vehicle-detail-badges">
              <span className={`vehicle-status ${archived ? "vehicle-status-archived" : ""}`}>
                {archived ? <Archive aria-hidden size={13} /> : null}
                {archived ? "Diarsipkan" : "Aktif"}
              </span>
              {vehicle.isPrimary && !archived ? (
                <span className="vehicle-status vehicle-status-primary">
                  <Star aria-hidden fill="currentColor" size={13} />
                  Kendaraan utama
                </span>
              ) : null}
            </div>
            <h1>{vehicle.name}</h1>
            <p>{[vehicle.brand, vehicle.model].filter(Boolean).join(" · ")}</p>
          </div>
        </div>

        <div className="vehicle-detail-actions">
          {!archived ? (
            <Link className="vehicle-start-button" href={`/sessions/new?vehicle=${vehicle.id}`}>
              <Zap aria-hidden size={17} />
              Catat charging
            </Link>
          ) : null}
          {!archived ? (
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
      </header>

      {archived ? (
        <aside className="vehicle-archived-banner">
          <Archive aria-hidden size={19} />
          <div>
            <strong>Kendaraan ini sudah diarsipkan</strong>
            <p>
              Riwayat charging tetap tersimpan dan dapat dibaca. Kendaraan ini tidak tersedia untuk sesi charging baru.
            </p>
          </div>
        </aside>
      ) : null}

      <section aria-labelledby="vehicle-performance-title" className="vehicle-detail-section">
        <div className="vehicle-detail-section-heading">
          <div>
            <span className="page-eyebrow">Performa kendaraan</span>
            <h2 id="vehicle-performance-title">Ringkasan charging</h2>
          </div>
          <small>Seluruh riwayat {vehicle.name}</small>
        </div>

        <div className="vehicle-detail-stats">
          {statistics.map(({ label, value, icon: Icon }) => (
            <article key={label}>
              <span><Icon aria-hidden size={17} /></span>
              <div>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="vehicle-history-title" className="vehicle-history-panel">
        <div className="vehicle-detail-section-heading vehicle-history-heading">
          <div>
            <span className="page-eyebrow">Riwayat kendaraan</span>
            <h2 id="vehicle-history-title">Sesi charging terbaru</h2>
            <p>Hanya menampilkan sesi yang tercatat untuk {vehicle.name}.</p>
          </div>
          <Link href={`/sessions?vehicle=${vehicle.id}`}>
            <History aria-hidden size={16} />
            Lihat semua riwayat
          </Link>
        </div>

        <ChargingHistoryList
          emptyDescription={`Sesi charging untuk ${vehicle.name} akan muncul di sini setelah dicatat.`}
          emptyTitle={`Belum ada riwayat untuk ${vehicle.name}`}
          sessions={historyItems}
          showVehicle={false}
        />
      </section>
    </div>
  );
}
