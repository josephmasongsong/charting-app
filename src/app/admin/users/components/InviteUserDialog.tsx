'use client';

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Create a new user account and send them an invitation email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.role}
              onValueChange={(value: 'admin' | 'user' | 'partner') => {
                setForm({ ...form, role: value });
              }}
              disabled={loading}
            >
              <SelectTrigger>
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

          {/* Region Selection - Only visible to admins */}
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={form.region}
                onValueChange={(
                  value: 'LMDM' | 'VIR' | 'Interior' | 'Northern'
                ) => setForm({ ...form, region: value })}
                disabled={loading}
              >
                <SelectTrigger>
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

          {/* Job Title Selection - Only visible to admins and not for partners */}
          {isAdmin && form.role !== 'partner' && (
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
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
                <SelectTrigger>
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

          <div className="flex items-center space-x-2">
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
