'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Shield, UserCheck, Loader2, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'partner';
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const labelClass = 'text-[13.5px] font-bold';
const inputClass =
  'rounded-(--radius-control) border-(--border-input) bg-(--surface-card) shadow-none md:text-sm';
const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

const roleChips: Record<string, { className: string; label: string }> = {
  admin: {
    className: 'bg-(--surface-chrome) text-(--text-on-chrome)',
    label: 'Administrator',
  },
  user: {
    className:
      'border border-(--bch-blue-100) bg-(--bch-blue-50) text-(--bch-blue-700)',
    label: 'Staff user',
  },
  partner: {
    className:
      'border border-(--border-default) bg-(--bch-gray-100) text-(--text-muted)',
    label: 'Partner',
  },
};

function SettingsContent() {
  const { data: session, update } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'partner',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) {
        return;
      }

      try {
        const response = await fetch(`/api/users/${session.user.id}`);

        if (!response.ok) {
          setError(`Failed to load user data: ${response.status}`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (data.user) {
          setUserData(data.user);
          setFormData({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            email: data.user.email || '',
            role: data.user.role || 'user',
          });
          setCurrentUserRole(data.user.role || 'user');
        } else {
          setError('No user data found');
        }
      } catch (error) {
        setError('Network error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Profile updated successfully!');
        setUserData(data.user);

        // Update the session if name or email changed
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.firstName + ' ' + data.user.lastName,
            email: data.user.email,
          },
        });
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="size-3" />;
      case 'partner':
        return <UserCheck className="size-3" />;
      default:
        return <User className="size-3" />;
    }
  };

  const roleChip = roleChips[currentUserRole];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--surface-page) px-6 pt-8 pb-12">
        <div className="mx-auto max-w-[900px]">
          <Card className="gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) shadow-none">
            <div className="flex items-center justify-center gap-2 p-6 text-(--text-muted)">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-8 pb-12">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[28px] leading-tight font-bold tracking-[-.2px]">
            Account Settings
          </h1>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-[5px] text-xs font-bold tracking-[.5px] uppercase',
              roleChip?.className ??
                'bg-(--surface-muted) text-(--text-body)'
            )}
          >
            {getRoleIcon(currentUserRole)}
            {roleChip?.label ?? currentUserRole}
          </span>
        </div>

        <Card className="gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) p-8 shadow-none">
          <h2 className="text-[19px] font-bold">Profile Information</h2>
          <p className="mt-1 text-[14.5px] text-(--text-muted)">
            Update your personal information and account settings.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {message && (
              <Alert className={cn(alertClass, successAlertClass)}>
                <AlertDescription className="text-[14px] text-foreground">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className={alertClass}>
                <AlertDescription className="text-[14px]">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className={labelClass}>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={e =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter your first name"
                  disabled={isSaving}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className={labelClass}>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={e =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter your last name"
                  disabled={isSaving}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className={labelClass}>
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  disabled={isSaving}
                  className={cn(inputClass, 'pr-28')}
                />
                {userData &&
                  (userData.emailVerified ? (
                    <span
                      title="Verified"
                      className="absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-[var(--bch-green-50,#EDF6EF)] px-2 py-[2px] text-[11.5px] font-bold tracking-[.3px] text-(--success) uppercase"
                    >
                      <Check className="size-[11px]" />
                      Verified
                    </span>
                  ) : (
                    <span
                      title="Unverified"
                      className="absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full bg-(--warning-surface) px-2 py-[2px] text-[11.5px] font-bold tracking-[.3px] text-(--warning-text) uppercase"
                    >
                      <Info className="size-[11px]" />
                      Unverified
                    </span>
                  ))}
              </div>
            </div>

            <div className="max-w-[340px] space-y-1.5">
              <Label htmlFor="role" className={labelClass}>
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'user' | 'partner') =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isSaving || currentUserRole !== 'admin'}
              >
                <SelectTrigger
                  id="role"
                  className="w-full rounded-(--radius-control) border-(--border-input) bg-(--surface-card) shadow-none"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="partner">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Partner
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {currentUserRole !== 'admin' && (
                <p className="text-[12.5px] text-(--text-muted)">
                  Only administrators can change user roles.
                </p>
              )}
            </div>

            {userData && (
              <div className="space-y-1.5 border-t border-(--border-default) pt-[18px] text-sm">
                <p>
                  <strong>Account created:</strong>{' '}
                  <span className="text-(--text-muted)">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <strong>Last updated:</strong>{' '}
                  <span className="text-(--text-muted)">
                    {new Date(userData.updatedAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className={primaryButtonClass}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (userData) {
                    setFormData({
                      firstName: userData.firstName || '',
                      lastName: userData.lastName || '',
                      email: userData.email || '',
                      role: userData.role || 'user',
                    });
                  }
                }}
                disabled={isSaving}
                className={outlineButtonClass}
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
