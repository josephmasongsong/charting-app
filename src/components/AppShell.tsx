'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import AppSidebar from '@/components/AppSidebar';
import { cn } from '@/lib/utils';

// Mirrors ClientAuthGuard's list: these screens carry no app chrome.
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Close the off-canvas rail whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  if (!session || isPublic) {
    return <main className="min-h-screen bg-(--surface-page)">{children}</main>;
  }

  return (
    <>
      <Navigation
        onMenuClick={() => setMobileOpen(open => !open)}
        sidebarOpen={mobileOpen}
      />
      <div className="flex">
        {mobileOpen && (
          <div
            aria-hidden
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-14 z-40 bg-black/40 xl:hidden"
          />
        )}
        <AppSidebar
          id="app-sidebar"
          className={cn(
            'fixed top-14 bottom-0 left-0 z-40 overflow-y-auto transition-transform',
            'xl:static xl:z-auto xl:translate-x-0 xl:transition-none',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
