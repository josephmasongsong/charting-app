'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandMark } from '@/components/ui/brand-mark';
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
const outlineClass =
  'mt-6 h-auto w-full rounded-(--radius-control) border border-(--action-primary) bg-(--surface-card) px-[18px] py-[11px] text-[15.5px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const linkClass =
  'mt-6 text-center text-[14.5px] text-(--action-primary) hover:text-(--action-primary-hover) hover:underline';
// Info status treatment: --action-primary bar on the --action-selected surface.
const infoAlertClass =
  'mt-6 rounded-[2px] border-y-0 border-r-0 border-l-[5px] border-l-(--action-primary) bg-(--action-selected) px-3.5 py-3 text-foreground';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          "If an account with that email exists, we've sent a password reset link."
        );
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
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
          Reset your password
        </h1>
        <p className="mt-1.5 text-center text-[14.5px] text-(--text-muted)">
          Enter your email address and we&apos;ll send you a reset link
        </p>

        {/* TODO: /forgot-password — not wired: the template shows failures in
            the destructive alert and success in a green box with the form
            still visible; this page keeps one `message` state for both and
            hides the form, so a single info box is used. */}
        {message ? (
          <>
            <Alert className={infoAlertClass}>
              <AlertDescription className="text-[14px] leading-[1.45] text-foreground">
                {message}
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className={outlineClass}>
              <Link href="/login">Back to Login</Link>
            </Button>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className={labelClass}>
                  Email address
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

              <Button type="submit" disabled={isLoading} className={submitClass}>
                {isLoading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>

            <Link href="/login" className={linkClass}>
              Back to login
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
