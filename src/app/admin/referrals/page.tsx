'use client';

import { Suspense, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReferralsTable from './components/referrals-table';

function ReferralsTableSkeleton() {
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

export default function ReferralsPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const referralsTableRef = useRef<{ refreshData: () => void }>(null);

  const handleRefresh = () => {
    referralsTableRef.current?.refreshData();
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
            Referrals
          </h1>
          <p className="mt-1.5 text-[15px] text-(--text-muted)">
            Referrals made when a tenant asked for something outside the program
          </p>
        </div>

        <Button
          onClick={() => router.push('/referrals/new')}
          className="h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)"
        >
          <Plus className="h-4 w-4" />
          Log Referral
        </Button>
      </div>

      <Suspense fallback={<ReferralsTableSkeleton />}>
        <ReferralsTable
          ref={referralsTableRef}
          message={message}
          error={error}
          onClearMessage={() => setMessage('')}
          onClearError={() => setError('')}
          onSuccess={showMessage}
          onError={showError}
          onRefresh={handleRefresh}
        />
      </Suspense>
    </div>
  );
}
