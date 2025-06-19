'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { User, Shield, UserCheck, CheckCircle, UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'partner';
  region?: string;
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
    role: 'user' as 'admin' | 'user' | 'partner',
    region: 'LMDM' as 'LMDM' | 'VIR' | 'Interior' | 'Northern',
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
        region:
          (user.region as 'LMDM' | 'VIR' | 'Interior' | 'Northern') || 'LMDM',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions.
          </DialogDescription>
        </DialogHeader>
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={form.firstName}
                  onChange={e =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRole">Role</Label>
              <Select
                value={form.role}
                onValueChange={(value: 'admin' | 'user' | 'partner') => {
                  setForm({ ...form, role: value });
                }}
                disabled={loading || !isAdmin}
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
              {!isAdmin && (
                <p className="text-sm text-muted-foreground">
                  Only admins can change roles
                </p>
              )}
            </div>

            {/* Region Selection - Only visible to admins */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="editRegion">Region</Label>
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
                <Label htmlFor="editJobTitle">Job Title</Label>
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

            {/* Account Status Toggle - Only visible to admins */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="editIsActive">Account Status</Label>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="editIsActive"
                    checked={form.isActive}
                    onCheckedChange={checked =>
                      setForm({ ...form, isActive: checked })
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="editIsActive" className="text-sm">
                    {form.isActive ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <UserX className="h-4 w-4" />
                        Inactive
                      </span>
                    )}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Inactive users cannot login and will be logged out
                  automatically
                </p>
              </div>
            )}

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
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
