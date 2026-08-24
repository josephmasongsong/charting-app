import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <Card
      className={cn(
        'gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) px-5 pt-[18px] pb-5 shadow-none',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[11.5px] font-bold tracking-[.06em] text-(--text-muted) uppercase">
          {title}
        </h3>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--action-selected) text-(--surface-chrome)">
          <Icon className="size-4" />
        </span>
      </div>

      <p className="mt-2.5 text-[30px] leading-none font-bold tracking-tight">
        {formatter(value)}
      </p>

      {subMetrics.length > 0 && (
        <div className="mt-2.5 space-y-1">
          {subMetrics.map((subMetric, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-xs text-(--text-muted)"
            >
              {React.isValidElement(subMetric.value) ? (
                <>
                  {subMetric.value} {subMetric.label}
                </>
              ) : (
                <>
                  <span className="inline-flex items-center">
                    {subMetric.formatter &&
                    (typeof subMetric.value === 'string' ||
                      typeof subMetric.value === 'number')
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
    </Card>
  );
}
