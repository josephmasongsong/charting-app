"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { QuickStartCard } from "@/components/ui/quick-start-card";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Package,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import ActivityFeed from "@/components/ActivityFeed";
import { cn } from "@/lib/utils";

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

const pageClass = "min-h-screen bg-(--surface-page) px-6 pt-8 pb-12";
const containerClass = "mx-auto max-w-[1200px]";
const sectionTitleClass = "text-[17px] font-bold";

// The frequent field actions. First thing under the greeting on a phone.
const quickStartItems = [
  {
    href: "/events/new",
    icon: CalendarDays,
    label: "Log New Event",
    sub: "Record a community event",
  },
  {
    href: "/supply-distributions/new",
    icon: Package,
    label: "Log Supply Distribution",
    sub: "Record supply delivery",
  },
  {
    href: "/reports/monthly",
    icon: Newspaper,
    label: "Monthly Reports",
    sub: "View analytics and insights",
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
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  // Fetch dashboard data
  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (status === "loading" || loading) {
    return (
      <div className={pageClass}>
        <div
          className={cn(
            containerClass,
            "flex min-h-[400px] items-center justify-center",
          )}
        >
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
            action={{ label: "Try Again", onClick: fetchDashboardData }}
            className="min-h-[400px]"
          />
        </div>
      </div>
    );
  }

  // Show not authenticated
  if (status === "unauthenticated") {
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
      behavior: "smooth",
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

        {/* Phones: Quick Start first (order-1). lg+: the template layout —
            Needs Attention full width, then Quick Start beside the feed. */}
        <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-6">
          <QuickStartCard
            title="Quick Start"
            items={quickStartItems}
            className="order-1 w-full max-w-none lg:order-2 lg:max-w-[340px]"
          />

          <section className="order-2 lg:order-1 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className={sectionTitleClass}>Needs Attention</h2>
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] text-(--text-muted)">
                  {attentionCount} item{attentionCount === 1 ? "" : "s"} need
                  {attentionCount === 1 ? "s" : ""} action
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
                {data.needsAttention.map((site) => (
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
                            ? "No event logged yet"
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
                {data.lowStock?.map((item) => (
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
                            ? "Out of stock, reorder now"
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
              <EmptyState
                title="You're all caught up"
                className="bg-(--surface-card)"
              />
            )}
          </section>

          <div className="order-3 lg:order-3">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
