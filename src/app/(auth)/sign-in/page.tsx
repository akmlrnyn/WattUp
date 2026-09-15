import Link from "next/link";
import { redirect } from "next/navigation";

import { Suspense } from "react";

import { OAuthErrorMessage } from "@/modules/auth/presentation/components/oauth-error-message";

import { SignInForm } from "@/modules/auth/presentation/components/sign-in-form";
import { getCurrentSession } from "@/modules/auth/presentation/server/auth-guard";
import { BrandWordmark } from "@/shared/presentation/components/brand-mark";
import { GoogleSignInButton } from "@/modules/auth/presentation/components/google-sign-in-button";

export default async function SignInPage() {
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

        <GoogleSignInButton />

        <div className="auth-divider">
          <span>atau masuk dengan email</span>
        </div>

        <Suspense fallback={null}>
          <OAuthErrorMessage />
        </Suspense>

        <SignInForm />

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
