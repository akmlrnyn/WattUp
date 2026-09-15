import Link from "next/link";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/modules/auth/presentation/components/google-sign-in-button";
import { SignUpForm } from "@/modules/auth/presentation/components/sign-up-form";
import { getCurrentSession } from "@/modules/auth/presentation/server/auth-guard";
import { BrandWordmark } from "@/shared/presentation/components/brand-mark";

export default async function SignUpPage() {
  const session =
    await getCurrentSession();

  if (session) {
    redirect("/auth/continue");
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

        <GoogleSignInButton />

        <div className="auth-divider">
          <span>atau daftar dengan email</span>
        </div>

        <SignUpForm />

        <nav
          aria-label="Dokumen WattUp"
          className="auth-legal-links"
        >
          <Link href="/privacy">
            Privasi
          </Link>
          <span aria-hidden>·</span>
          <Link href="/terms">
            Ketentuan
          </Link>
          <span aria-hidden>·</span>
          <Link href="/data-deletion">
            Penghapusan data
          </Link>
        </nav>
      </section>
    </main>
  );
}
