import { AdminAppShell } from "@/components/admin/AdminAppShell";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 md:px-10">
      <AdminAppShell>{children}</AdminAppShell>
    </main>
  );
}
