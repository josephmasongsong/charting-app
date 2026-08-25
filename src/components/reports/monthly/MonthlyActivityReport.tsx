'use client';

import React from 'react';
import { CalendarDays, Users, DollarSign, Package, BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { MonthlyActivityReportProps } from './types';
import { KpiCard } from '@/components/ui/kpi-card';
import { DateRangeDialog } from './DateRangeDialog';
import { MonthlyReportExportButton } from './MonthlyReportExportButton';
import { SupplyDistributionsSidebar } from './SupplyDistributionsSidebar';
import { SitePerformanceCard } from './SitePerformanceCard';
import { ActivityTypeByRegionTable } from './ActivityTypeByRegionTable';
import {
  getGrowthIcon,
  getGrowthColor,
  getCostGrowthIcon,
  getCostGrowthColor,
} from './GrowthIndicators';

export function MonthlyActivityReport({
  data,
  currentParams,
}: MonthlyActivityReportProps) {
  // Calculate overall growth for participant metric card
  const totalCurrentParticipants = data.monthlyParticipantGrowth.reduce(
    (sum, item) => sum + item.currentMonthParticipants,
    0,
  );
  const totalPreviousParticipants = data.monthlyParticipantGrowth.reduce(
    (sum, item) => sum + item.previousMonthParticipants,
    0,
  );
  const overallParticipantGrowthRate =
    totalPreviousParticipants > 0
      ? Math.round(
          ((totalCurrentParticipants - totalPreviousParticipants) /
            totalPreviousParticipants) *
            100,
        )
      : 0;

  const overallParticipantGrowthType =
    overallParticipantGrowthRate > 2
      ? 'growth'
      : overallParticipantGrowthRate < -2
        ? 'decline'
        : 'stable';

  // Calculate overall growth for events metric card
  const totalCurrentEvents =
    data.monthlyEventGrowth?.reduce(
      (sum, item) => sum + item.currentMonthEvents,
      0,
    ) || 0;
  const totalPreviousEvents =
    data.monthlyEventGrowth?.reduce(
      (sum, item) => sum + item.previousMonthEvents,
      0,
    ) || 0;
  const overallEventGrowthRate =
    totalPreviousEvents > 0
      ? Math.round(
          ((totalCurrentEvents - totalPreviousEvents) / totalPreviousEvents) *
            100,
        )
      : 0;

  const overallEventGrowthType =
    overallEventGrowthRate > 2
      ? 'growth'
      : overallEventGrowthRate < -2
        ? 'decline'
        : 'stable';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
            Monthly Activity Report
          </h1>
          <p className="mt-1.5 text-[15px] text-(--text-muted)">
            {data.reportMonth}
          </p>
        </div>
        <div className="flex gap-2.5">
          <DateRangeDialog
            currentParams={currentParams}
            availableDateRange={data.availableDateRange}
          />
          <MonthlyReportExportButton data={data} />
        </div>
      </div>

      {/* Metric Cards - Top Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          variant="panel"
          label="Total Events"
          value={data.totalEvents.toLocaleString()}
          icon={CalendarDays}
          sub={
            <div className="flex items-center gap-1 text-xs text-(--text-muted)">
              {data.monthlyEventGrowth && data.monthlyEventGrowth.length > 0 ? (
                <div
                  className={cn(
                    'flex items-center gap-1',
                    getGrowthColor(overallEventGrowthType),
                  )}
                >
                  {getGrowthIcon(overallEventGrowthType)}
                  <span>
                    {overallEventGrowthRate > 0 ? '+' : ''}
                    {overallEventGrowthRate}%
                  </span>
                </div>
              ) : (
                'N/A'
              )}{' '}
              vs Previous Period
            </div>
          }
        />
        <KpiCard
          variant="panel"
          label="Total Participants"
          value={data.totalParticipants.toLocaleString()}
          icon={Users}
          sub={
            <div className="flex items-center gap-1 text-xs text-(--text-muted)">
              <div
                className={cn(
                  'flex items-center gap-1',
                  getGrowthColor(overallParticipantGrowthType),
                )}
              >
                {getGrowthIcon(overallParticipantGrowthType)}
                <span>
                  {overallParticipantGrowthRate > 0 ? '+' : ''}
                  {overallParticipantGrowthRate}%
                </span>
              </div>{' '}
              vs Previous Period
            </div>
          }
        />
        <KpiCard
          variant="panel"
          label="Total Cost"
          value={data.totalCost.toFixed(2)}
          icon={DollarSign}
          sub={
            <div className="flex items-center gap-1 text-xs text-(--text-muted)">
              <div
                className={cn(
                  'flex items-center gap-1',
                  getCostGrowthColor(data.monthlyCostGrowth.growthType),
                )}
              >
                {getCostGrowthIcon(data.monthlyCostGrowth.growthType)}
                <span>
                  {data.monthlyCostGrowth.growthRate > 0 ? '+' : ''}
                  {data.monthlyCostGrowth.growthRate}%
                </span>
              </div>{' '}
              vs Previous Period
            </div>
          }
        />
        <KpiCard
          variant="panel"
          label="Items Distributed"
          value={data.supplyDistributions
            .reduce((sum, item) => sum + item.totalQuantityDistributed, 0)
            .toLocaleString()}
          icon={Package}
          sub={
            <div className="flex items-center gap-1 text-xs text-(--text-muted)">
              <div
                className={cn(
                  'flex items-center gap-1',
                  getGrowthColor(
                    data.monthlySupplyDistributionGrowth.growthType,
                  ),
                )}
              >
                {getGrowthIcon(
                  data.monthlySupplyDistributionGrowth.growthType,
                )}
                <span>
                  {data.monthlySupplyDistributionGrowth.growthRate > 0
                    ? '+'
                    : ''}
                  {data.monthlySupplyDistributionGrowth.growthRate}%
                </span>
              </div>{' '}
              vs Previous Period
            </div>
          }
        />
      </div>

      {/* Main Content Area - Content with Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div>
          <ActivityTypeByRegionTable
            data={data.activityTypesByRegion}
            participantGrowthData={data.monthlyParticipantGrowth}
            eventGrowthData={data.monthlyEventGrowth || []}
            costGrowthData={data.regionalCostGrowth || []}
          />

          {data.activityTypesByRegion.length === 0 && (
            <EmptyState
              icon={BarChart3}
              title="No Activities Found"
              description={`No events were recorded for ${data.reportMonth}. Try selecting a different period or check your data.`}
              className="bg-(--surface-card)"
            />
          )}
        </div>

        <div className="space-y-6">
          <SupplyDistributionsSidebar
            supplyDistributions={data.supplyDistributions}
          />
          <SitePerformanceCard
            sites={data.sitePerformance}
            totalSiteCount={data.totalSiteCount}
          />
        </div>
      </div>
    </div>
  );
}
