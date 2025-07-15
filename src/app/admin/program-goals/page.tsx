import { Suspense } from 'react';
import { getProgramGoalsCount } from '@/lib/data/program-goals';
import ProgramGoalsTable from './components/program-goals-table';

function ProgramGoalsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default async function AdminProgramGoalsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Program Goals Management</h1>
          <p className="text-muted-foreground">
            Manage program goals for your application
          </p>
        </div>
      </div>

      <Suspense fallback={<ProgramGoalsTableSkeleton />}>
        <ProgramGoalsTable />
      </Suspense>
    </div>
  );
}
