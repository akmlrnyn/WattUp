import { redirect } from "next/navigation";

import { SignUpForm } from "@/modules/auth/presentation/components/sign-up-form";
import { getCurrentSession } from "@/modules/auth/presentation/server/auth-guard";

export default async function SignUpPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-sm">
        <p className="font-semibold text-emerald-600">WattUp</p>
        <h1 className="mt-2 text-3xl font-bold">Buat akun</h1>
        <p className="mb-8 mt-2 text-neutral-600">
          Mulai pantau charging dan penghematan listrikmu.
        </p>

        <SignUpForm />
      </section>
    </main>
  );
}