"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { authClient } from "@/modules/auth/presentation/auth-client";

export function SignUpForm() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const passwordConfirmation = String(
      formData.get("passwordConfirmation"),
    );

    if (password !== passwordConfirmation) {
      setErrorMessage("Konfirmasi password tidak sama");
      return;
    }

    setErrorMessage(null);
    setIsPending(true);

    const { error } = await authClient.signUp.email({
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password,
    });

    if (error) {
      setErrorMessage(error.message ?? "Registrasi gagal");
      setIsPending(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Nama
        </label>

        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label
          htmlFor="passwordConfirmation"
          className="mb-1 block text-sm font-medium"
        >
          Konfirmasi password
        </label>

        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-emerald-500"
        />
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Memproses..." : "Buat akun"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        Sudah punya akun?{" "}
        <Link href="/sign-in" className="font-semibold text-emerald-700">
          Masuk
        </Link>
      </p>
    </form>
  );
}