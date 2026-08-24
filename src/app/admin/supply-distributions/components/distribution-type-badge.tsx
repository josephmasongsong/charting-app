'use client';

import { cn } from '@/lib/utils';

/** Formats a snake_case distribution type for display. */
export function formatDistributionType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const typeChipClasses: Record<string, string> = {
  door_to_door: 'bg-(--surface-chrome) font-bold text-(--text-on-chrome)',
  event_distribution:
    'border border-(--bch-blue-100) bg-(--action-selected) font-semibold text-(--action-primary)',
  community_room_pickup:
    'border border-[#f0e2b0] bg-(--bch-tan-50) font-semibold text-(--bch-tan-700)',
  emergency_distribution:
    'bg-(--danger-surface) font-semibold text-(--danger)',
};

export function DistributionTypeBadge({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  return (
    <span
      data-slot="distribution-type-badge"
      className={cn(
        'inline-flex rounded-(--radius-control) px-2.5 py-[3px] text-[12.5px] whitespace-nowrap',
        typeChipClasses[type] ??
          'bg-(--surface-muted) font-semibold text-(--text-body)',
        className
      )}
    >
      {formatDistributionType(type)}
    </span>
  );
}
