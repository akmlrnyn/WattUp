import { requireAdmin } from "@/modules/auth/presentation/server/auth-guard";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  await requireAdmin();

  return children;
}