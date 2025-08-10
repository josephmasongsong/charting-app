'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Target } from 'lucide-react';

interface ProgramGoalSummary {
  id: string;
  name: string;
  activityCount: number;
  color: string;
}

interface ProgramGoalsPieChartProps {
  data: ProgramGoalSummary[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalActivities = payload[0].payload.totalActivities;
    const percentage = Math.round((data.activityCount / totalActivities) * 100);

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-sm">{data.name}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {data.activityCount} activities ({percentage}%)
        </div>
      </div>
    );
  }
  return null;
};

export function ProgramGoalsPieChart({ data }: ProgramGoalsPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalActivities = data.reduce(
    (sum, goal) => sum + goal.activityCount,
    0
  );

  // Add total to each data item for tooltip calculation
  const dataWithTotal = data.map(item => ({
    ...item,
    totalActivities,
  }));

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  const handleLegendHover = (goal: ProgramGoalSummary) => {
    const index = data.findIndex(g => g.id === goal.id);
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
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="font-semibold">Program Goals</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Target className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              No program goals found for this period
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
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="font-semibold">Program Goals</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Distribution of activities by goal
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Interactive Pie Chart */}
          <div className="relative w-full h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithTotal}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="activityCount"
                  onMouseEnter={handlePieEnter}
                  onMouseLeave={handlePieLeave}
                  cursor="pointer"
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
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Legend */}
          <div className="grid grid-cols-1 gap-2 w-full">
            {data.map((goal, index) => {
              const percentage = Math.round(
                (goal.activityCount / totalActivities) * 100
              );
              const isActive = activeIndex === index;

              return (
                <div
                  key={goal.id}
                  className={`flex items-center justify-between p-2 rounded-md transition-colors duration-200 cursor-pointer ${
                    isActive ? 'bg-muted' : 'hover:bg-muted/30'
                  }`}
                  onMouseEnter={() => handleLegendHover(goal)}
                  onMouseLeave={handleLegendLeave}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="text-sm font-medium truncate">
                      {goal.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">
                      {goal.activityCount}
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
              Total Activities:{' '}
              <span className="font-semibold text-primary">
                {totalActivities}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hover over chart segments for details
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
