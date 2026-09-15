"use client";

import {
  CheckCircle2,
  LoaderCircle,
  Mail,
} from "lucide-react";
import { useState } from "react";

import { authClient } from "@/modules/auth/presentation/auth-client";

interface VerifyEmailCardProps {
  email: string;
}

export function VerifyEmailCard({
  email,
}: VerifyEmailCardProps) {
  const [isSending, setIsSending] =
    useState(false);

  const [isSent, setIsSent] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleResend() {
    if (isSending) {
      return;
    }

    setIsSending(true);
    setIsSent(false);
    setErrorMessage(null);

    const { error } =
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/auth/continue",
      });

    if (error) {
      setErrorMessage(
        error.message ??
          "Email verifikasi gagal dikirim.",
      );

      setIsSending(false);
      return;
    }

    setIsSent(true);
    setIsSending(false);
  }

  return (
    <section className="verify-email-card">
      <div className="verify-email-icon">
        <Mail
          aria-hidden
          size={28}
          strokeWidth={1.8}
        />
      </div>

      <span className="verify-email-step">
        Satu langkah lagi
      </span>

      <h1>Periksa email kamu</h1>

      <p>
        Kami mengirimkan link verifikasi ke:
      </p>

      <strong className="verify-email-address">
        {email}
      </strong>

      <p>
        Klik link di email tersebut untuk membuka
        dashboard WattUp.
      </p>

      {isSent ? (
        <div className="verify-email-success">
          <CheckCircle2
            aria-hidden
            size={17}
          />

          Email verifikasi berhasil dikirim ulang.
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className="verify-email-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <button
        type="button"
        className="primary-button"
        disabled={isSending}
        onClick={handleResend}
      >
        {isSending ? (
          <>
            <LoaderCircle
              aria-hidden
              className="button-spinner"
              size={17}
            />
            Mengirim...
          </>
        ) : (
          "Kirim ulang email"
        )}
      </button>

      <small>
        Tidak menerima email? Periksa folder spam
        atau pastikan alamat emailmu sudah benar.
      </small>
    </section>
  );
}