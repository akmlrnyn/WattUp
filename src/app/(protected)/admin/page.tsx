import Link from "next/link";

import { requireAdmin } from "@/modules/auth/presentation/server/auth-guard";

export default async function AdminPage() {
  const session = await requireAdmin();

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="font-semibold text-emerald-400">WattUp Admin</p>
        <h1 className="mt-2 text-3xl font-bold">Pilot Dashboard</h1>
        <p className="mt-2 text-neutral-400">
          Login sebagai {session.user.email}
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {["Total tester", "Total energi", "Total penghematan"].map(
            (label) => (
              <article
                key={label}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
              >
                <p className="text-sm text-neutral-400">{label}</p>
                <p className="mt-2 text-3xl font-bold">0</p>
              </article>
            ),
          )}
        </section>

        <Link
          href="/dashboard"
          className="mt-8 inline-block text-emerald-400"
        >
          ← Kembali ke dashboard user
        </Link>
      </div>
    </main>
  );
}