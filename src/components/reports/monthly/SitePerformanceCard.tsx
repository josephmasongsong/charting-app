// @/components/reports/monthly/SitePerformanceCard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function SitePerformanceCard({ sites }: SitePerformanceCardProps) {
  // Sort sites by event count (descending) and take top 5
  const topSites = [...sites]
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 5);

  const maxEvents = topSites[0]?.eventCount || 1;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MapPin className="h-5 w-5" />
          Site Activity This Period
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topSites.length > 0 ? (
          <div className="space-y-4">
            {topSites.map(site => {
              const barWidth = (site.eventCount / maxEvents) * 100;

              return (
                <div key={site.siteName} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{site.siteName}</span>
                    <span className="text-muted-foreground text-xs">
                      {site.eventCount} events ·{' '}
                      {site.participantCount.toLocaleString()} participants
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">
              No site data available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              No events recorded during this period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
