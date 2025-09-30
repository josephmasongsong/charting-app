// @/components/reports/monthly/ActivityTypeByRegionTable.tsx

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
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
      {Object.entries(groupedByRegion).map(([region, activities]) => {
        const regionTotals = getRegionTotals(activities);
        const regionParticipantGrowth = getRegionParticipantGrowth(region);
        const regionEventGrowth = getRegionEventGrowth(region);
        const regionCostGrowth = getRegionCostGrowth(region);

        return (
          <Card key={region}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {region} Region
                </CardTitle>
                <Badge variant="outline" className="font-normal">
                  {activities.length} Activity Types
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b hover:bg-muted/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-foreground align-middle whitespace-nowrap">
                        Activity Type
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-foreground align-middle whitespace-nowrap">
                        Events
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-foreground align-middle whitespace-nowrap">
                        Participants
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-foreground align-middle whitespace-nowrap">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activities.map(activity => (
                      <tr
                        key={`${activity.region}-${activity.activityTypeId}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-medium">
                          {activity.activityTypeName}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          {activity.eventCount}
                        </td>
                        <td className="py-3 px-4 text-sm text-center">
                          {activity.participantsServed.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          ${activity.totalCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Region Total Row */}
                    <tr className="bg-primary/5 border-t-2 border-primary/20">
                      <td className="py-3 px-4 text-sm font-semibold text-primary">
                        {region} Region Total
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-semibold text-primary">
                            {regionTotals.events}
                          </span>
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
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-semibold text-primary">
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
                      <td className="py-3 px-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-primary">
                            ${regionTotals.cost.toFixed(2)}
                          </span>
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
