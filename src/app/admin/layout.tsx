import { requireAdmin } from '@/lib/role-guard';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect non-admins to unauthorized page
  await requireAdmin();

  return (
    <div className="bg-(--surface-page) p-6">
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
