"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";

import { authClient } from "@/modules/auth/presentation/auth-client";

export function SignInForm() {
  const router = useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    rememberMe,
    setRememberMe,
  ] = useState(true);

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

    setErrorMessage(null);
    setIsPending(true);

    const { error } =
      await authClient.signIn.email({
        email: String(
          formData.get("email"),
        ),

        password: String(
          formData.get("password"),
        ),

        rememberMe,
      });

    if (error) {
      setErrorMessage(
        error.message ??
          "Email atau password tidak sesuai.",
      );

      setIsPending(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
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

      <label className="auth-field">
        <span>Password</span>

        <div className="auth-input-shell">
          <LockKeyhole
            aria-hidden
            size={18}
          />

          <input
            autoComplete="current-password"
            minLength={8}
            name="password"
            placeholder="Masukkan password"
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

      <label className="auth-remember-row">
        <input
          checked={rememberMe}
          onChange={(event) =>
            setRememberMe(
              event.target.checked,
            )
          }
          type="checkbox"
        />

        <span>
          Ingat saya di perangkat ini
        </span>
      </label>

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
          ? "Memproses..."
          : "Masuk ke WattUp"}
      </button>

      <p className="auth-switch-copy">
        Belum punya akun?{" "}

        <Link href="/sign-up">
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}