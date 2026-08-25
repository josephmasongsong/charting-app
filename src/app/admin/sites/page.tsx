'use client';

import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import SitesTable, { type SiteStats } from './components/SitesTable';

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';
const statCardClass =
  'rounded-(--radius-card) border border-(--border-default) border-t-[3px] bg-(--surface-card) px-4 py-3.5';
const statLabelClass =
  'text-[11.5px] font-bold tracking-[.7px] text-(--text-muted) uppercase';
const statValueClass = 'mt-1 text-[28px] leading-[1.2] font-bold';

const statCards: Array<{
  key: keyof SiteStats;
  label: string;
  accent: string;
}> = [
  { key: 'totalSites', label: 'Total sites', accent: 'border-t-(--surface-chrome)' },
  { key: 'totalTenants', label: 'Total tenants', accent: 'border-t-(--action-primary)' },
  { key: 'withCommunityRoom', label: 'With community room', accent: 'border-t-(--bch-seafoam)' },
  { key: 'seniorOnly', label: 'Senior only', accent: 'border-t-(--bch-gold-500)' },
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
  const [stats, setStats] = useState<SiteStats | null>(null);

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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(card => (
          <div
            key={card.label}
            className={cn(statCardClass, card.accent, !stats && 'opacity-60')}
          >
            <div className={statLabelClass}>{card.label}</div>
            <div className={statValueClass}>
              {stats ? stats[card.key].toLocaleString() : '—'}
            </div>
          </div>
        ))}
      </div>

      <Suspense fallback={<SitesTableSkeleton />}>
        <SitesTable onStats={setStats} />
      </Suspense>
    </div>
  );
}
