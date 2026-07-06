// @/components/reports/monthly/MonthlyActivityReport.tsx

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  CalendarDays,
  Users,
  DollarSign,
  Package,
  BarChart3,
} from 'lucide-react';
import { MonthlyActivityReportProps } from './types';
import { MetricCard } from './MetricCard';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Monthly Activity Report</h2>
          <p className="text-muted-foreground mt-1">{data.reportMonth}</p>
        </div>
        <div className="flex gap-2">
          <DateRangeDialog
            currentParams={currentParams}
            availableDateRange={data.availableDateRange}
          />
          <MonthlyReportExportButton data={data} />
        </div>
      </div>

      {/* Metric Cards - Top Row */}
      <div className="grid gap-4 grid-cols-4">
        <MetricCard
          title="Total Events"
          value={data.totalEvents}
          icon={CalendarDays}
          subMetrics={[
            {
              label: 'vs Previous Period',
              value:
                data.monthlyEventGrowth &&
                data.monthlyEventGrowth.length > 0 ? (
                  <div
                    className={`flex items-center gap-1 ${getGrowthColor(overallEventGrowthType)}`}
                  >
                    {getGrowthIcon(overallEventGrowthType)}
                    <span>
                      {overallEventGrowthRate > 0 ? '+' : ''}
                      {overallEventGrowthRate}%
                    </span>
                  </div>
                ) : (
                  'N/A'
                ),
            },
          ]}
        />
        <MetricCard
          title="Total Participants"
          value={data.totalParticipants}
          icon={Users}
          subMetrics={[
            {
              label: 'vs Previous Period',
              value: (
                <div
                  className={`flex items-center gap-1 ${getGrowthColor(overallParticipantGrowthType)}`}
                >
                  {getGrowthIcon(overallParticipantGrowthType)}
                  <span>
                    {overallParticipantGrowthRate > 0 ? '+' : ''}
                    {overallParticipantGrowthRate}%
                  </span>
                </div>
              ),
            },
          ]}
        />
        <MetricCard
          title="Total Cost"
          value={data.totalCost}
          icon={DollarSign}
          formatter={val => `${val.toFixed(2)}`}
          subMetrics={[
            {
              label: 'vs Previous Period',
              value: (
                <div
                  className={`flex items-center gap-1 ${getCostGrowthColor(data.monthlyCostGrowth.growthType)}`}
                >
                  {getCostGrowthIcon(data.monthlyCostGrowth.growthType)}
                  <span>
                    {data.monthlyCostGrowth.growthRate > 0 ? '+' : ''}
                    {data.monthlyCostGrowth.growthRate}%
                  </span>
                </div>
              ),
            },
          ]}
        />
        <MetricCard
          title="Items Distributed"
          value={data.supplyDistributions.reduce(
            (sum, item) => sum + item.totalQuantityDistributed,
            0,
          )}
          icon={Package}
          subMetrics={[
            {
              label: 'vs Previous Period',
              value: (
                <div
                  className={`flex items-center gap-1 ${getGrowthColor(data.monthlySupplyDistributionGrowth.growthType)}`}
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
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Main Content Area - Content with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2">
          <ActivityTypeByRegionTable
            data={data.activityTypesByRegion}
            participantGrowthData={data.monthlyParticipantGrowth}
            eventGrowthData={data.monthlyEventGrowth || []}
            costGrowthData={data.regionalCostGrowth || []}
          />

          {data.activityTypesByRegion.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Activities Found
                </h3>
                <p className="text-muted-foreground text-center">
                  No events were recorded for {data.reportMonth}.<br />
                  Try selecting a different period or check your data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {' '}
            {/* ADD THIS WRAPPER DIV */}
            <SupplyDistributionsSidebar
              supplyDistributions={data.supplyDistributions}
            />
            <SitePerformanceCard sites={data.sitePerformance} />{' '}
            {/* ADD THIS LINE */}
          </div>{' '}
          {/* CLOSE WRAPPER DIV */}
        </div>
      </div>
    </div>
  );
}
