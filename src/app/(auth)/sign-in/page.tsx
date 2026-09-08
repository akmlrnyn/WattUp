import { redirect } from "next/navigation";

import { SignInForm } from "@/modules/auth/presentation/components/sign-in-form";
import { getCurrentSession } from "@/modules/auth/presentation/server/auth-guard";
import { BrandWordmark } from "@/shared/presentation/components/brand-mark";

export default async function SignInPage() {
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

            <span>Akses akun</span>
          </div>

          <h1>
            Selamat datang kembali
          </h1>

          <p>
            Masuk untuk melihat aktivitas
            charging, penghematan, dan
            progres #ShiftMalam kamu.
          </p>
        </header>

        <SignInForm />
      </section>
    </main>
  );
}