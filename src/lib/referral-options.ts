/**
 * The referral taxonomy. `referrals.channel` and `referrals.referred_to` are
 * varchar with no database enum, so the chip pickers alone guarantee nothing —
 * the API validates writes against these lists.
 *
 * Both are ordered as the form presents them.
 */
export const CHANNELS = [
  { value: 'in_person', label: 'In person' },
  { value: 'phone_call', label: 'Phone call' },
  { value: 'email', label: 'Email' },
] as const;

export const REFERRED_TO = [
  { value: 'building_site_staff', label: 'Building or site staff' },
  { value: 'tenant_support_worker', label: 'Tenant support worker' },
  { value: 'third_party', label: 'Third party' },
  { value: 'other', label: 'Other' },
] as const;

export type ReferralChannel = (typeof CHANNELS)[number]['value'];
export type ReferredTo = (typeof REFERRED_TO)[number]['value'];

const CHANNEL_VALUES: readonly string[] = CHANNELS.map(c => c.value);
const REFERRED_TO_VALUES: readonly string[] = REFERRED_TO.map(r => r.value);

export function isChannel(value: unknown): value is ReferralChannel {
  return typeof value === 'string' && CHANNEL_VALUES.includes(value);
}

export function isReferredTo(value: unknown): value is ReferredTo {
  return typeof value === 'string' && REFERRED_TO_VALUES.includes(value);
}

/** Human label for a stored channel, falling back to the raw value. */
export function channelLabel(value: string): string {
  return CHANNELS.find(c => c.value === value)?.label ?? humanise(value);
}

/** Human label for a stored referral target, falling back to the raw value. */
export function referredToLabel(value: string): string {
  return REFERRED_TO.find(r => r.value === value)?.label ?? humanise(value);
}

function humanise(value: string): string {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
