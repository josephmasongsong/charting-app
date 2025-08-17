'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  Users,
  BarChart3,
  Download,
  FileText,
  MapPin,
  Search,
  Loader2,
  DollarSign,
  CalendarCheck2,
  Calendar,
} from 'lucide-react';
import { ProgramGoalsPieChart } from '@/components/ProgramGoalsPieChart';

interface ActivityTypeByRegion {
  activityTypeId: string;
  activityTypeName: string;
  programGoalName: string;
  region: string;
  eventCount: number;
  participantsServed: number;
  totalCost: number;
}

interface ProgramGoalSummary {
  id: string;
  name: string;
  activityCount: number;
  color: string;
}

interface MonthlyActivityReportData {
  reportMonth: string;
  totalEvents: number;
  totalParticipants: number;
  totalCost: number;
  totalEventDuration: number;
  totalAdminDuration: number;
  activityTypesByRegion: ActivityTypeByRegion[];
  programGoals: ProgramGoalSummary[];
  regions: string[];
  availableDateRange: { minDate: string; maxDate: string };
}

interface MonthlyActivityReportProps {
  data: MonthlyActivityReportData;
  currentParams: {
    startYear: number;
    startMonth: number;
    endYear?: number;
    endMonth?: number;
  };
}

function MetricCard({
  title,
  value,
  icon: Icon,
  formatter = (val: number) => val.toLocaleString(),
  subMetrics = [],
  className = '',
}: {
  title: string;
  value: number;
  icon: any;
  formatter?: (val: number) => string;
  subMetrics?: Array<{
    label: string;
    value: string | number;
    formatter?: (val: string | number) => string;
  }>;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {title}
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-normal">{formatter(value)}</div>
        {subMetrics.length > 0 && (
          <div className="mt-2 space-y-1">
            {subMetrics.map((subMetric, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                {subMetric.label}:{' '}
                <span className="font-medium text-foreground">
                  {subMetric.formatter
                    ? subMetric.formatter(subMetric.value)
                    : subMetric.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DateRangeDialog({
  currentParams,
  availableDateRange,
}: {
  currentParams: MonthlyActivityReportProps['currentParams'];
  availableDateRange: { minDate: string; maxDate: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRange, setIsRange] = useState(
    !!(currentParams.endYear && currentParams.endMonth)
  );
  const [open, setOpen] = useState(false);

  // Calculate available years and months based on actual data
  const minDate = new Date(availableDateRange.minDate);
  const maxDate = new Date(availableDateRange.maxDate);

  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const minMonth = minDate.getMonth() + 1;
  const maxMonth = maxDate.getMonth() + 1;

  const availableYears = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Filter months based on selected year
  const getAvailableMonths = (year: number) => {
    return months.filter(month => {
      if (year === minYear && year === maxYear) {
        return month.value >= minMonth && month.value <= maxMonth;
      } else if (year === minYear) {
        return month.value >= minMonth;
      } else if (year === maxYear) {
        return month.value <= maxMonth;
      }
      return true;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const startYear = formData.get('startYear') as string;
    const startMonth = formData.get('startMonth') as string;
    const endYear = formData.get('endYear') as string;
    const endMonth = formData.get('endMonth') as string;

    const params = new URLSearchParams();
    params.set('startYear', startYear);
    params.set('startMonth', startMonth);

    if (isRange && endYear && endMonth) {
      params.set('endYear', endYear);
      params.set('endMonth', endMonth);
    }

    startTransition(() => {
      router.push(`/reports/monthly?${params.toString()}`);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Change Period
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Report Period</DialogTitle>
          <DialogDescription>
            Choose the date range for your monthly activity report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="isRange"
              type="checkbox"
              checked={isRange}
              onChange={e => setIsRange(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="isRange" className="text-sm font-medium">
              Date Range Mode
            </Label>
          </div>

          <div className="space-y-4">
            {/* Start Date */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                {isRange ? 'Start Date' : 'Month & Year'}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="startMonth"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Month
                  </Label>
                  <select
                    id="startMonth"
                    name="startMonth"
                    defaultValue={currentParams.startMonth}
                    className="w-full p-2 text-sm border rounded"
                    required
                  >
                    {getAvailableMonths(currentParams.startYear).map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label
                    htmlFor="startYear"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Year
                  </Label>
                  <select
                    id="startYear"
                    name="startYear"
                    defaultValue={currentParams.startYear}
                    className="w-full p-2 text-sm border rounded"
                    required
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* End Date (if range mode) */}
            {isRange && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  End Date
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="endMonth"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Month
                    </Label>
                    <select
                      id="endMonth"
                      name="endMonth"
                      defaultValue={
                        currentParams.endMonth || currentParams.startMonth
                      }
                      className="w-full p-2 text-sm border rounded"
                    >
                      {getAvailableMonths(
                        currentParams.endYear || currentParams.startYear
                      ).map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label
                      htmlFor="endYear"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Year
                    </Label>
                    <select
                      id="endYear"
                      name="endYear"
                      defaultValue={
                        currentParams.endYear || currentParams.startYear
                      }
                      className="w-full p-2 text-sm border rounded"
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActivityTypeByRegionTable({ data }: { data: ActivityTypeByRegion[] }) {
  const groupedByRegion = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        if (!acc[item.region]) {
          acc[item.region] = [];
        }
        acc[item.region].push(item);
        return acc;
      },
      {} as Record<string, ActivityTypeByRegion[]>
    );
  }, [data]);

  const getRegionTotals = (activities: ActivityTypeByRegion[]) => {
    return activities.reduce(
      (totals, activity) => ({
        events: totals.events + activity.eventCount,
        participants: totals.participants + activity.participantsServed,
        cost: totals.cost + activity.totalCost,
      }),
      { events: 0, participants: 0, cost: 0 }
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedByRegion).map(([region, activities]) => {
        const regionTotals = getRegionTotals(activities);

        return (
          <Card key={region}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{region} Region</CardTitle>
                </div>
                <Badge variant="outline">
                  {activities.length} Activity Types
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle text-xs uppercase text-muted-foreground">
                          Activity Type
                        </th>
                        <th className="h-12 px-4 text-left align-middle text-xs uppercase text-muted-foreground">
                          Program Goal
                        </th>
                        <th className="h-12 px-4 text-center align-middle text-xs uppercase text-muted-foreground">
                          Events
                        </th>
                        <th className="h-12 px-4 text-center align-middle text-xs uppercase text-muted-foreground">
                          Participants
                        </th>
                        <th className="h-12 px-4 text-center align-middle text-xs uppercase text-muted-foreground">
                          Total Cost
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map(activity => (
                        <tr
                          key={`${activity.region}-${activity.activityTypeId}`}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle font-normal text-sm">
                            {activity.activityTypeName}
                          </td>
                          <td className="p-4 align-middle">
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium"
                            >
                              {activity.programGoalName}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle text-center font-normal text-sm">
                            {activity.eventCount}
                          </td>
                          <td className="p-4 align-middle text-center font-normal text-sm">
                            {activity.participantsServed.toLocaleString()}
                          </td>
                          <td className="p-4 align-middle text-center font-normal text-sm">
                            ${activity.totalCost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 bg-muted/30">
                        <td className="p-4 align-middle font-medium text-primary text-sm">
                          {region} Region Total
                        </td>
                        <td className="p-4 align-middle"></td>
                        <td className="p-4 align-middle text-center font-medium text-primary text-sm">
                          {regionTotals.events}
                        </td>
                        <td className="p-4 align-middle text-center font-medium text-primary text-sm">
                          {regionTotals.participants.toLocaleString()}
                        </td>
                        <td className="p-4 align-middle text-center font-medium text-primary text-sm">
                          ${regionTotals.cost.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function MonthlyActivityReport({
  data,
  currentParams,
}: MonthlyActivityReportProps) {
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export PDF clicked');
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log('Export CSV clicked');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Monthly Activity Report</h2>
          <p className="text-muted-foreground mt-1">
            {data.reportMonth} • Activity breakdown by region and type
          </p>
        </div>
        <div className="flex gap-2">
          <DateRangeDialog
            currentParams={currentParams}
            availableDateRange={data.availableDateRange}
          />
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export XLXS
          </Button>
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
              label: 'Programming Hours',
              value: Math.round(data.totalEventDuration / 60),
              formatter: val => `${val}h`,
            },
            {
              label: 'Admin Hours',
              value: Math.round(data.totalAdminDuration / 60),
              formatter: val => `${val}h`,
            },
          ]}
        />
        <MetricCard
          title="Total Participants"
          value={data.totalParticipants}
          icon={Users}
          subMetrics={[
            {
              label: 'Avg per Event',
              value:
                data.totalEvents > 0
                  ? data.totalParticipants / data.totalEvents
                  : 0,
              formatter: val => `${Math.round(Number(val))}`,
            },
          ]}
        />
        <MetricCard
          title="Total Cost"
          value={data.totalCost}
          icon={DollarSign}
          formatter={val => `$${val.toFixed(2)}`}
          subMetrics={[
            {
              label: 'Avg per Event',
              value:
                data.totalEvents > 0 ? data.totalCost / data.totalEvents : 0,
              formatter: val => `$${Number(val).toFixed(2)}`,
            },
            {
              label: 'Avg per Participant',
              value:
                data.totalParticipants > 0
                  ? data.totalCost / data.totalParticipants
                  : 0,
              formatter: val => `$${Number(val).toFixed(2)}`,
            },
          ]}
        />
        <MetricCard
          title="Activity Types"
          value={data.activityTypesByRegion.length}
          icon={BarChart3}
          subMetrics={[
            {
              label: 'Most Popular',
              value: (() => {
                const activityTypeCounts = data.activityTypesByRegion.reduce(
                  (acc, item) => {
                    acc[item.activityTypeName] =
                      (acc[item.activityTypeName] || 0) + item.eventCount;
                    return acc;
                  },
                  {} as Record<string, number>
                );
                const mostPopular =
                  Object.entries(activityTypeCounts).sort(
                    ([, a], [, b]) => b - a
                  )[0]?.[0] || 'None';
                return mostPopular.length > 20
                  ? mostPopular.substring(0, 20) + '...'
                  : mostPopular;
              })(),
              formatter: val => val.toString(),
            },
          ]}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6">
        {/* Tables - Left Side (takes remaining space) */}
        <div className="flex-1">
          <ActivityTypeByRegionTable data={data.activityTypesByRegion} />

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

        {/* Program Goals Chart - Right Side (fixed width) */}
        <div className="flex-shrink-0">
          <ProgramGoalsPieChart data={data.programGoals} />
        </div>
      </div>
    </div>
  );
}
