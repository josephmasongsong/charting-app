'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/ui/kpi-card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Users,
  CalendarDays,
  Package,
  Loader2,
  Target,
  Activity,
  Building,
  Box,
  Truck,
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
  monthlyMetrics: {
    events: number;
    participants: number;
    distributions: number;
    adminHours: number;
  };
  allTimeMetrics: {
    events: number;
    participants: number;
    distributions: number;
    adminHours: number;
  };
}

const pageClass = 'min-h-screen bg-(--surface-page) px-6 pt-8 pb-12';
const containerClass = 'mx-auto max-w-[1200px]';
const sectionTitleClass = 'text-[17px] font-bold';
const quickStartTileClass =
  'flex w-full items-start gap-3.5 rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) p-5 text-left shadow-(--shadow-card) hover:bg-(--action-selected)';
const quickStartIconClass =
  'grid size-11 shrink-0 place-items-center rounded-(--radius-control) bg-(--action-selected) text-(--action-primary)';
const adminTileClass =
  'h-auto w-full flex-col gap-2 rounded-(--radius-control) border-(--border-default) bg-(--surface-card) py-4 text-(--text-body) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

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

const adminNavItems: Array<{ href: string; icon: LucideIcon; label: string }> = [
  { href: '/admin/events', icon: CalendarDays, label: 'Events' },
  { href: '/admin/sites', icon: MapPin, label: 'Sites' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/program-goals', icon: Target, label: 'Program Goals' },
  { href: '/admin/activity-types', icon: Activity, label: 'Activity Types' },
  { href: '/admin/community-partners', icon: Building, label: 'Community Partners' },
  { href: '/admin/supplies', icon: Box, label: 'Supplies' },
  { href: '/admin/supply-distributions', icon: Truck, label: 'Distributions' },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [data, setData] = useState<DashboardData | null>(null);
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

  const currentMetrics =
    selectedPeriod === 'month' ? data.monthlyMetrics : data.allTimeMetrics;
  const isAdmin = session?.user?.role === 'admin';

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
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className={sectionTitleClass}>Key Metrics</h2>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-9 w-32 rounded-(--radius-input) border-(--border-input) bg-(--surface-card) text-[14.5px] shadow-none">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="alltime">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard value={currentMetrics.events} label="Events Held" />
            <KpiCard value={currentMetrics.participants} label="Participants Served" />
            <KpiCard value={currentMetrics.distributions} label="Supply Distributions" />
            <KpiCard value={currentMetrics.adminHours} label="Admin Hours" />
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className={sectionTitleClass}>Needs Attention</h2>
            <span className="text-[13px] text-(--text-muted)">
              {data.needsAttention?.length || 0} item
              {(data.needsAttention?.length || 0) === 1 ? '' : 's'} need
              {(data.needsAttention?.length || 0) === 1 ? 's' : ''} action
            </span>
          </div>
          {data.needsAttention?.length ? (
            <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card)">
              {data.needsAttention.map(site => (
                <div
                  key={site.siteId}
                  className="flex items-center justify-between gap-4 border-b border-(--bch-gray-200) px-5 py-3 last:border-b-0"
                >
                  <Link
                    href={`/sites/${site.siteId}`}
                    className="text-[14.5px] font-semibold text-(--text-body) hover:text-(--action-primary) hover:underline"
                  >
                    {site.siteName}
                  </Link>
                  <span className="text-[12.5px] whitespace-nowrap text-(--warning-text)">
                    {site.daysSince === null
                      ? 'No events logged yet'
                      : `No events in ${site.daysSince} days`}
                  </span>
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

            {/* Admin Menu - Only visible to admins */}
            {isAdmin && (
              <Card className="gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) p-5 shadow-none">
                <h2 className={sectionTitleClass}>Admin Navigation</h2>
                <p className="mt-0.5 text-[13px] text-(--text-muted)">
                  Records and resource management
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {adminNavItems.map(item => (
                    <Button key={item.href} asChild variant="outline" className={adminTileClass}>
                      <Link href={item.href}>
                        <item.icon className="size-6" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
