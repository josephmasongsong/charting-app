'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandMark } from '@/components/ui/brand-mark';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const pageClass =
  'flex min-h-screen items-center justify-center bg-(--action-primary) px-6 py-12';
const cardClass =
  'w-full max-w-[480px] gap-0 rounded-(--radius-card) border-0 bg-(--surface-card) px-12 pt-10 pb-11 shadow-none';
const labelClass = 'text-[14.5px] font-semibold';
const inputClass =
  'h-10 rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] shadow-none md:text-[15px] focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)';
const submitClass =
  'h-auto w-full rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[11px] text-[15.5px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';

export default function Login() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading while checking session or redirecting
  if (status === 'loading') {
    return (
      <div className={pageClass}>
        <Card className={cardClass}>
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Don't render login form if authenticated (during redirect)
  if (status === 'authenticated') {
    return (
      <div className={pageClass}>
        <Card className={cardClass}>
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Redirecting to dashboard...</span>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // The useEffect will handle the redirect after session updates
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={pageClass}>
      <Card className={cardClass}>
        <div className="flex items-center justify-center gap-2.5">
          <BrandMark size={34} />
          <span className="text-2xl font-bold tracking-[.02em] text-(--surface-chrome)">
            BC HOUSING
          </span>
        </div>

        {/* TODO: /login — not wired: the template's alert slot also covers
            ?error=account_deactivated from middleware.ts and NextAuth's
            ?error= redirects; only this page's own submit errors show here. */}
        {error && (
          <Alert
            variant="destructive"
            className="mt-6 border-y-0 border-r-0 px-3.5 py-3"
          >
            <AlertDescription className="text-[14px] leading-[1.45]">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className={labelClass}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className={labelClass}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className={inputClass}
            />
          </div>

          <Button type="submit" disabled={isLoading} className={submitClass}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <Link
          href="/forgot-password"
          className="mt-6 text-center text-[14.5px] text-(--action-primary) hover:text-(--action-primary-hover) hover:underline"
        >
          Forgot your password?
        </Link>
      </Card>
    </div>
  );
}
