'use client';

import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EventsListPanel from '@/components/events/EventsListPanel';

function EventsListSkeleton() {
  return (
    <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) p-5 shadow-(--shadow-card)">
      <Skeleton className="h-9 w-[340px] max-w-full rounded-(--radius-control) bg-(--surface-muted)" />
      <div className="mt-5 space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[68px] rounded-none bg-(--surface-muted)" />
        ))}
      </div>
    </div>
  );
}

/**
 * The worker-facing events list. Same panel as /admin/events with three things
 * off: no `canEdit` and no `onDelete` (so the row actions are View and Clone
 * only), and no site/organizer filters — search is the only control here.
 */
export default function EventsClient() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="bg-(--surface-page) px-6 pt-7 pb-10">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
              Events
            </h1>
            <p className="mt-1.5 text-[15px] text-(--text-muted)">
              Browse community events across all sites
            </p>
          </div>

          <Button
            onClick={() => router.push('/events/new')}
            className="h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)"
          >
            <Plus className="h-4 w-4" />
            Log New Event
          </Button>
        </div>

        <Suspense fallback={<EventsListSkeleton />}>
          <EventsListPanel
            message={message}
            error={error}
            onClearMessage={() => setMessage('')}
            onClearError={() => setError('')}
            showFilters={false}
          />
        </Suspense>
      </div>
    </div>
  );
}
