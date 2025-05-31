'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ClientAuthGuardProps {
  children: React.ReactNode;
}

export default function ClientAuthGuard({ children }: ClientAuthGuardProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    // If not authenticated and trying to access a protected route
    if (!session && !isPublicRoute) {
      router.push('/login');
      return;
    }

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (session && isPublicRoute && pathname !== '/reset-password') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, pathname, isPublicRoute, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (!session && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Redirecting to login...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while redirecting authenticated users away from auth pages
  if (session && isPublicRoute && pathname !== '/reset-password') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Redirecting to dashboard...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
