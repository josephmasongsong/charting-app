import { requireAdmin } from '@/app/lib/role-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect non-admins to unauthorized page
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <div className="border-b bg-white">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-red-600" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            <Badge variant="destructive">Admin Only</Badge>
          </div>
        </div>
      </div> */}

      <div className="container mx-auto p-4">{children}</div>
    </div>
  );
}
