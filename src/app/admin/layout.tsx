import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Atelier console", template: "%s · Console" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative gate: re-reads the role from Postgres on every admin render,
  // so revoking an admin takes effect at once rather than at token expiry.
  const session = await requireAdmin();
  return <AdminShell adminName={session.name}>{children}</AdminShell>;
}
