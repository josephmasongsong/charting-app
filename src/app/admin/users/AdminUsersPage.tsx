'use client';

import { Suspense, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UsersTable from './components/UsersTable';
import PendingInvitations from './components/PendingInvitations';
import InviteUserDialog from './components/InviteUserDialog';

const tabsListClass =
  'h-auto gap-1 rounded-(--radius-control) bg-transparent p-0';
const tabTriggerClass =
  'rounded-(--radius-control) border border-(--border-default) bg-(--surface-card) px-3.5 py-[7px] text-[14.5px] font-normal text-(--text-body) data-[state=active]:border-(--action-primary) data-[state=active]:bg-(--action-primary) data-[state=active]:text-(--text-on-chrome) data-[state=active]:shadow-none';

function UsersTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) p-5 shadow-(--shadow-card)">
      <Skeleton className="h-9 w-[340px] max-w-full rounded-(--radius-control) bg-(--surface-muted)" />
      <div className="mt-5 space-y-2">
        <Skeleton className="h-10 rounded-none bg-(--bch-gray-200)" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-9 rounded-none bg-(--surface-muted)" />
        ))}
      </div>
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

  const usersTableRef = useRef<{ refreshData: () => void }>(null);
  const pendingRef = useRef<{ refreshData: () => void }>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  const handleRefresh = () => {
    usersTableRef.current?.refreshData();
    pendingRef.current?.refreshData();
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setError('');
    setTimeout(() => setMessage(''), 5000);
  };

  const showError = (err: string) => {
    setError(err);
    setMessage('');
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
            User Management
          </h1>
          <p className="mt-1.5 text-[15px] text-(--text-muted)">
            Manage users, roles, and invitations
          </p>
        </div>

        <Button
          onClick={() => setInviteOpen(true)}
          className="h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)"
        >
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      <Tabs defaultValue="directory" className="gap-5">
        <TabsList className={tabsListClass}>
          <TabsTrigger value="directory" className={tabTriggerClass}>
            Directory
          </TabsTrigger>
          <TabsTrigger value="pending" className={tabTriggerClass}>
            Pending invitations
            {pendingCount !== null && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-(--warning-surface) px-1.5 py-[1px] text-[12px] font-bold text-(--warning-text)">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
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
        </TabsContent>

        <TabsContent value="pending">
          <PendingInvitations
            ref={pendingRef}
            onSuccess={showMessage}
            onError={showError}
            onCount={setPendingCount}
          />
        </TabsContent>
      </Tabs>

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
