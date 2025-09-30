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
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  Truck,
} from 'lucide-react';
import { MonthlyReportExportButton } from './MonthlyReportExportButton';

interface ActivityTypeByRegion {
  activityTypeId: string;
  activityTypeName: string;
  programGoalName: string;
  region: string;
  eventCount: number;
  participantsServed: number;
  newParticipants: number;
  returningParticipants: number;
  totalAdminDuration: number;
  totalCost: number;
}

interface ProgramGoalSummary {
  id: string;
  name: string;
  activityCount: number;
  color: string;
}

interface ActivityTypeParticipation {
  id: string;
  name: string;
  participantCount: number;
  eventCount: number;
  color: string;
}

interface MonthlyParticipantGrowth {
  region: string;
  currentMonthParticipants: number;
  previousMonthParticipants: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface MonthlyEventGrowth {
  region: string;
  currentMonthEvents: number;
  previousMonthEvents: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface MonthlyCostGrowth {
  currentMonthCost: number;
  previousMonthCost: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface RegionalCostGrowth {
  region: string;
  currentMonthCost: number;
  previousMonthCost: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface SupplyDistributionSummary {
  supplyId: string;
  supplyName: string;
  totalQuantityDistributed: number;
  totalCost: number;
  distributionCount: number;
}

interface MonthlySupplyDistributionGrowth {
  currentMonthQuantity: number;
  previousMonthQuantity: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface MonthlyActivityReportData {
  reportMonth: string;
  totalEvents: number;
  totalParticipants: number;
  totalNewParticipants: number;
  totalReturningParticipants: number;
  totalCost: number;
  totalEventDuration: number;
  totalAdminDuration: number;
  activityTypesByRegion: ActivityTypeByRegion[];
  programGoals: ProgramGoalSummary[];
  activityTypesParticipation: ActivityTypeParticipation[];
  monthlyParticipantGrowth: MonthlyParticipantGrowth[];
  monthlyEventGrowth: MonthlyEventGrowth[];
  monthlyCostGrowth: MonthlyCostGrowth;
  regionalCostGrowth: RegionalCostGrowth[];
  supplyDistributions: SupplyDistributionSummary[];
  monthlySupplyDistributionGrowth: MonthlySupplyDistributionGrowth;
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

// Helper functions for growth indicators
const getGrowthIcon = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'decline':
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

const getGrowthColor = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return 'text-green-600';
    case 'decline':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

const getCostGrowthIcon = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    case 'decline':
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

const getCostGrowthColor = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return 'text-red-600';
    case 'decline':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
};

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
    value: string | number | React.ReactNode;
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
                  {React.isValidElement(subMetric.value)
                    ? subMetric.value
                    : subMetric.formatter
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
  const [selectedStartYear, setSelectedStartYear] = useState(
    currentParams.startYear
  );
  const [selectedStartMonth, setSelectedStartMonth] = useState(
    currentParams.startMonth
  );
  const [selectedEndYear, setSelectedEndYear] = useState(
    currentParams.endYear || currentParams.startYear
  );
  const [selectedEndMonth, setSelectedEndMonth] = useState(
    currentParams.endMonth || currentParams.startMonth
  );
  const [validationError, setValidationError] = useState('');

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

  const validateDateRange = (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ) => {
    if (!isRange) return true;
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);
    return startDate <= endDate;
  };

  React.useEffect(() => {
    if (
      isRange &&
      !validateDateRange(
        selectedStartYear,
        selectedStartMonth,
        selectedEndYear,
        selectedEndMonth
      )
    ) {
      setValidationError('Start date must be before or equal to end date');
    } else {
      setValidationError('');
    }
  }, [
    selectedStartYear,
    selectedStartMonth,
    selectedEndYear,
    selectedEndMonth,
    isRange,
  ]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      isRange &&
      !validateDateRange(
        selectedStartYear,
        selectedStartMonth,
        selectedEndYear,
        selectedEndMonth
      )
    ) {
      setValidationError('Start date must be before or equal to end date');
      return;
    }

    const params = new URLSearchParams();
    params.set('startYear', selectedStartYear.toString());
    params.set('startMonth', selectedStartMonth.toString());

    if (isRange) {
      params.set('endYear', selectedEndYear.toString());
      params.set('endMonth', selectedEndMonth.toString());
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
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{validationError}</p>
              </div>
            )}

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
                    value={selectedStartMonth}
                    onChange={e =>
                      setSelectedStartMonth(parseInt(e.target.value))
                    }
                    className="w-full p-2 text-sm border rounded"
                    required
                  >
                    {getAvailableMonths(selectedStartYear).map(month => (
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
                    value={selectedStartYear}
                    onChange={e =>
                      setSelectedStartYear(parseInt(e.target.value))
                    }
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
                      value={selectedEndMonth}
                      onChange={e =>
                        setSelectedEndMonth(parseInt(e.target.value))
                      }
                      className="w-full p-2 text-sm border rounded"
                    >
                      {getAvailableMonths(selectedEndYear).map(month => (
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
                      value={selectedEndYear}
                      onChange={e =>
                        setSelectedEndYear(parseInt(e.target.value))
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

            <Button
              type="submit"
              disabled={isPending || !!validationError}
              className="w-full"
            >
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

function SupplyDistributionsSidebar({
  supplyDistributions,
}: {
  supplyDistributions: SupplyDistributionSummary[];
}) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-5 w-5 text-primary" />
          Supplies Distributed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {supplyDistributions.length > 0 ? (
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-3 text-left align-middle text-xs uppercase text-muted-foreground">
                      Supply
                    </th>
                    <th className="h-10 px-3 text-center align-middle text-xs uppercase text-muted-foreground">
                      Distributions
                    </th>
                    <th className="h-10 px-3 text-right align-middle text-xs uppercase text-muted-foreground">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {supplyDistributions.map(supply => (
                    <tr
                      key={supply.supplyId}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-3 align-middle font-normal text-sm">
                        <div className="truncate">{supply.supplyName}</div>
                      </td>
                      <td className="p-3 align-middle text-center font-normal text-sm">
                        {supply.distributionCount}
                      </td>
                      <td className="p-3 align-middle text-right font-normal text-sm">
                        {supply.totalQuantityDistributed.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Truck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No supplies distributed during this period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityTypeByRegionTable({
  data,
  participantGrowthData,
  eventGrowthData,
  costGrowthData,
}: {
  data: ActivityTypeByRegion[];
  participantGrowthData: MonthlyParticipantGrowth[];
  eventGrowthData: MonthlyEventGrowth[];
  costGrowthData: RegionalCostGrowth[];
}) {
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
        newParticipants: totals.newParticipants + activity.newParticipants,
        returningParticipants:
          totals.returningParticipants + activity.returningParticipants,
        adminDuration: totals.adminDuration + activity.totalAdminDuration,
        cost: totals.cost + activity.totalCost,
      }),
      {
        events: 0,
        participants: 0,
        newParticipants: 0,
        returningParticipants: 0,
        adminDuration: 0,
        cost: 0,
      }
    );
  };

  const getRegionParticipantGrowth = (region: string) => {
    return participantGrowthData.find(growth => growth.region === region);
  };

  const getRegionEventGrowth = (region: string) => {
    return eventGrowthData.find(growth => growth.region === region);
  };

  const getRegionCostGrowth = (region: string) => {
    return costGrowthData.find(growth => growth.region === region);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedByRegion).map(([region, activities]) => {
        const regionTotals = getRegionTotals(activities);
        const regionParticipantGrowth = getRegionParticipantGrowth(region);
        const regionEventGrowth = getRegionEventGrowth(region);
        const regionCostGrowth = getRegionCostGrowth(region);

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
                        <td className="p-4 align-middle text-center font-medium text-primary text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <span>{regionTotals.events}</span>
                            {regionEventGrowth && (
                              <div
                                className={`flex items-center gap-1 ${getGrowthColor(regionEventGrowth.growthType)}`}
                              >
                                {getGrowthIcon(regionEventGrowth.growthType)}
                                <span className="text-xs font-medium">
                                  {regionEventGrowth.growthRate > 0 ? '+' : ''}
                                  {regionEventGrowth.growthRate}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle text-center font-medium text-primary text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <span>
                              {regionTotals.participants.toLocaleString()}
                            </span>
                            {regionParticipantGrowth && (
                              <div
                                className={`flex items-center gap-1 ${getGrowthColor(regionParticipantGrowth.growthType)}`}
                              >
                                {getGrowthIcon(
                                  regionParticipantGrowth.growthType
                                )}
                                <span className="text-xs font-medium">
                                  {regionParticipantGrowth.growthRate > 0
                                    ? '+'
                                    : ''}
                                  {regionParticipantGrowth.growthRate}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle text-center font-medium text-primary text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <span>${regionTotals.cost.toFixed(2)}</span>
                            {regionCostGrowth && (
                              <div
                                className={`flex items-center gap-1 ${getCostGrowthColor(regionCostGrowth.growthType)}`}
                              >
                                {getCostGrowthIcon(regionCostGrowth.growthType)}
                                <span className="text-xs font-medium">
                                  {regionCostGrowth.growthRate > 0 ? '+' : ''}
                                  {regionCostGrowth.growthRate}%
                                </span>
                              </div>
                            )}
                          </div>
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
    console.log('Export PDF clicked');
  };

  const handleExportCSV = () => {
    console.log('Export CSV clicked');
  };

  // Calculate overall growth for participant metric card
  const totalCurrentParticipants = data.monthlyParticipantGrowth.reduce(
    (sum, item) => sum + item.currentMonthParticipants,
    0
  );
  const totalPreviousParticipants = data.monthlyParticipantGrowth.reduce(
    (sum, item) => sum + item.previousMonthParticipants,
    0
  );
  const overallParticipantGrowthRate =
    totalPreviousParticipants > 0
      ? Math.round(
          ((totalCurrentParticipants - totalPreviousParticipants) /
            totalPreviousParticipants) *
            100
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
      0
    ) || 0;
  const totalPreviousEvents =
    data.monthlyEventGrowth?.reduce(
      (sum, item) => sum + item.previousMonthEvents,
      0
    ) || 0;
  const overallEventGrowthRate =
    totalPreviousEvents > 0
      ? Math.round(
          ((totalCurrentEvents - totalPreviousEvents) / totalPreviousEvents) *
            100
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
          <h2 className="text-2xl font-semibold">Monthly Activity Report</h2>
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
            0
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
                    data.monthlySupplyDistributionGrowth.growthType
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
          <SupplyDistributionsSidebar
            supplyDistributions={data.supplyDistributions}
          />
        </div>
      </div>
    </div>
  );
}
