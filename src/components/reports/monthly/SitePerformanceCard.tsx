import React from 'react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { MapPin } from 'lucide-react';

interface SitePerformance {
  siteName: string;
  eventCount: number;
  participantCount: number;
  utilizationRate: number;
}

interface SitePerformanceCardProps {
  sites: SitePerformance[];
}

const progressTrackClass =
  'h-3.5 overflow-hidden rounded-full bg-(--bch-gray-200)';

export function SitePerformanceCard({ sites }: SitePerformanceCardProps) {
  // Sort sites by event count (descending) and take top 5
  const topSites = [...sites]
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 5);

  const maxEvents = topSites[0]?.eventCount || 1;

  return (
    <Card className="h-fit gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) p-5 shadow-none">
      <div className="mb-4 flex items-center gap-2 text-base font-bold">
        <MapPin className="size-4" />
        Site Activity This Period
      </div>

      {topSites.length > 0 ? (
        <div className="space-y-4">
          {topSites.map(site => {
            const barWidth = (site.eventCount / maxEvents) * 100;

            return (
              <div key={site.siteName} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2.5 text-sm">
                  <span className="font-semibold">{site.siteName}</span>
                  <span className="text-right text-xs whitespace-nowrap text-(--text-muted)">
                    {site.eventCount} events ·{' '}
                    {site.participantCount.toLocaleString()} participants
                  </span>
                </div>
                <div className={progressTrackClass}>
                  <div
                    className="h-full bg-(--surface-chrome)"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No site data available"
          description="No events recorded during this period"
          className="border-0"
        />
      )}
    </Card>
  );
}
