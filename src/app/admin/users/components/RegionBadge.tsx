interface RegionBadgeProps {
  region?: string;
}

export default function RegionBadge({ region }: RegionBadgeProps) {
  return (
    <span
      data-slot="region-badge"
      className="inline-flex rounded-full bg-(--surface-muted) px-2.5 py-[3px] text-[12.5px] font-semibold whitespace-nowrap text-(--text-body)"
    >
      {region || 'LMDM'}
    </span>
  );
}
