'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  MapPin,
  Calendar,
  Settings,
  Shield,
  LogOut,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navigation() {
  const { data: session } = useSession();
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

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link
            href="/dashboard"
            className="font-bold text-xl flex items-center"
          >
            <Image
              src="/logo.jpg"
              width={40}
              height={40}
              alt="BCH Tenant Engagement"
              className="h-10 w-10 mr-4"
            />
            Tenant Engagement
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/sites">
              <Button variant="ghost" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Sites
              </Button>
            </Link>

            <Link href="/events">
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </Button>
            </Link>

            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Right Side - Create Event Button + User Menu */}
          <div className="flex items-center space-x-3">
            {/* Create Event Button */}
            <Link href="/events/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
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
                  <span>{session.user?.name || session.user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

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
