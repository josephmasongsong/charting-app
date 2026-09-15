'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
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
import { Switch } from '@/components/ui/switch';
import { User, Shield } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  jobTitle?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isAdmin: boolean;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  isAdmin,
  onSuccess,
  onError,
  onRefresh,
}: EditUserDialogProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as 'admin' | 'user',
    jobTitle: 'Tenant Engagement Worker' as
      | 'Tenant Engagement Worker'
      | 'People Plants & Homes'
      | 'Tenant Support Worker'
      | 'Health Services Manager',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ');
      setForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        role: user.role,
        jobTitle:
          (user.jobTitle as
            | 'Tenant Engagement Worker'
            | 'People Plants & Homes'
            | 'Tenant Support Worker'
            | 'Health Services Manager') || 'Tenant Engagement Worker',
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(
          `User ${form.firstName} ${form.lastName} updated successfully!`
        );
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to update user');
      }
    } catch (error) {
      onError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Edit User"
      className="sm:max-w-[560px]"
    >
      <p className="text-[13.5px] text-(--text-muted)">
        Update user information and permissions.
      </p>
      {user && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="editFirstName" className={fieldLabelClass}>
                First Name
              </Label>
              <Input
                id="editFirstName"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                required
                disabled={loading}
                className={fieldInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editLastName" className={fieldLabelClass}>
                Last Name
              </Label>
              <Input
                id="editLastName"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                required
                disabled={loading}
                className={fieldInputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editEmail" className={fieldLabelClass}>
              Email
            </Label>
            <Input
              id="editEmail"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
              className={fieldInputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editRole" className={fieldLabelClass}>
              Role
            </Label>
            <Select
              value={form.role}
              onValueChange={(value: 'admin' | 'user') => {
                setForm({ ...form, role: value });
              }}
              disabled={loading || !isAdmin}
            >
              <SelectTrigger id="editRole" className={fieldSelectTriggerClass}>
                <SelectValue />
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
            {!isAdmin && (
              <p className={fieldHelperClass}>
                Only admins can change roles
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <Label htmlFor="editJobTitle" className={fieldLabelClass}>
                Job Title
              </Label>
              <Select
                value={form.jobTitle}
                onValueChange={(
                  value:
                    | 'Tenant Engagement Worker'
                    | 'People Plants & Homes'
                    | 'Tenant Support Worker'
                    | 'Health Services Manager'
                ) => setForm({ ...form, jobTitle: value })}
                disabled={loading}
              >
                <SelectTrigger id="editJobTitle" className={fieldSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tenant Engagement Worker">
                    Tenant Engagement Worker
                  </SelectItem>
                  <SelectItem value="People Plants & Homes">
                    People Plants & Homes
                  </SelectItem>
                  <SelectItem value="Tenant Support Worker">
                    Tenant Support Worker
                  </SelectItem>
                  <SelectItem value="Health Services Manager">
                    Health Services Manager
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-1.5">
              <Label htmlFor="editIsActive" className={fieldLabelClass}>
                Account Status
              </Label>
              <div className="flex items-center gap-3">
                <Switch
                  id="editIsActive"
                  checked={form.isActive}
                  onCheckedChange={checked =>
                    setForm({ ...form, isActive: checked })
                  }
                  disabled={loading}
                />
                <StatusBadge isActive={form.isActive} />
              </div>
              <p className={fieldHelperClass}>
                Inactive users cannot login and will be logged out
                automatically
              </p>
            </div>
          )}


          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className={outlineButtonClass}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={primaryButtonClass}
            >
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
