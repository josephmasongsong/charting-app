/**
 * The ways supplies reach tenants. `supply_distributions.distribution_type` is
 * varchar with no database enum, so the picker alone guarantees nothing — the
 * API validates writes against this list.
 *
 * Ordered as the form presents them.
 */
export const DISTRIBUTION_TYPES = [
  { value: 'door_to_door', label: 'Door to Door' },
  { value: 'tenant_request', label: 'Tenant Request' },
  { value: 'event_distribution', label: 'Event Distribution' },
] as const;

export type DistributionType = (typeof DISTRIBUTION_TYPES)[number]['value'];

export const DEFAULT_DISTRIBUTION_TYPE: DistributionType = 'door_to_door';

const VALUES: readonly string[] = DISTRIBUTION_TYPES.map(t => t.value);

export function isDistributionType(value: unknown): value is DistributionType {
  return typeof value === 'string' && VALUES.includes(value);
}

/**
 * Retired values still readable on historical rows. `emergency_distribution`
 * was dropped as an option in migration 0026 and `community_room_pickup` was
 * renamed to `tenant_request` there; both are kept here so anything rendering
 * an old row can still label it.
 */
const RETIRED_LABELS: Record<string, string> = {
  community_room_pickup: 'Community Room Pickup',
  emergency_distribution: 'Emergency Distribution',
};

/** Human label for any stored type, including retired ones. */
export function distributionTypeLabel(type: string): string {
  const known = DISTRIBUTION_TYPES.find(t => t.value === type);
  if (known) return known.label;
  if (RETIRED_LABELS[type]) return RETIRED_LABELS[type];
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
