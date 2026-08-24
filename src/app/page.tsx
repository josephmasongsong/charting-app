import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrandMark } from '@/components/ui/brand-mark';
import Link from 'next/link';

const pageClass =
  'flex min-h-screen items-center justify-center bg-(--action-primary) px-6 py-12';
const cardClass =
  'w-full max-w-[480px] gap-0 rounded-(--radius-card) border-0 bg-(--surface-card) px-12 pt-10 pb-11 shadow-none';
const primaryClass =
  'mt-8 h-auto w-full rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[11px] text-[15.5px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover)';

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Show landing page for unauthenticated users
  return (
    <div className={pageClass}>
      <Card className={cardClass}>
        <div className="flex items-center justify-center gap-2.5">
          <BrandMark size={34} />
          <span className="text-2xl font-bold tracking-[.02em] text-(--surface-chrome)">
            BC HOUSING
          </span>
        </div>

        <h1 className="mt-7 text-center text-xl leading-tight font-bold text-(--surface-chrome)">
          Welcome
        </h1>
        <p className="mt-1.5 text-center text-[14.5px] text-(--text-muted)">
          Please sign in to access your account
        </p>

        <Button asChild className={primaryClass}>
          <Link href="/login">Sign In</Link>
        </Button>

        <Link
          href="/forgot-password"
          className="mt-6 text-center text-[14.5px] text-(--action-primary) hover:text-(--action-primary-hover) hover:underline"
        >
          Forgot Password?
        </Link>
      </Card>
    </div>
  );
}
