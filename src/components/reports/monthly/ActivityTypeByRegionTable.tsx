import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ActivityTypeByRegion,
  MonthlyParticipantGrowth,
  MonthlyEventGrowth,
  RegionalCostGrowth,
} from './types';
import {
  getGrowthIcon,
  getGrowthColor,
  getCostGrowthIcon,
  getCostGrowthColor,
} from './GrowthIndicators';

interface ActivityTypeByRegionTableProps {
  data: ActivityTypeByRegion[];
  participantGrowthData: MonthlyParticipantGrowth[];
  eventGrowthData: MonthlyEventGrowth[];
  costGrowthData: RegionalCostGrowth[];
}

const headCellClass =
  'h-auto whitespace-nowrap border border-[#0a7276] bg-(--surface-chrome) px-3.5 py-2.5 text-left text-xs font-bold tracking-[.04em] text-(--text-on-chrome) uppercase';
const bodyCellClass =
  'whitespace-nowrap border border-(--bch-gray-200) px-3.5 py-[9px]';
const bodyRowClass =
  'border-0 even:bg-(--surface-muted) hover:bg-(--action-selected)';
const footerCellClass =
  'whitespace-nowrap border border-[#9CCFC6] bg-[#AEDBD3] px-3.5 py-2.5 font-bold';

// Approved region-colour scheme: the DS chart series referenced through the
// underlying palette tokens (the --chart-* aliases are shadowed by shadcn's
// :root block), assigned client-side by index.
const CHART_COLORS = [
  'var(--bch-seafoam)',
  'var(--bch-sky-400)',
  'var(--bch-teal-700)',
  'var(--bch-teal-light)',
  'var(--bch-blue-600)',
];

export function ActivityTypeByRegionTable({
  data,
  participantGrowthData,
  eventGrowthData,
  costGrowthData,
}: ActivityTypeByRegionTableProps) {
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
      {Object.entries(groupedByRegion).map(([region, activities], index) => {
        const regionTotals = getRegionTotals(activities);
        const regionParticipantGrowth = getRegionParticipantGrowth(region);
        const regionEventGrowth = getRegionEventGrowth(region);
        const regionCostGrowth = getRegionCostGrowth(region);

        return (
          <Card
            key={region}
            className="gap-0 overflow-hidden rounded-(--radius-card) border-(--border-default) border-t-[3px] bg-(--surface-card) p-0 shadow-none"
            style={{
              borderTopColor: CHART_COLORS[index % CHART_COLORS.length],
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-(--border-default) px-5 py-4">
              <span className="flex items-center gap-2 text-base font-bold">
                <MapPin className="size-4" />
                {region} Region
              </span>
              <span className="text-[12.5px] text-(--text-muted)">
                {activities.length} activity types
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table className="border-collapse bg-(--surface-card) text-sm">
                <TableHeader>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className={headCellClass}>
                      Activity Type
                    </TableHead>
                    <TableHead className={cn(headCellClass, 'text-right')}>
                      Events
                    </TableHead>
                    <TableHead className={cn(headCellClass, 'text-right')}>
                      Participants
                    </TableHead>
                    <TableHead className={cn(headCellClass, 'text-right')}>
                      Total Cost
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map(activity => (
                    <TableRow
                      key={`${activity.region}-${activity.activityTypeId}`}
                      className={bodyRowClass}
                    >
                      <TableCell
                        className={cn(bodyCellClass, 'font-semibold whitespace-normal')}
                      >
                        {activity.activityTypeName}
                      </TableCell>
                      <TableCell className={cn(bodyCellClass, 'text-right')}>
                        {activity.eventCount}
                      </TableCell>
                      <TableCell className={cn(bodyCellClass, 'text-right')}>
                        {activity.participantsServed.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          bodyCellClass,
                          'text-right font-semibold tabular-nums'
                        )}
                      >
                        ${activity.totalCost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Region Total Row */}
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell className={footerCellClass}>
                      {region} Region Total
                    </TableCell>
                    <TableCell className={cn(footerCellClass, 'text-right')}>
                      <div className="flex items-center justify-end gap-2">
                        <span>{regionTotals.events}</span>
                        {regionEventGrowth && (
                          <div
                            className={cn(
                              'flex items-center gap-1',
                              getGrowthColor(regionEventGrowth.growthType)
                            )}
                          >
                            {getGrowthIcon(regionEventGrowth.growthType)}
                            <span className="text-xs font-semibold">
                              {regionEventGrowth.growthRate > 0 ? '+' : ''}
                              {regionEventGrowth.growthRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={cn(footerCellClass, 'text-right')}>
                      <div className="flex items-center justify-end gap-2">
                        <span>{regionTotals.participants.toLocaleString()}</span>
                        {regionParticipantGrowth && (
                          <div
                            className={cn(
                              'flex items-center gap-1',
                              getGrowthColor(regionParticipantGrowth.growthType)
                            )}
                          >
                            {getGrowthIcon(regionParticipantGrowth.growthType)}
                            <span className="text-xs font-semibold">
                              {regionParticipantGrowth.growthRate > 0
                                ? '+'
                                : ''}
                              {regionParticipantGrowth.growthRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(footerCellClass, 'text-right tabular-nums')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <span>${regionTotals.cost.toFixed(2)}</span>
                        {regionCostGrowth && (
                          <div
                            className={cn(
                              'flex items-center gap-1',
                              getCostGrowthColor(regionCostGrowth.growthType)
                            )}
                          >
                            {getCostGrowthIcon(regionCostGrowth.growthType)}
                            <span className="text-xs font-semibold">
                              {regionCostGrowth.growthRate > 0 ? '+' : ''}
                              {regionCostGrowth.growthRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
