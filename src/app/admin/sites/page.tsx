'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SitesTable from './components/SitesTable';

function SitesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default function AdminSitesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sites Management</h1>
          <p className="text-muted-foreground">
            Manage sites, locations, and their properties
          </p>
        </div>

        <Button onClick={() => router.push('/admin/sites/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </div>

      <Suspense fallback={<SitesTableSkeleton />}>
        <SitesTable />
      </Suspense>
    </div>
  );
}
