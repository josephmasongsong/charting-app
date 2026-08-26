// components/Navigation.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { BrandMark } from '@/components/ui/brand-mark';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Menu, X } from 'lucide-react';

// Menu chrome follows the design system's Listbox: near-square corners,
// input border, full-bleed rows, selection-blue hover.
const menuContentClass =
  'w-56 rounded-(--radius-input) border-(--border-input) bg-(--surface-card) p-0 shadow-(--shadow-card)';
const menuItemClass =
  'gap-2.5 rounded-none px-2.5 py-[9px] text-[14.5px] text-(--text-body) focus:bg-(--action-selected) focus:text-(--action-primary)';
const destructiveMenuItemClass =
  'gap-2.5 rounded-none px-2.5 py-[9px] text-[14.5px] text-(--danger) focus:bg-(--danger-surface) focus:text-(--danger)';

interface NavigationProps {
  /** Provided by AppShell on signed-in routes to toggle the narrow-screen rail. */
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function Navigation({
  onMenuClick,
  sidebarOpen = false,
}: NavigationProps = {}) {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (!session) return null;

  // Get user initials for avatar fallback
  const getUserInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const userInitials = getUserInitials(session.user?.name, session.user?.email);

  return (
    // PartnerHub chrome: dark teal header above the teal-600 rail, on every
    // route (supersedes the earlier blue-on-form-routes treatment).
    <nav className="sticky top-0 z-50 bg-(--surface-chrome-dark)">
      <div className="px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-1">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={sidebarOpen}
                aria-controls="app-sidebar"
                className="-ml-1 cursor-pointer rounded-(--radius-control) p-2 text-(--text-on-chrome) xl:hidden"
              >
                {sidebarOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            )}
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-[17px] font-bold tracking-[.3px] text-(--text-on-chrome)"
            >
              <BrandMark size={32} />
              BC HOUSING
            </Link>
          </div>

          {/* Right Side: User Menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex cursor-pointer items-center gap-2.5 rounded-(--radius-control) px-2 py-1.5 transition-colors hover:bg-(--surface-chrome)"
                  aria-label="User menu"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-(--radius-avatar) bg-white text-[12.5px] font-bold text-(--surface-chrome-dark)">
                    {userInitials}
                  </span>
                  <span className="hidden text-sm font-medium text-(--text-on-chrome) sm:inline">
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
      </div>
    </nav>
  );
}
