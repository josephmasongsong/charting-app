import { Suspense } from 'react';
import { getProgramGoals } from '@/lib/data/program-goals';
import ActivityTypesTable from './components/activity-types-table';

export default async function AdminActivityTypesPage() {
  // Only fetch static/reference data in RSC
  const programGoals = await getProgramGoals();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activity Types Management</h1>
          <p className="text-muted-foreground">
            Manage activity types and their associated program goals
          </p>
        </div>
      </div>

      <Suspense fallback={<ActivityTypesTableSkeleton />}>
        <ActivityTypesTable initialProgramGoals={programGoals} />
      </Suspense>
    </div>
  );
}

function ActivityTypesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}
