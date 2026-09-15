import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/modules/auth/infrastructure/auth";
import { VerifyEmailCard } from "@/modules/auth/presentation/components/verify-email-card";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.emailVerified) {
    redirect("/auth/continue");
  }

  return (
    <main className="verify-email-page">
      <VerifyEmailCard
        email={session.user.email}
      />
    </main>
  );
}