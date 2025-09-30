import { requireAdmin } from '@/lib/role-guard';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect non-admins to unauthorized page
  await requireAdmin();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
