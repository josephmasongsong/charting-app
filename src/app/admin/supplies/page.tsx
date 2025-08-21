import { Suspense } from 'react';
import SuppliesTable from './components/supplies-table';

function SuppliesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default async function AdminSuppliesPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supplies Management</h1>
          <p className="text-muted-foreground">
            Manage supplies catalog for your application
          </p>
        </div>
      </div>

      <Suspense fallback={<SuppliesTableSkeleton />}>
        <SuppliesTable />
      </Suspense>
    </div>
  );
}
