// @/components/reports/monthly/MetricCard.tsx

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SubMetric {
  label: string;
  value: string | number | React.ReactNode;
  formatter?: (val: string | number) => string;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: any;
  formatter?: (val: number) => string;
  subMetrics?: SubMetric[];
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  formatter = (val: number) => val.toLocaleString(),
  subMetrics = [],
  className = '',
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-0">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <div className="text-muted-foreground">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Main value */}
        <div className="mb-2">
          <p className="text-2xl font-bold tracking-tight">
            {formatter(value)}
          </p>
        </div>

        {/* Sub-metrics */}
        {subMetrics.length > 0 && (
          <div className="space-y-1">
            {subMetrics.map((subMetric, index) => (
              <div
                key={index}
                className="text-xs text-muted-foreground flex items-center gap-1"
              >
                {React.isValidElement(subMetric.value) ? (
                  <>
                    {subMetric.value} {subMetric.label}
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center">
                      {subMetric.formatter
                        ? subMetric.formatter(subMetric.value)
                        : subMetric.value}
                    </span>{' '}
                    {subMetric.label}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
