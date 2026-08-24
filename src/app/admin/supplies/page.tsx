'use client';

import { Suspense, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import SuppliesTable from './components/supplies-table';
import CreateSupplyDialog from './components/create-supply-dialog';

function SuppliesTableSkeleton() {
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

export default function AdminSuppliesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const suppliesTableRef = useRef<{ refreshData: () => void }>(null);

  const handleRefresh = () => {
    suppliesTableRef.current?.refreshData();
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
            Supplies Management
          </h1>
          <p className="mt-1.5 text-[15px] text-(--text-muted)">
            Manage supplies catalog for your application
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)"
        >
          <Plus className="h-4 w-4" />
          Add Supply
        </Button>
      </div>

      <Suspense fallback={<SuppliesTableSkeleton />}>
        <SuppliesTable
          ref={suppliesTableRef}
          message={message}
          error={error}
          onClearMessage={() => setMessage('')}
          onClearError={() => setError('')}
        />
      </Suspense>

      <CreateSupplyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
