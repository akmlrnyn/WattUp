import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/modules/auth/infrastructure/auth";

/*
 * React cache mencegah layout dan page
 * menjalankan query session yang sama dua kali
 * dalam satu request.
 */
export const getCurrentSession = cache(
  async () => {
    return auth.api.getSession({
      headers: await headers(),
    });
  },
);

export async function requireUser() {
  const session =
    await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireAdmin() {
  const session =
    await requireUser();

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}