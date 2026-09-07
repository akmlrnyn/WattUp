import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAdmin } from "@/modules/auth/domain/roles";
import { auth } from "@/modules/auth/infrastructure/auth";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userRole = (
    session.user as {
      role?: unknown;
    }
  ).role;

  if (!isAdmin(userRole)) {
    redirect("/dashboard");
  }

  return children;
}