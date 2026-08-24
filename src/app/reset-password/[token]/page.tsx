'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandMark } from '@/components/ui/brand-mark';
import { cn } from '@/lib/utils';

const pageClass =
  'flex min-h-screen items-center justify-center bg-(--action-primary) px-6 py-12';
const cardClass =
  'w-full max-w-[480px] gap-0 rounded-(--radius-card) border-0 bg-(--surface-card) px-12 pt-10 pb-11 shadow-none';
const labelClass = 'text-[14.5px] font-semibold';
const inputClass =
  'h-10 rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] shadow-none md:text-[15px] focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)';
const submitClass =
  'h-auto w-full rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[11px] text-[15.5px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const alertClass = 'mt-6 border-y-0 border-r-0 px-3.5 py-3';
// Success status treatment: --success bar on the design system's green surface.
// --bch-green-50 is not declared in src/styles/tokens; this is the design
// system's own expression of it, fallback included.
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

export default function ResetPassword({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { token } = use(params);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
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

        <h1 className="mt-7 text-center text-xl leading-tight font-bold text-(--surface-chrome)">
          Set new password
        </h1>

        {/* TODO: /reset-password/[token] — not wired: the template's alert slot
            can also show an expired/invalid link on load; the API only checks
            the token on submit, so only submit-time errors appear here. */}
        {success ? (
          <Alert className={cn(alertClass, successAlertClass)}>
            <AlertDescription className="text-[14px] leading-[1.45] text-foreground">
              {message}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className={alertClass}>
                <AlertDescription className="text-[14px] leading-[1.45]">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className={labelClass}>
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword" className={labelClass}>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  className={inputClass}
                />
              </div>

              <Button type="submit" disabled={isLoading} className={submitClass}>
                {isLoading ? 'Processing...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}

        {/* TODO: /reset-password/[token] — not wired: the template's
            "Back to sign in" link; this page has no navigation today. */}
        <button
          type="button"
          onClick={() => {}}
          className="mt-6 cursor-pointer text-center text-[14.5px] text-(--action-primary) hover:text-(--action-primary-hover) hover:underline"
        >
          Back to sign in
        </button>
      </Card>
    </div>
  );
}
