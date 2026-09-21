'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  fieldHelperClass,
  fieldInputClass,
  fieldLabelClass,
  fieldSelectTriggerClass,
} from '@/components/ui/form-fields';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Shield, Loader2, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';

function SettingsContent() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as 'admin' | 'user',
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

  if (isLoading) {
    return (
      <div className="bg-(--surface-page) px-6 pt-8 pb-12">
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
    <div className="bg-(--surface-page) px-6 pt-8 pb-12">
      <div className="mx-auto max-w-[900px]">
        <h1 className="mb-5 text-[28px] leading-tight font-bold tracking-[-.2px]">
          Account Settings
        </h1>

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
                <Label htmlFor="firstName" className={fieldLabelClass}>
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
                  className={fieldInputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className={fieldLabelClass}>
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
                  className={fieldInputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className={fieldLabelClass}>
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
                  className={fieldInputClass}
                />
              </div>
            </div>

            <div className="max-w-[340px] space-y-1.5">
              <Label htmlFor="role" className={fieldLabelClass}>
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'user') =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isSaving || currentUserRole !== 'admin'}
              >
                <SelectTrigger id="role" className={fieldSelectTriggerClass}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User
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
                <p className={fieldHelperClass}>
                  Only administrators can change user roles.
                </p>
              )}
            </div>

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
                onClick={() => router.push('/dashboard')}
                disabled={isSaving}
                className={outlineButtonClass}
              >
                Cancel
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
