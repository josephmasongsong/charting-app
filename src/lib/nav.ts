import {
  Activity,
  Box,
  Building,
  CalendarDays,
  CalendarPlus,
  FileText,
  Home,
  MapPin,
  Newspaper,
  Package,
  Target,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

/** Destinations shown directly in the header and the phone tab bar. */
export const primaryNav: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/events', icon: CalendarDays, label: 'Events' },
  { href: '/reports/monthly', icon: Newspaper, label: 'Reports' },
];

/** The three logging actions, grouped behind a single "Log" affordance. */
export const logActions: NavItem[] = [
  { href: '/events/new', icon: CalendarPlus, label: 'Log Event' },
  {
    href: '/supply-distributions/new',
    icon: Package,
    label: 'Log Distribution',
  },
  { href: '/referrals/new', icon: FileText, label: 'Log Referral' },
];

/** Admin sections. /admin/settings is absent on purpose — no page exists. */
export const adminNav: NavItem[] = [
  { href: '/admin/events', icon: CalendarDays, label: 'Events' },
  { href: '/admin/sites', icon: MapPin, label: 'Sites' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/program-goals', icon: Target, label: 'Program Goals' },
  { href: '/admin/activity-types', icon: Activity, label: 'Activity Types' },
  {
    href: '/admin/community-partners',
    icon: Building,
    label: 'Community Partners',
  },
  { href: '/admin/supplies', icon: Box, label: 'Supplies' },
  { href: '/admin/supply-distributions', icon: Truck, label: 'Distributions' },
  { href: '/admin/referrals', icon: FileText, label: 'Referrals' },
];

/**
 * Exact match by default so /events does not light up on /events/new.
 * `prefix` keeps a section lit on its nested routes (/admin/sites/new), with a
 * trailing slash so sibling prefixes can never cross-match.
 */
export function isActiveHref(pathname: string, href: string, prefix = false) {
  return prefix
    ? pathname === href || pathname.startsWith(`${href}/`)
    : pathname === href;
}
