import { redirect } from "next/navigation";

import { getCurrentSession } from "@/modules/auth/presentation/server/auth-guard";

export default async function HomePage() {
  const session = await getCurrentSession();

  redirect(session ? "/dashboard" : "/sign-in");
}