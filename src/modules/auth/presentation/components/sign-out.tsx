"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/modules/auth/presentation/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.replace("/sign-in");
          router.refresh();
        },
      },
    });

    setIsPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium"
    >
      {isPending ? "Keluar..." : "Keluar"}
    </button>
  );
}