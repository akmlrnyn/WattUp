"use client";

import {
  LoaderCircle,
} from "lucide-react";
import {
  useState,
} from "react";

import { authClient } from "@/modules/auth/presentation/auth-client";

export function GoogleSignInButton() {
  const [isPending, setIsPending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleGoogleSignIn() {
  await authClient.signIn.social({
    provider: "google",

    /*
     * Halaman ini menentukan apakah user menuju
     * onboarding, dashboard, atau admin.
     */
    callbackURL: "/auth/continue",
    newUserCallbackURL: "/auth/continue",

    /*
     * Jangan gunakan halaman error bawaan Better Auth.
     */
    errorCallbackURL:
      "/sign-in?provider=google",
  });
}

  return (
    <div className="google-auth-wrapper">
      <button
        className="google-auth-button"
        disabled={isPending}
        onClick={handleGoogleSignIn}
        type="button"
      >
        {isPending ? (
          <LoaderCircle
            aria-hidden
            className="auth-spinner"
            size={18}
          />
        ) : (
          <span
            aria-hidden
            className="google-auth-icon"
          >
            G
          </span>
        )}

        {isPending
          ? "Menghubungkan..."
          : "Lanjutkan dengan Google"}
      </button>

      {errorMessage ? (
        <p
          className="auth-form-error"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}