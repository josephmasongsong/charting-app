'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Shield, UserCheck } from 'lucide-react';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

function SettingsContent() {
  const { data: session, update } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as 'admin' | 'user' | 'moderator',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/users/${session.user.id}`);
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
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to load user data');
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
      console.error('Update error:', error);
      setError('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'moderator':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <Badge
          variant={getRoleBadgeVariant(currentUserRole)}
          className="flex items-center gap-1"
        >
          {getRoleIcon(currentUserRole)}
          {currentUserRole}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={e =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter your first name"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={e =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter your last name"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'user' | 'moderator') =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isSaving || currentUserRole !== 'admin'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Moderator
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
                <p className="text-sm text-muted-foreground">
                  Only administrators can change user roles.
                </p>
              )}
            </div>

            {userData && (
              <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Account created:</strong>{' '}
                  {new Date(userData.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Last updated:</strong>{' '}
                  {new Date(userData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>
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
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
