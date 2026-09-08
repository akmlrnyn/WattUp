"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";

import { authClient } from "@/modules/auth/presentation/auth-client";

export function SignUpForm() {
  const router = useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const [
    isPending,
    setIsPending,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData =
      new FormData(
        event.currentTarget,
      );

    const password = String(
      formData.get("password"),
    );

    const passwordConfirmation =
      String(
        formData.get(
          "passwordConfirmation",
        ),
      );

    if (
      password !==
      passwordConfirmation
    ) {
      setErrorMessage(
        "Konfirmasi password tidak sama.",
      );

      return;
    }

    setErrorMessage(null);
    setIsPending(true);

    const { error } =
      await authClient.signUp.email({
        name: String(
          formData.get("name"),
        ),

        email: String(
          formData.get("email"),
        ),

        password,
      });

    if (error) {
      setErrorMessage(
        error.message ??
          "Registrasi gagal.",
      );

      setIsPending(false);
      return;
    }

    router.replace("/onboarding");
    router.refresh();
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <label className="auth-field">
        <span>Nama lengkap</span>

        <div className="auth-input-shell">
          <UserRound
            aria-hidden
            size={18}
          />

          <input
            autoComplete="name"
            maxLength={80}
            name="name"
            placeholder="Nama lengkap kamu"
            required
          />
        </div>
      </label>

      <label className="auth-field">
        <span>Email</span>

        <div className="auth-input-shell">
          <Mail
            aria-hidden
            size={18}
          />

          <input
            autoComplete="email"
            name="email"
            placeholder="nama@email.com"
            required
            type="email"
          />
        </div>
      </label>

      <div className="auth-password-grid">
        <label className="auth-field">
          <span>Password</span>

          <div className="auth-input-shell">
            <LockKeyhole
              aria-hidden
              size={18}
            />

            <input
              autoComplete="new-password"
              minLength={8}
              name="password"
              placeholder="Minimal 8 karakter"
              required
              type={
                showPassword
                  ? "text"
                  : "password"
              }
            />

            <button
              aria-label={
                showPassword
                  ? "Sembunyikan password"
                  : "Tampilkan password"
              }
              className="auth-password-toggle"
              onClick={() =>
                setShowPassword(
                  (value) => !value,
                )
              }
              type="button"
            >
              {showPassword ? (
                <EyeOff
                  aria-hidden
                  size={17}
                />
              ) : (
                <Eye
                  aria-hidden
                  size={17}
                />
              )}
            </button>
          </div>
        </label>

        <label className="auth-field">
          <span>
            Konfirmasi password
          </span>

          <div className="auth-input-shell">
            <LockKeyhole
              aria-hidden
              size={18}
            />

            <input
              autoComplete="new-password"
              minLength={8}
              name="passwordConfirmation"
              placeholder="Ulangi password"
              required
              type={
                showPassword
                  ? "text"
                  : "password"
              }
            />
          </div>
        </label>
      </div>

      <p className="auth-form-hint">
        Setelah akun dibuat, kamu akan
        mengatur kendaraan EV dan profil
        listrik.
      </p>

      {errorMessage ? (
        <p
          className="auth-form-error"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        className="auth-submit-button"
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <LoaderCircle
            className="auth-spinner"
            size={18}
          />
        ) : (
          <ArrowRight
            aria-hidden
            size={18}
          />
        )}

        {isPending
          ? "Membuat akun..."
          : "Lanjutkan ke setup EV"}
      </button>

      <p className="auth-switch-copy">
        Sudah punya akun?{" "}

        <Link href="/sign-in">
          Masuk
        </Link>
      </p>
    </form>
  );
}