'use client';

import { Suspense, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UsersTable from './components/UsersTable';
import InviteUserDialog from './components/InviteUserDialog';

function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );
}

interface AdminUsersPageProps {
  currentUser: {
    id: string;
    role: 'admin' | 'user' | 'partner';
    email: string;
    name: string;
  };
}

export default function AdminUsersPage({ currentUser }: AdminUsersPageProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Create a ref to access the UsersTable's refresh function
  const usersTableRef = useRef<{ refreshData: () => void }>(null);

  const handleRefresh = () => {
    // Call the table's refresh method directly
    usersTableRef.current?.refreshData();
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setError('');
    // Clear messages after 5 seconds
    setTimeout(() => setMessage(''), 5000);
  };

  const showError = (err: string) => {
    setError(err);
    setMessage('');
    // Clear errors after 5 seconds
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and invitations
          </p>
        </div>

        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable
          ref={usersTableRef}
          currentUser={currentUser}
          message={message}
          error={error}
          onClearMessage={() => setMessage('')}
          onClearError={() => setError('')}
        />
      </Suspense>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        isAdmin={currentUser?.role === 'admin'}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
