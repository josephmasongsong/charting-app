'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
  FileText,
  Newspaper,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import ActivityFeed from '@/components/ActivityFeed';
import { cn } from '@/lib/utils';

interface DashboardData {
  userSites: Array<{
    id: string;
    name: string;
    address: string;
    isSingleSeniorOnly: boolean;
  }>;
  needsAttention: Array<{
    siteId: string;
    siteName: string;
    lastEventDate: string | null;
    daysSince: number | null;
  }>;
  lowStock: Array<{
    siteId: string;
    siteName: string;
    supplyName: string;
    quantity: number;
  }>;
}

const pageClass = 'min-h-screen bg-(--surface-page) px-6 pt-8 pb-12';
const containerClass = 'mx-auto max-w-[1200px]';
const sectionTitleClass = 'text-[17px] font-bold';
const quickStartTileClass =
  'flex w-full items-start gap-3.5 rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) p-5 text-left shadow-(--shadow-card) hover:bg-(--action-selected)';
const quickStartIconClass =
  'grid size-11 shrink-0 place-items-center rounded-(--radius-control) bg-(--action-selected) text-(--action-primary)';
const quickStartItems: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  sub: string;
}> = [
  {
    href: '/events/new',
    icon: CalendarDays,
    label: 'Log New Event',
    sub: 'Record a community event',
  },
  {
    href: '/supply-distributions/new',
    icon: Package,
    label: 'Log Supply Distribution',
    sub: 'Record supply delivery',
  },
  {
    href: '/reports/monthly',
    icon: Newspaper,
    label: 'Monthly Reports',
    sub: 'View analytics and insights',
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const attentionRailRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  // Fetch dashboard data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className={pageClass}>
        <div className={cn(containerClass, 'flex min-h-[400px] items-center justify-center')}>
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-(--action-primary)" />
            <p className="text-(--text-muted)">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={pageClass}>
        <div className={containerClass}>
          <EmptyState
            size="page"
            tone="danger"
            title={`Error: ${error}`}
            action={{ label: 'Try Again', onClick: fetchDashboardData }}
            className="min-h-[400px]"
          />
        </div>
      </div>
    );
  }

  // Show not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  if (!data) {
    return null;
  }

  const attentionCount =
    (data.needsAttention?.length || 0) + (data.lowStock?.length || 0);

  const scrollAttention = (direction: -1 | 1) => {
    attentionRailRef.current?.scrollBy({
      left: direction * 314,
      behavior: 'smooth',
    });
  };

  return (
    <div className={pageClass}>
      <div className={containerClass}>
        <div>
          <h1 className="text-[30px] leading-tight font-bold">Dashboard</h1>
          <p className="mt-1.5 text-[15px] text-(--text-muted)">
            Welcome back, {session?.user?.name || session?.user?.email}!
          </p>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className={sectionTitleClass}>Needs Attention</h2>
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] text-(--text-muted)">
                {attentionCount} item{attentionCount === 1 ? '' : 's'} need
                {attentionCount === 1 ? 's' : ''} action
              </span>
              {attentionCount > 1 && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Scroll alerts left"
                    onClick={() => scrollAttention(-1)}
                    className="grid size-7 cursor-pointer place-items-center rounded-(--radius-control) border border-(--border-default) bg-(--surface-card) text-(--action-primary) hover:bg-(--action-selected)"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll alerts right"
                    onClick={() => scrollAttention(1)}
                    className="grid size-7 cursor-pointer place-items-center rounded-(--radius-control) border border-(--border-default) bg-(--surface-card) text-(--action-primary) hover:bg-(--action-selected)"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {attentionCount > 0 ? (
            <div
              ref={attentionRailRef}
              className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {data.needsAttention.map(site => (
                <div
                  key={site.siteId}
                  className="flex w-[300px] shrink-0 snap-start flex-col gap-2.5 rounded-(--radius-card) border border-(--border-default) border-l-4 border-l-(--bch-red-600) bg-(--surface-card) p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-(--danger-surface) text-(--bch-red-600)">
                      <Calendar size={18} />
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/sites/${site.siteId}`}
                        className="block text-[14.5px] font-bold text-(--text-body) hover:text-(--action-primary) hover:underline"
                      >
                        {site.siteName}
                      </Link>
                      <div className="mt-0.5 text-[12.5px] text-(--text-muted)">
                        {site.daysSince === null
                          ? 'No event logged yet'
                          : `No event logged in ${site.daysSince} days`}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/events/new"
                    className="self-start text-[13px] font-bold text-(--action-primary) hover:underline"
                  >
                    Log Event →
                  </Link>
                </div>
              ))}
              {data.lowStock?.map(item => (
                <div
                  key={`${item.siteId}-${item.supplyName}`}
                  className="flex w-[300px] shrink-0 snap-start flex-col gap-2.5 rounded-(--radius-card) border border-(--border-default) border-l-4 border-l-(--bch-gold-600) bg-(--surface-card) p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-[#FDF1D3] text-[#B07C0A]">
                      <Package size={18} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14.5px] font-bold">
                        {item.supplyName} — {item.siteName}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-(--text-muted)">
                        {item.quantity === 0
                          ? 'Out of stock, reorder now'
                          : `Only ${item.quantity} left, reorder soon`}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/sites/${item.siteId}`}
                    className="self-start text-[13px] font-bold text-(--action-primary) hover:underline"
                  >
                    View Supplies →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="You're all caught up" className="bg-(--surface-card)" />
          )}
        </section>

        <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
          <div className="flex flex-col gap-6">
            <section>
              <h2 className="mb-3.5 text-lg font-bold">Quick Start</h2>
              <div className="flex flex-col gap-4">
                {quickStartItems.map(item => (
                  <Link key={item.href} href={item.href} className={quickStartTileClass}>
                    <span className={quickStartIconClass}>
                      <item.icon size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15.5px] font-bold text-(--text-body)">
                        {item.label}
                      </span>
                      <span className="mt-[3px] block text-[13px] text-(--text-muted)">
                        {item.sub}
                      </span>
                    </span>
                  </Link>
                ))}
                {/* TODO: /dashboard — not wired: no referrals feature exists. */}
                <button
                  type="button"
                  disabled
                  onClick={() => {}}
                  className={cn(quickStartTileClass, 'cursor-not-allowed opacity-60 hover:bg-(--surface-card)')}
                >
                  <span className={quickStartIconClass}>
                    <FileText size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15.5px] font-bold text-(--text-body)">
                      Log Referral
                    </span>
                    <span className="mt-[3px] block text-[13px] text-(--text-muted)">
                      Record a tenant referral
                    </span>
                  </span>
                </button>
              </div>
            </section>

          </div>

          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
