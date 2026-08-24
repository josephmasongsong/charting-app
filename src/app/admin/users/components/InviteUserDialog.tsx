'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Shield, UserCheck } from 'lucide-react';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const labelClass = 'text-[13.5px] font-bold';
const inputClass =
  'rounded-(--radius-control) border-(--border-input) shadow-none md:text-sm';
const selectClass =
  'w-full rounded-(--radius-control) border-(--border-input) shadow-none';

export default function InviteUserDialog({
  open,
  onOpenChange,
  isAdmin,
  onSuccess,
  onError,
  onRefresh,
}: InviteUserDialogProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user' | 'partner',
    region: 'LMDM' as 'LMDM' | 'VIR' | 'Interior' | 'Northern',
    jobTitle: 'Tenant Engagement Worker' as
      | 'Tenant Engagement Worker'
      | 'People Plants & Homes'
      | 'Tenant Support Worker'
      | 'Health Services Manager',
    sendInvite: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(
          `User ${form.firstName} ${form.lastName} created successfully!`
        );
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'user',
          region: 'LMDM',
          jobTitle: 'Tenant Engagement Worker',
          sendInvite: true,
        });
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to create user');
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
      title="Invite New User"
      className="sm:max-w-[560px]"
    >
      <p className="text-[13.5px] text-(--text-muted)">
        Create a new user account and send them an invitation email.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className={labelClass}>
              First Name
            </Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
              required
              disabled={loading}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className={labelClass}>
              Last Name
            </Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
              required
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className={labelClass}>
            Temporary Password
          </Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            disabled={loading}
            placeholder="Minimum 8 characters"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role" className={labelClass}>
            Role
          </Label>
          <Select
            value={form.role}
            onValueChange={(value: 'admin' | 'user' | 'partner') => {
              setForm({ ...form, role: value });
            }}
            disabled={loading}
          >
            <SelectTrigger id="role" className={selectClass}>
              <SelectValue />
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
        </div>

        {isAdmin && (
          <div className="space-y-1.5">
            <Label htmlFor="region" className={labelClass}>
              Region
            </Label>
            <Select
              value={form.region}
              onValueChange={(value: 'LMDM' | 'VIR' | 'Interior' | 'Northern') =>
                setForm({ ...form, region: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="region" className={selectClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LMDM">LMDM</SelectItem>
                <SelectItem value="VIR">VIR</SelectItem>
                <SelectItem value="Interior">Interior</SelectItem>
                <SelectItem value="Northern">Northern</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isAdmin && form.role !== 'partner' && (
          <div className="space-y-1.5">
            <Label htmlFor="jobTitle" className={labelClass}>
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
              <SelectTrigger id="jobTitle" className={selectClass}>
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

        <div className="flex items-center gap-2">
          <Checkbox
            id="sendInvite"
            checked={form.sendInvite}
            onCheckedChange={checked =>
              setForm({ ...form, sendInvite: checked as boolean })
            }
          />
          <Label htmlFor="sendInvite" className="text-sm">
            Send invitation email
          </Label>
        </div>

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
          <Button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
