import { Suspense } from 'react';
import { getCommunityPartnersCount } from '@/lib/data/community-partners';
import CommunityPartnersTable from './components/community-partners-table';

function CommunityPartnersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default async function AdminCommunityPartnersPage() {
  // This could be used for initial count display, but it's optional
  // const initialCount = await getCommunityPartnersCount();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Community Partners Management</h1>
          <p className="text-muted-foreground">
            Manage community partners for your application
          </p>
        </div>
      </div>

      <Suspense fallback={<CommunityPartnersTableSkeleton />}>
        <CommunityPartnersTable />
      </Suspense>
    </div>
  );
}
