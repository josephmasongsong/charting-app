'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { Activity } from 'lucide-react';

interface ActivityTypeParticipation {
  id: string;
  name: string;
  participantCount: number;
  eventCount: number;
  color: string;
}

interface ActivityTypesParticipationChartProps {
  data: ActivityTypeParticipation[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalParticipants = data.totalParticipants;
    const percentage = Math.round(
      (data.participantCount / totalParticipants) * 100
    );

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-sm">{data.name}</span>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            {data.participantCount} participants ({percentage}%)
          </div>
          <div>{data.eventCount} events</div>
        </div>
      </div>
    );
  }
  return null;
};

export function ActivityTypesParticipationChart({
  data,
}: ActivityTypesParticipationChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalParticipants = data.reduce(
    (sum, activity) => sum + activity.participantCount,
    0
  );

  // Add total to each data item for tooltip calculation and sort by participant count
  const dataWithTotal = data
    .map(item => ({
      ...item,
      totalParticipants,
    }))
    .sort((a, b) => b.participantCount - a.participantCount)
    .slice(0, 8); // Show top 8 activity types to fit better in vertical layout

  const handleBarEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleBarLeave = () => {
    setActiveIndex(null);
  };

  const handleLegendHover = (activity: ActivityTypeParticipation) => {
    const index = dataWithTotal.findIndex(a => a.id === activity.id);
    setActiveIndex(index);
  };

  const handleLegendLeave = () => {
    setActiveIndex(null);
  };

  // Don't render if no data
  if (!data || data.length === 0) {
    return (
      <Card className="w-96">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="font-semibold">Activity Types</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              No activity types found for this period
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="font-semibold">Activity Types</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Participation share by activity type
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {/* Interactive Bar Chart */}
          <div className="w-full h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataWithTotal}
                margin={{ top: 5, right: 5, left: 5, bottom: 60 }}
              >
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                />
                <YAxis fontSize={10} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="participantCount"
                  onMouseEnter={handleBarEnter}
                  onMouseLeave={handleBarLeave}
                  cursor="pointer"
                  radius={[2, 2, 0, 0]}
                >
                  {dataWithTotal.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{
                        opacity:
                          activeIndex === null
                            ? 1
                            : activeIndex === index
                              ? 1
                              : 0.6,
                        transition: 'opacity 0.2s ease-in-out',
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Legend */}
          <div className="grid grid-cols-1 gap-2 w-full max-h-48 overflow-y-auto">
            {dataWithTotal.map((activity, index) => {
              const percentage = Math.round(
                (activity.participantCount / totalParticipants) * 100
              );
              const isActive = activeIndex === index;

              return (
                <div
                  key={activity.id}
                  className={`flex items-center justify-between p-2 rounded-md transition-colors duration-200 cursor-pointer ${
                    isActive ? 'bg-muted' : 'hover:bg-muted/30'
                  }`}
                  onMouseEnter={() => handleLegendHover(activity)}
                  onMouseLeave={handleLegendLeave}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: activity.color }}
                    />
                    <span className="text-sm font-medium truncate">
                      {activity.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">
                      {activity.participantCount}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {percentage}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <div className="text-sm font-medium text-muted-foreground">
              Total Participants:{' '}
              <span className="font-semibold text-primary">
                {totalParticipants}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dataWithTotal.length < data.length &&
                `Showing top ${dataWithTotal.length} activity types • `}
              Hover over bars for details
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
