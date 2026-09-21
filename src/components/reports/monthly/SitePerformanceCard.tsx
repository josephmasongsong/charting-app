import React from 'react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
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

interface SitePerformance {
  siteName: string;
  eventCount: number;
  participantCount: number;
  utilizationRate: number;
}

interface SitePerformanceCardProps {
  sites: SitePerformance[];
  totalSiteCount?: number;
}

const headCellClass =
  'h-auto whitespace-nowrap border border-[#0a7276] bg-(--surface-chrome) px-3.5 py-2.5 text-left text-xs font-bold tracking-[.04em] text-(--text-on-chrome) uppercase';
const bodyCellClass =
  'whitespace-nowrap border border-(--bch-gray-200) px-3.5 py-[9px]';
const bodyRowClass =
  'border-0 even:bg-(--surface-muted) hover:bg-(--action-selected)';
const footerCellClass =
  'whitespace-nowrap border border-[#9CCFC6] bg-[#AEDBD3] px-3.5 py-2.5 font-bold';

export function SitePerformanceCard({
  sites,
  totalSiteCount,
}: SitePerformanceCardProps) {
  const rankedSites = [...sites].sort(
    (a, b) =>
      b.participantCount - a.participantCount || b.eventCount - a.eventCount
  );

  // The list contains only sites with events this period.
  const visitedCount = sites.length;
  const totalVisits = sites.reduce((sum, site) => sum + site.eventCount, 0);
  const totalAttendances = sites.reduce(
    (sum, site) => sum + site.participantCount,
    0
  );

  return (
    <Card className="h-fit gap-0 overflow-hidden rounded-(--radius-card) border-(--border-default) bg-(--surface-card) p-0 shadow-none">
      <div className="flex items-center gap-2 border-b border-(--border-default) px-5 py-4 text-base font-bold">
        <MapPin className="size-4" />
        Site Activity This Period
      </div>

      {rankedSites.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table className="border-collapse bg-(--surface-card) text-sm">
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className={headCellClass}>Site</TableHead>
                  <TableHead className={cn(headCellClass, 'text-right')}>
                    Events
                  </TableHead>
                  <TableHead className={cn(headCellClass, 'text-right')}>
                    Attendances
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedSites.map(site => (
                  <TableRow key={site.siteName} className={bodyRowClass}>
                    <TableCell
                      className={cn(
                        bodyCellClass,
                        'font-semibold whitespace-normal'
                      )}
                    >
                      {site.siteName}
                    </TableCell>
                    <TableCell className={cn(bodyCellClass, 'text-right')}>
                      {site.eventCount.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={cn(bodyCellClass, 'text-right font-semibold')}
                    >
                      {site.participantCount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell className={footerCellClass}>
                    Total
                  </TableCell>
                  <TableCell className={cn(footerCellClass, 'text-right')}>
                    {totalVisits.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn(footerCellClass, 'text-right')}>
                    {totalAttendances.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          {typeof totalSiteCount === 'number' && totalSiteCount > 0 && (
            <div className="border-t border-(--border-default) px-5 py-3 text-[12.5px] text-(--text-muted)">
              {visitedCount} of {totalSiteCount} sites visited this period
            </div>
          )}
        </>
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
