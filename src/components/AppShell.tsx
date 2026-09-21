'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import BottomNav from '@/components/BottomNav';

// Mirrors ClientAuthGuard's list: these screens carry no app chrome.
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (!session || isPublic) {
    return <main className="min-h-screen bg-(--surface-page)">{children}</main>;
  }

  return (
    <>
      <Navigation />
      {/* Bottom padding keeps the fixed phone bar clear of page content. */}
      <main className="min-h-[calc(100dvh-3.5rem)] bg-(--surface-page) pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
