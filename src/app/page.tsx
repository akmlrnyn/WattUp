import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/modules/auth/infrastructure/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}