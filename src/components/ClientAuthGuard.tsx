'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

function GuardLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--surface-page)">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-(--action-primary)" />
        <p className="text-(--text-muted)">{message}</p>
      </div>
    </div>
  );
}

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
    return <GuardLoading message="Loading..." />;
  }

  // Show loading while redirecting unauthenticated users
  if (!session && !isPublicRoute) {
    return <GuardLoading message="Redirecting to login..." />;
  }

  // Show loading while redirecting authenticated users away from auth pages
  if (session && isPublicRoute && pathname !== '/reset-password') {
    return <GuardLoading message="Redirecting to dashboard..." />;
  }

  return <>{children}</>;
}
