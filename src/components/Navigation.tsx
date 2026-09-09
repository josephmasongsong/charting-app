// components/Navigation.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/ui/brand-mark';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { adminNav, isActiveHref, logActions, primaryNav } from '@/lib/nav';
import { cn } from '@/lib/utils';

// Menu chrome follows the design system's Listbox: near-square corners,
// input border, full-bleed rows, selection-blue hover.
const menuContentClass =
  'w-56 rounded-(--radius-input) border-(--border-input) bg-(--surface-card) p-0 shadow-(--shadow-card)';
const menuItemClass =
  'gap-2.5 rounded-none px-2.5 py-[9px] text-[14.5px] text-(--text-body) focus:bg-(--action-selected) focus:text-(--action-primary)';
const destructiveMenuItemClass =
  'gap-2.5 rounded-none px-2.5 py-[9px] text-[14.5px] text-(--danger) focus:bg-(--danger-surface) focus:text-(--danger)';
// Header nav follows the FeedbackWizard precedent: white, gap-4, 14.5px.
const navLinkClass =
  'flex items-center gap-1 border-b-2 py-1 text-[14.5px] text-(--text-on-chrome) transition-opacity';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (!session) return null;

  const isAdmin = session.user?.role === 'admin';

  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) return email[0].toUpperCase();
    return 'U';
  };

  const userInitials = getUserInitials(session.user?.name, session.user?.email);
  const logActive = logActions.some(item => pathname === item.href);
  const adminActive = pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 bg-(--surface-chrome)">
      <div className="px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-2.5 text-[17px] font-bold tracking-[.3px] text-(--text-on-chrome)"
            >
              <BrandMark size={32} />
              <span className="hidden sm:inline">BC HOUSING</span>
            </Link>

            {/* Phones navigate from the bottom bar instead. */}
            <div className="hidden items-center gap-4 md:flex">
              {primaryNav.map(item => {
                const active = isActiveHref(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      navLinkClass,
                      active
                        ? 'border-(--text-on-chrome) font-semibold'
                        : 'border-transparent opacity-85 hover:opacity-100'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      navLinkClass,
                      'cursor-pointer',
                      logActive
                        ? 'border-(--text-on-chrome) font-semibold'
                        : 'border-transparent opacity-85 hover:opacity-100'
                    )}
                  >
                    Log
                    <ChevronDown className="size-[13px]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className={menuContentClass}>
                  {logActions.map(item => (
                    <DropdownMenuItem
                      key={item.href}
                      asChild
                      className={menuItemClass}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        navLinkClass,
                        'cursor-pointer',
                        adminActive
                          ? 'border-(--text-on-chrome) font-semibold'
                          : 'border-transparent opacity-85 hover:opacity-100'
                      )}
                    >
                      Admin
                      <ChevronDown className="size-[13px]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className={menuContentClass}
                  >
                    {adminNav.map(item => (
                      <DropdownMenuItem
                        key={item.href}
                        asChild
                        className={menuItemClass}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-(--radius-control) px-2 py-1.5 transition-colors hover:bg-(--surface-chrome-dark)"
                aria-label="User menu"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-(--radius-avatar) bg-white text-[12.5px] font-bold text-(--surface-chrome)">
                  {userInitials}
                </span>
                <span className="hidden text-sm font-medium text-(--text-on-chrome) lg:inline">
                  {session.user?.name || session.user?.email}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className={menuContentClass}
            >
              <DropdownMenuItem asChild className={menuItemClass}>
                <Link href="/settings">
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-0 bg-(--border-default)" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className={destructiveMenuItemClass}
              >
                <LogOut className="size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
