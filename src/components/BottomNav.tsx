'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Modal } from '@/components/ui/modal';
import { LogOut, MoreHorizontal, PlusCircle, Settings } from 'lucide-react';
import { adminNav, isActiveHref, logActions, primaryNav } from '@/lib/nav';
import { cn } from '@/lib/utils';

// The design system has no bottom-navigation precedent; the surface recipe is
// borrowed from the sticky action bar its form templates use (page surface,
// hairline top border). 56px rows clear a 44px touch target.
const barClass =
  'fixed inset-x-0 bottom-0 z-40 flex border-t border-(--border-default) bg-(--surface-card) pb-[env(safe-area-inset-bottom)] md:hidden';
const tabClass =
  'flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1 px-1 py-2 text-[11px]';
const activeTabClass = 'font-semibold text-(--action-primary)';
const idleTabClass = 'text-(--text-muted)';
// Pins ui/modal to the bottom edge as a sheet, inheriting Radix's focus trap,
// Escape handling and scroll lock.
const sheetClass =
  'top-auto bottom-0 left-0 max-w-full translate-x-0 translate-y-0 rounded-b-none sm:max-w-full';
const sheetItemClass =
  'flex min-h-12 items-center gap-3 border-b border-(--bch-gray-200) px-5 text-[15px] text-(--text-body) last:border-b-0 hover:bg-(--action-selected) hover:text-(--action-primary)';

export default function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [logOpen, setLogOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  // Dismiss either sheet as soon as navigation happens.
  useEffect(() => {
    setLogOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  if (!session) return null;

  const logActive = logActions.some(item => pathname === item.href);

  return (
    <>
      <nav aria-label="Primary" className={barClass}>
        {primaryNav.slice(0, 2).map(item => {
          const active = isActiveHref(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(tabClass, active ? activeTabClass : idleTabClass)}
            >
              <item.icon className="size-[19px]" />
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setLogOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={logOpen}
          className={cn(tabClass, logActive ? activeTabClass : idleTabClass)}
        >
          <PlusCircle className="size-[19px]" />
          Log
        </button>

        {primaryNav.slice(2).map(item => {
          const active = isActiveHref(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(tabClass, active ? activeTabClass : idleTabClass)}
            >
              <item.icon className="size-[19px]" />
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          className={cn(
            tabClass,
            pathname.startsWith('/admin') || pathname === '/settings'
              ? activeTabClass
              : idleTabClass
          )}
        >
          <MoreHorizontal className="size-[19px]" />
          More
        </button>
      </nav>

      <Modal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="Log activity"
        className={sheetClass}
      >
        <div className="pb-[env(safe-area-inset-bottom)]">
          {logActions.map(item => (
            <Link key={item.href} href={item.href} className={sheetItemClass}>
              <item.icon className="size-[19px] text-(--action-primary)" />
              {item.label}
            </Link>
          ))}
        </div>
      </Modal>

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More"
        className={sheetClass}
      >
        <div className="max-h-[60vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          <Link href="/settings" className={sheetItemClass}>
            <Settings className="size-[19px] text-(--action-primary)" />
            Settings
          </Link>

          {isAdmin && (
            <>
              <div className="border-b border-(--bch-gray-200) bg-(--surface-muted) px-5 py-2 text-[11.5px] font-bold tracking-[.06em] text-(--text-muted) uppercase">
                Admin
              </div>
              {adminNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={sheetItemClass}
                >
                  <item.icon className="size-[19px] text-(--action-primary)" />
                  {item.label}
                </Link>
              ))}
            </>
          )}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              sheetItemClass,
              'w-full cursor-pointer text-(--danger) hover:bg-(--danger-surface) hover:text-(--danger)'
            )}
          >
            <LogOut className="size-[19px]" />
            Sign Out
          </button>
        </div>
      </Modal>
    </>
  );
}
