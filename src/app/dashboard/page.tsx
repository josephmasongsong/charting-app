// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Users,
  CalendarDays,
  Package,
  Clock,
  Loader2,
  Target,
  Activity,
  Building,
  Box,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import ActivityFeed from '@/components/ActivityFeed';

interface DashboardData {
  userSites: Array<{
    id: string;
    name: string;
    address: string;
    isSingleSeniorOnly: boolean;
  }>;
  monthlyMetrics: {
    events: number;
    participants: number;
    distributions: number;
    adminHours: number;
  };
  allTimeMetrics: {
    events: number;
    participants: number;
    distributions: number;
    adminHours: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  // Fetch dashboard data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // Show not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  if (!data) {
    return null;
  }

  const currentMetrics =
    selectedPeriod === 'month' ? data.monthlyMetrics : data.allTimeMetrics;
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || session?.user?.email}!
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Held</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.events}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                Events you've organized
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participants Served
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMetrics.participants}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                People reached through events
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Supply Distributions
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMetrics.distributions}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                Supplies distributed to tenants
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentMetrics.adminHours}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                Hours spent on admin tasks
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area with ActivityFeed and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity Feed - Left Side (8/12) */}
          <div className="lg:col-span-8">
            <ActivityFeed />
          </div>

          {/* Sidebar - Right Side (4/12) */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* Quick Start Menu */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start</CardTitle>
                  <CardDescription>Common tasks and navigation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/events/new" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CalendarDays className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Log New Event</div>
                            <div className="text-xs text-muted-foreground">
                              Record a community event
                            </div>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <Link href="/supply-distributions/new" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Package className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">
                              Log Supply Distribution
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Record supply delivery
                            </div>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <Link href="/reports/monthly" className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Target className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">Monthly Reports</div>
                            <div className="text-xs text-muted-foreground">
                              View analytics and insights
                            </div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Menu - Only visible to admins */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Admin Navigation</CardTitle>
                      <CardDescription className="mt-1">
                        Records and resource management
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/admin/users" className="block">
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <Users className="h-6 w-6" />
                          <span className="text-sm font-medium">Users</span>
                        </Button>
                      </Link>

                      <Link href="/admin/program-goals" className="block">
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <Target className="h-6 w-6" />
                          <span className="text-sm font-medium">
                            Program Goals
                          </span>
                        </Button>
                      </Link>

                      <Link href="/admin/activity-types" className="block">
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <Activity className="h-6 w-6" />
                          <span className="text-sm font-medium">
                            Activity Types
                          </span>
                        </Button>
                      </Link>

                      <Link href="/admin/community-partners" className="block">
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <Building className="h-6 w-6" />
                          <span className="text-sm font-medium">
                            Community Partners
                          </span>
                        </Button>
                      </Link>

                      <Link href="/admin/supplies" className="block">
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <Box className="h-6 w-6" />
                          <span className="text-sm font-medium">Supplies</span>
                        </Button>
                      </Link>

                      <Link
                        href="/admin/supply-distributions"
                        className="block"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <Truck className="h-6 w-6" />
                          <span className="text-sm font-medium">
                            Distributions
                          </span>
                        </Button>
                      </Link>

                      <Link href="/admin/events" className="block">
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <CalendarDays className="h-6 w-6" />
                          <span className="text-sm font-medium">Events</span>
                        </Button>
                      </Link>

                      <Link href="/admin/sites" className="block">
                        <Button
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <MapPin className="h-6 w-6" />
                          <span className="text-sm font-medium">Sites</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
