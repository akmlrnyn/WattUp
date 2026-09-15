"use client";

import { useSearchParams } from "next/navigation";

const oauthErrorMessages: Record<string, string> = {
  account_not_linked:
    "Email ini sudah terdaftar menggunakan metode login lain dan belum dapat dihubungkan otomatis. Masuk menggunakan email dan password, atau hubungi dukungan WattUp.",

  account_already_linked_to_different_user:
    "Akun Google ini sudah terhubung dengan akun WattUp lain.",

  access_denied:
    "Login Google dibatalkan. Silakan coba kembali jika ingin melanjutkan.",

  unable_to_create_session:
    "WattUp tidak dapat membuat sesi login. Silakan coba kembali.",

  oauth_callback_error:
    "Login Google tidak dapat diselesaikan. Silakan coba kembali.",
};

export function OAuthErrorMessage() {
  const searchParams = useSearchParams();

  const rawError =
    searchParams.get("error") ??
    searchParams.get("code");

  if (!rawError) {
    return null;
  }

  const normalizedError =
    rawError.toLowerCase();

  const message =
    oauthErrorMessages[normalizedError] ??
    "Login Google mengalami masalah. Silakan coba kembali.";

  return (
    <div
      className="auth-oauth-error"
      role="alert"
      aria-live="polite"
    >
      <strong>Login Google gagal</strong>
      <span>{message}</span>
    </div>
  );
}
