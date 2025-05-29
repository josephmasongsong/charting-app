import { requireAuth } from '@/app/lib/auth-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import SignOutButton from '@/components/SignOutButton';
import Link from 'next/link';

export default async function Dashboard() {
  const session = await requireAuth();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SignOutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>
            You are successfully logged in to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {session.user?.name || 'Not provided'}
            </p>
            <p>
              <strong>Email:</strong> {session.user?.email}
            </p>
            <p>
              <strong>User ID:</strong> {session.user?.id}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button variant="outline" className="w-full">
                View Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View your statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
