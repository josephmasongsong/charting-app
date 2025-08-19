'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Users2 } from 'lucide-react';

interface MonthlyParticipantGrowth {
  region: string;
  currentMonthParticipants: number;
  previousMonthParticipants: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface MonthlyParticipantGrowthChartProps {
  data: MonthlyParticipantGrowth[];
  reportPeriod: string;
}

export function MonthlyParticipantGrowthChart({
  data,
  reportPeriod,
}: MonthlyParticipantGrowthChartProps) {
  // Don't render if no data
  if (!data || data.length === 0) {
    return (
      <Card className="w-96">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            <CardTitle className="font-semibold">Growth Trends</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Users2 className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              No growth data available for this period
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  const getGrowthBadgeVariant = (growthType: string) => {
    switch (growthType) {
      case 'growth':
        return 'default'; // green
      case 'decline':
        return 'destructive'; // red
      default:
        return 'secondary'; // gray
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

  // Calculate overall stats
  const totalCurrent = data.reduce(
    (sum, item) => sum + item.currentMonthParticipants,
    0
  );
  const totalPrevious = data.reduce(
    (sum, item) => sum + item.previousMonthParticipants,
    0
  );
  const overallGrowthRate =
    totalPrevious > 0
      ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100)
      : 0;

  return (
    <Card className="w-96">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Users2 className="h-5 w-5 text-primary" />
          <CardTitle className="font-semibold">Growth Trends</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Month-over-month participant changes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Summary */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Overall Change
                </div>
                <div className="text-lg font-semibold">
                  {totalCurrent.toLocaleString()} participants
                </div>
                <div className="text-xs text-muted-foreground">
                  vs {totalPrevious.toLocaleString()} previous period
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`flex items-center gap-1 ${getGrowthColor(
                    overallGrowthRate > 2
                      ? 'growth'
                      : overallGrowthRate < -2
                        ? 'decline'
                        : 'stable'
                  )}`}
                >
                  {getGrowthIcon(
                    overallGrowthRate > 2
                      ? 'growth'
                      : overallGrowthRate < -2
                        ? 'decline'
                        : 'stable'
                  )}
                  <span className="font-semibold">
                    {overallGrowthRate > 0 ? '+' : ''}
                    {overallGrowthRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Breakdown */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">
              By Region
            </div>

            {data.map(region => (
              <div
                key={region.region}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{region.region}</span>
                    {getGrowthIcon(region.growthType)}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">
                      {region.currentMonthParticipants}
                    </span>{' '}
                    participants
                    {region.previousMonthParticipants > 0 && (
                      <span> (vs {region.previousMonthParticipants})</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    variant={getGrowthBadgeVariant(region.growthType)}
                    className="text-xs font-medium"
                  >
                    {region.growthRate > 0 ? '+' : ''}
                    {region.growthRate}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Growth Legend */}
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Growth indicators:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span>Growth</span>
                </div>
                <div className="flex items-center gap-1">
                  <Minus className="h-3 w-3 text-gray-500" />
                  <span>Stable</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <span>Decline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
