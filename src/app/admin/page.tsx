'use client';
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  Activity,
  Package,
  Settings,
  Truck,
  Calendar,
  Building,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tileClass =
  'h-auto w-full flex-col gap-2 rounded-(--radius-control) border-(--border-default) bg-(--surface-card) py-4 text-(--text-body) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const primaryTileClass =
  'h-auto w-full flex-col gap-2 rounded-(--radius-control) border-(--action-primary) bg-(--action-primary) py-4 text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) hover:text-(--text-on-chrome)';

const navItems: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
  primary?: boolean;
}> = [
  { href: '/events/new', icon: Calendar, label: 'New Event', primary: true },
  {
    href: '/supply-distributions/new',
    icon: Truck,
    label: 'Log Distribution',
  },
  { href: '/admin/sites', icon: Building, label: 'Manage Sites' },
  { href: '/reports/monthly', icon: Target, label: 'View Reports' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/program-goals', icon: Target, label: 'Program Goals' },
  { href: '/admin/activity-types', icon: Activity, label: 'Activity Types' },
  {
    href: '/admin/community-partners',
    icon: Users,
    label: 'Community Partners',
  },
  { href: '/admin/supplies', icon: Package, label: 'Supplies' },
  {
    href: '/admin/supply-distributions',
    icon: Truck,
    label: 'Distributions',
  },
  { href: '/admin/events', icon: Calendar, label: 'Events' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-5">
      <Card className="gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) p-5 shadow-none">
        <h2 className="text-[17px] font-bold">Admin Navigation</h2>
        <p className="mt-0.5 text-[13px] text-(--text-muted)">
          Common tasks and resource management
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {navItems.map(item => (
            <Button
              key={item.href}
              asChild
              variant={item.primary ? 'default' : 'outline'}
              className={cn(item.primary ? primaryTileClass : tileClass)}
            >
              <Link href={item.href}>
                <item.icon className="size-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
