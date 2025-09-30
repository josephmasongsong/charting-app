import { Suspense } from 'react';
import { getProgramGoals } from '@/lib/data/program-goals';
import AdminActivityTypesPage from './AdminActivityTypesPage';

function ActivityTypesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default async function AdminActivityTypesPageWrapper() {
  // Only fetch static/reference data in RSC
  const programGoals = await getProgramGoals();

  return <AdminActivityTypesPage programGoals={programGoals} />;
}
