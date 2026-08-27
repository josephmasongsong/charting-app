'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SitesTable from './components/SitesTable';

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';

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


      <Suspense fallback={<SitesTableSkeleton />}>
        <SitesTable />
      </Suspense>
    </div>
  );
}
