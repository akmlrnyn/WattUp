import { redirect } from "next/navigation";

import { SignUpForm } from "@/modules/auth/presentation/components/sign-up-form";
import { getCurrentSession } from "@/modules/auth/presentation/server/auth-guard";
import { BrandWordmark } from "@/shared/presentation/components/brand-mark";

export default async function SignUpPage() {
  const session =
    await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="onboarding-page auth-entry-page">
      <section className="onboarding-card auth-entry-card">
        <header className="onboarding-heading auth-entry-heading">
          <div>
            <BrandWordmark
              className="onboarding-logo"
              priority
            />

            <span>
              Langkah 1 dari 2
            </span>
          </div>

          <h1>
            Mulai perjalanan ShiftMalam
          </h1>

          <p>
            Buat akun WattUp, lalu
            hubungkan kendaraan listrikmu
            agar setiap penghematan dapat
            dihitung lebih akurat.
          </p>
        </header>

        <SignUpForm />
      </section>
    </main>
  );
}