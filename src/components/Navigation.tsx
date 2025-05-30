'use client';
// In your dashboard or navigation component
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useRole } from '@/app/hooks/useRole';

export default function Navigation() {
  const { isAdmin } = useRole();

  return (
    <nav className="flex gap-4">
      {/* Other navigation items */}

      {isAdmin && (
        <Link href="/admin/users">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
        </Link>
      )}
    </nav>
  );
}
