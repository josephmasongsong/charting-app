'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import SitesTable from './components/SitesTable';

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const statCardClass =
  'rounded-(--radius-card) border border-(--border-default) border-t-[3px] bg-(--surface-card) px-4 py-3.5';
const statLabelClass =
  'text-[11.5px] font-bold tracking-[.7px] text-(--text-muted) uppercase';
const statValueClass = 'mt-1 text-[28px] leading-[1.2] font-bold';

// Total sites / total tenants / with community room / senior only. The list
// endpoint returns only the current page, so the values have no source yet.
const stats = [
  { label: 'Total sites', accent: 'border-t-(--surface-chrome)' },
  { label: 'Total tenants', accent: 'border-t-(--action-primary)' },
  { label: 'With community room', accent: 'border-t-(--bch-seafoam)' },
  { label: 'Senior only', accent: 'border-t-(--bch-gold-500)' },
];

function SitesTableSkeleton() {
  return (
    <div className="flex items-center justify-center py-8 text-(--text-muted)">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading...
    </div>
  );
}

export default function AdminSitesPage() {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
            Sites Management
          </h1>
          <p className="mt-1.5 text-[15px] text-(--text-muted)">
            Manage sites, locations, and their properties
          </p>
        </div>

        <Button
          onClick={() => router.push('/admin/sites/new')}
          className={primaryButtonClass}
        >
          <Plus className="h-4 w-4" />
          Add Site
        </Button>
      </div>

      {/* TODO: /admin/sites — not wired: the stat values need aggregates
          (unfiltered count, sum of tenants, filtered counts) that
          GET /api/admin/sites does not return. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className={cn(statCardClass, stat.accent, 'opacity-60')}>
            <div className={statLabelClass}>{stat.label}</div>
            <div className={statValueClass}>—</div>
          </div>
        ))}
      </div>

      <Suspense fallback={<SitesTableSkeleton />}>
        <SitesTable />
      </Suspense>
    </div>
  );
}
