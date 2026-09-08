"use client";

import {
  LoaderCircle,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/modules/auth/presentation/auth-client";

interface SignOutButtonProps {
  compact?: boolean;
}

export function SignOutButton({
  compact = false,
}: SignOutButtonProps) {
  const router = useRouter();

  const [isPending, setIsPending] =
    useState(false);

  async function handleSignOut() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      const { error } =
        await authClient.signOut();

      if (error) {
        throw new Error(
          error.message ??
            "Logout gagal.",
        );
      }

      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      console.error(
        "SIGN_OUT_ERROR",
        error,
      );

      setIsPending(false);
    }
  }

  return (
    <button
      aria-label={
        isPending
          ? "Sedang keluar"
          : "Keluar dari WattUp"
      }
      className={
        `sign-out-button ${
          compact ? "compact" : ""
        }`.trim()
      }
      disabled={isPending}
      onClick={handleSignOut}
      type="button"
    >
      {isPending ? (
        <LoaderCircle
          aria-hidden
          className="sign-out-spinner"
          size={compact ? 18 : 19}
        />
      ) : (
        <LogOut
          aria-hidden
          size={compact ? 18 : 19}
        />
      )}

      <span>
        {isPending
          ? "Keluar..."
          : "Keluar"}
      </span>
    </button>
  );
}