import Link from "next/link";

import { SignOutButton } from "@/modules/auth/presentation/components/sign-out-button";
import { requireUser } from "@/modules/auth/presentation/server/auth-guard";

export default async function DashboardPage() {
  const session = await requireUser();

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-emerald-600">WattUp</p>
            <h1 className="text-2xl font-bold">
              Halo, {session.user.name}
            </h1>
          </div>

          <SignOutButton />
        </header>

        <section className="mt-8 rounded-3xl bg-emerald-600 p-6 text-white">
          <p className="text-sm text-emerald-100">Total penghematan</p>
          <p className="mt-2 text-4xl font-bold">Rp0</p>
          <p className="mt-2 text-sm text-emerald-100">
            Catat sesi charging pertamamu untuk mulai menghitung.
          </p>
        </section>

        {session.user.role === "admin" && (
          <Link
            href="/admin"
            className="mt-6 inline-block font-semibold text-emerald-700"
          >
            Buka dashboard admin →
          </Link>
        )}
      </div>
    </main>
  );
}