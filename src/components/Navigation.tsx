// components/Navigation.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { BrandMark } from '@/components/ui/brand-mark';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

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

  const isDashboardActive = pathname === '/dashboard';
  // Form surfaces (log event, log distribution, create/edit site, ...) wear
  // the blue header per the templates; everything else stays teal chrome.
  const isFormRoute = pathname.endsWith('/new') || pathname.endsWith('/edit');

  return (
    <nav
      className={cn(
        'sticky top-0 z-50',
        isFormRoute ? 'bg-(--action-primary)' : 'bg-(--surface-chrome)'
      )}
    >
      <div className="px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo/Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-[17px] font-bold tracking-[.3px] text-(--text-on-chrome)"
          >
            <BrandMark size={32} />
            BC HOUSING
          </Link>

          {/* Right Side: Dashboard Icon + User Menu */}
          <div className="flex items-center gap-2">
            {/* Dashboard (grid) icon */}
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              aria-current={isDashboardActive ? 'page' : undefined}
              className={cn(
                'rounded-(--radius-control) p-2 text-(--text-on-chrome) transition-colors',
                !isDashboardActive && 'opacity-80 hover:opacity-100'
              )}
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-(--radius-control) px-2 py-1.5 transition-colors',
                    isFormRoute
                      ? 'hover:bg-(--action-primary-hover)'
                      : 'hover:bg-(--surface-chrome-dark)'
                  )}
                  aria-label="User menu"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-(--radius-avatar) bg-white text-[12.5px] font-bold text-(--surface-chrome)">
                    {userInitials}
                  </span>
                  <span className="hidden text-sm font-medium text-(--text-on-chrome) sm:inline">
                    {session.user?.name || session.user?.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-(--danger)"
                >
                  <LogOut className="h-4 w-4 mr-2" />
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
