import { Suspense } from 'react';
import { getUsersData } from '@/app/lib/data/users';
import UsersTable from './components/UsersTable';

function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

export default async function AdminUsersPage() {
  const { currentUser } = await getUsersData();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and invitations
          </p>
        </div>
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable currentUser={currentUser} />
      </Suspense>
    </div>
  );
}
