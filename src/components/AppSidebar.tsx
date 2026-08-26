'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  CalendarDays,
  Home,
  MapPin,
  Newspaper,
  Package,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { Sidebar, SidebarGroup, SidebarItem } from '@/components/ui/sidebar';

const ICON_SIZE = 17;

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

// Browse destinations first, then the Quick Start actions the dashboard
// used to carry as cards.
const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/events', icon: CalendarDays, label: 'Events' },
  { href: '/sites', icon: MapPin, label: 'Sites' },
  { href: '/events/new', icon: Calendar, label: 'Log New Event' },
  {
    href: '/supply-distributions/new',
    icon: Package,
    label: 'Log Supply Distribution',
  },
  { href: '/reports/monthly', icon: Newspaper, label: 'Monthly Reports' },
];

// /admin/settings is deliberately absent — no page exists for it.
const adminItems: Array<{ href: string; label: string }> = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/sites', label: 'Sites' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/program-goals', label: 'Program Goals' },
  { href: '/admin/activity-types', label: 'Activity Types' },
  { href: '/admin/community-partners', label: 'Community Partners' },
  { href: '/admin/supplies', label: 'Supplies' },
  { href: '/admin/supply-distributions', label: 'Distributions' },
];

export default function AppSidebar({
  className,
  id,
}: {
  className?: string;
  id?: string;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'admin';
  // Seeded once per full load; the layout keeps this mounted across client
  // navigations, so a user's collapse choice survives navigation.
  const [adminOpen, setAdminOpen] = useState(() =>
    pathname.startsWith('/admin')
  );

  return (
    <Sidebar id={id} className={className}>
      {navItems.map(item => {
        // Exact match: /events must not light up on /events/new.
        const active = pathname === item.href;
        return (
          <SidebarItem key={item.href} asChild active={active}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon size={ICON_SIZE} />
              {item.label}
            </Link>
          </SidebarItem>
        );
      })}

      {isAdmin && (
        <>
          <SidebarItem
            icon={<Shield size={ICON_SIZE} />}
            chevron={adminOpen ? 'down' : 'right'}
            aria-expanded={adminOpen}
            onClick={() => setAdminOpen(open => !open)}
          >
            Admin
          </SidebarItem>
          {adminOpen && (
            <SidebarGroup>
              {adminItems.map(item => {
                // Section pages stay lit on their nested routes; the index
                // must match exactly or it would light for every /admin/*.
                const active =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarItem key={item.href} asChild indent active={active}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </SidebarItem>
                );
              })}
            </SidebarGroup>
          )}
        </>
      )}
    </Sidebar>
  );
}
