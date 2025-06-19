import { Suspense } from 'react';
import { getSitesCount } from '@/app/lib/data/sites';
import SitesTable from './components/SitesTable';

function SitesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default async function AdminSitesPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sites Management</h1>
          <p className="text-muted-foreground">
            Manage sites, locations, and their properties
          </p>
        </div>
      </div>

      <Suspense fallback={<SitesTableSkeleton />}>
        <SitesTable />
      </Suspense>
    </div>
  );
}
