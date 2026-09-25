import { ArrowLeft, ArrowRight, Filter, History, Plus } from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/modules/auth/presentation/server/auth-guard";
import { ChargingHistoryList } from "@/modules/charging/presentation/components/charging-history-list";
import { prisma } from "@/shared/infrastructure/database/prisma";

const PAGE_SIZE = 20;

function pageHref(page: number, vehicleId?: string): string {
  const search = new URLSearchParams();
  if (vehicleId) search.set("vehicle", vehicleId);
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/sessions?${query}` : "/sessions";
}

export default async function ChargingHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; vehicle?: string }>;
}) {
  const { user } = await requireUser();
  const query = await searchParams;
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id },
    orderBy: [
      { archivedAt: "asc" },
      { isPrimary: "desc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      name: true,
      archivedAt: true,
    },
  });
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === query.vehicle);
  const where = selectedVehicle
    ? { userId: user.id, vehicleId: selectedVehicle.id }
    : { userId: user.id };
  const totalSessions = await prisma.chargingSession.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalSessions / PAGE_SIZE));
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const sessions = await prisma.chargingSession.findMany({
    where,
    include: { vehicle: { select: { name: true } } },
    orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const historyItems = sessions.map((session) => ({
    id: session.id,
    vehicleLabel: session.vehicle?.name ?? null,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    energyKwh: Number(session.energyKwh),
    discountedEnergyKwh: Number(session.discountedEnergyKwh),
    savingsAmount: Number(session.savingsAmount),
    shiftScore: Number(session.shiftScore),
  }));

  return (
    <div className="charging-history-page">
      <header className="charging-history-page-heading">
        <div>
          <span className="page-eyebrow">Catatan charging</span>
          <h1>Riwayat Charging</h1>
          <p>
            Tinjau energi, waktu, estimasi penghematan, dan ShiftMalam Score dari seluruh kendaraanmu.
          </p>
        </div>
        <Link className="vehicle-start-button" href="/sessions/new">
          <Plus aria-hidden size={17} />
          Catat sesi baru
        </Link>
      </header>

      <section className="charging-history-filter" aria-label="Filter riwayat charging">
        <form action="/sessions" method="get">
          <label htmlFor="history-vehicle">
            <span><Filter aria-hidden size={15} /> Kendaraan</span>
            <select defaultValue={selectedVehicle?.id ?? ""} id="history-vehicle" name="vehicle">
              <option value="">Semua kendaraan</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}{vehicle.archivedAt ? " · Diarsipkan" : ""}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Terapkan filter</button>
          {selectedVehicle ? <Link href="/sessions">Hapus filter</Link> : null}
        </form>
        <p>
          {selectedVehicle
            ? `${totalSessions} sesi untuk ${selectedVehicle.name}. Filter ini tidak mengubah total dashboard.`
            : `${totalSessions} sesi dari seluruh kendaraan. Terbaru ditampilkan lebih dulu.`}
        </p>
      </section>

      <section className="charging-history-panel" aria-labelledby="all-history-title">
        <div className="charging-history-panel-heading">
          <div>
            <span><History aria-hidden size={18} /></span>
            <div>
              <h2 id="all-history-title">
                {selectedVehicle ? `Riwayat ${selectedVehicle.name}` : "Semua sesi charging"}
              </h2>
              <p>Halaman {currentPage} dari {totalPages}</p>
            </div>
          </div>
        </div>

        <ChargingHistoryList
          emptyDescription={
            selectedVehicle
              ? `Belum ada sesi charging yang tercatat untuk ${selectedVehicle.name}.`
              : "Sesi yang kamu catat akan tersusun di sini."
          }
          emptyTitle={selectedVehicle ? "Riwayat kendaraan masih kosong" : "Belum ada riwayat charging"}
          sessions={historyItems}
        />

        {totalPages > 1 ? (
          <nav aria-label="Paginasi riwayat" className="charging-history-pagination">
            {currentPage > 1 ? (
              <Link href={pageHref(currentPage - 1, selectedVehicle?.id)}>
                <ArrowLeft aria-hidden size={15} />
                Sebelumnya
              </Link>
            ) : <span />}
            <strong>{currentPage} / {totalPages}</strong>
            {currentPage < totalPages ? (
              <Link href={pageHref(currentPage + 1, selectedVehicle?.id)}>
                Berikutnya
                <ArrowRight aria-hidden size={15} />
              </Link>
            ) : <span />}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
