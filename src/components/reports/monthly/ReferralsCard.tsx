import React from 'react';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { ReferralBreakdownItem, ReferralSummary } from './types';
import { getGrowthColor, getGrowthIcon } from './GrowthIndicators';

// Series colors follow the DS chart tokens and belong to the category, not its
// rank, so a category keeps its color whichever others have data.
const REFERRED_TO_COLORS: Record<string, string> = {
  building_site_staff: 'var(--chart-3)',
  health_services: 'var(--chart-2)',
  third_party_provider: 'var(--chart-1)',
  other: 'var(--chart-4)',
};
const CHANNEL_COLORS: Record<string, string> = {
  in_person: 'var(--chart-3)',
  phone_call: 'var(--chart-2)',
  email: 'var(--chart-1)',
};
const FALLBACK_COLOR = 'var(--bch-gray-300)';

const percent = (count: number, total: number) =>
  total > 0 ? Math.round((count / total) * 100) : 0;

const describe = (items: ReferralBreakdownItem[], total: number) =>
  items
    .filter(item => item.count > 0)
    .map(item => `${item.label} ${item.count} (${percent(item.count, total)}%)`)
    .join(', ');

interface ReferralsCardProps {
  referrals: ReferralSummary;
}

export function ReferralsCard({ referrals }: ReferralsCardProps) {
  const { total, previousTotal, byReferredTo, byChannel } = referrals;

  const growthRate =
    previousTotal > 0
      ? Math.round(((total - previousTotal) / previousTotal) * 100)
      : 0;
  const growthType =
    growthRate > 2 ? 'growth' : growthRate < -2 ? 'decline' : 'stable';

  const colorFor = (map: Record<string, string>, value: string) =>
    map[value] ?? FALLBACK_COLOR;

  let running = 0;
  const donutStops = byReferredTo
    .filter(item => item.count > 0)
    .map(item => {
      const from = (running / total) * 100;
      running += item.count;
      const to = (running / total) * 100;
      return `${colorFor(REFERRED_TO_COLORS, item.value)} ${from}% ${to}%`;
    })
    .join(', ');

  const channelSegments = byChannel.filter(item => item.count > 0);

  return (
    <Card className="h-fit gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) p-5 shadow-none">
      <div className="flex items-center gap-2 text-base font-bold">
        <FileText className="size-4" />
        Tenant Referrals
      </div>

      {total > 0 ? (
        <>
          <div className="mt-1.5 mb-4 flex flex-wrap items-baseline gap-2">
            <span className="text-[30px] leading-none font-bold">
              {total.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-xs text-(--text-muted)">
              {previousTotal > 0 ? (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    getGrowthColor(growthType)
                  )}
                >
                  {getGrowthIcon(growthType)}
                  <span>
                    {growthRate > 0 ? '+' : ''}
                    {growthRate}%
                  </span>
                </span>
              ) : (
                'N/A'
              )}{' '}
              vs Previous Period
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div
              role="img"
              aria-label={`Referrals by destination: ${describe(byReferredTo, total)}`}
              className="relative size-[108px] shrink-0 rounded-full"
              style={{ background: `conic-gradient(${donutStops})` }}
            >
              <div className="absolute inset-[18px] grid place-items-center rounded-full bg-(--surface-card)">
                <span className="text-[11px] font-semibold text-(--text-muted)">
                  referrals
                </span>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              {byReferredTo.map(item => (
                <div key={item.value} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      background: colorFor(REFERRED_TO_COLORS, item.value),
                    }}
                  />
                  <span className="min-w-0 flex-1 text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="text-[12.5px] whitespace-nowrap text-(--text-muted)">
                    {item.count} · {percent(item.count, total)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-(--border-default) pt-4">
            <div className="mb-2 text-[12.5px] font-semibold text-(--text-muted)">
              By channel
            </div>
            <div
              role="img"
              aria-label={`Referrals by channel: ${describe(byChannel, total)}`}
              className="flex h-2.5 gap-0.5 overflow-hidden rounded-[5px]"
            >
              {channelSegments.map(item => (
                <div
                  key={item.value}
                  style={{
                    flex: item.count,
                    background: colorFor(CHANNEL_COLORS, item.value),
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1">
              {byChannel.map(item => (
                <span
                  key={item.value}
                  className="flex items-center gap-1.5 text-[12.5px] text-(--text-muted)"
                >
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{
                      background: colorFor(CHANNEL_COLORS, item.value),
                    }}
                  />
                  {percent(item.count, total)}% {item.label.toLowerCase()} (
                  {item.count})
                </span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="No referrals recorded"
          description="No tenant referrals were logged during this period"
          className="border-0"
        />
      )}
    </Card>
  );
}
