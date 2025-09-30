// components/Navigation.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Shield, BarChart3, LayoutGrid } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'admin';

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

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto xl:px-0 px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.jpg"
              width={40}
              height={40}
              alt="BCH Tenant Engagement"
              className="h-10 w-10 rounded-md"
            />
          </Link>

          {/* Right Side: Dashboard Icon + User Menu */}
          <div className="flex items-center gap-2">
            {/* Dashboard (grid) icon */}
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              aria-current={isDashboardActive ? 'page' : undefined}
              className={[
                'p-2 rounded-xl transition-colors',
                isDashboardActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <LayoutGrid className="h-5 w-5" />
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user?.image || undefined}
                      alt={
                        session.user?.name ||
                        session.user?.email ||
                        'User avatar'
                      }
                    />
                    <AvatarFallback className="text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">
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
                {/*
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/reports/monthly" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Monthly Reports
                    </Link>
                  </DropdownMenuItem>
                )} */}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
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
