// 'use client';
import { requireAuth } from '@/lib/auth-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Shield,
  Users,
  Target,
  Activity,
  Users as CommunityIcon,
  Home,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import {
  db,
  users,
  sites,
  programGoals,
  communityPartners,
  activityTypes,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import ActivityFeed from '@/components/ActivityFeed';
// import { useActivityFeed } from '@/hooks/useActivityFeed';

export default async function Dashboard() {
  const session = await requireAuth();
  // const { activities } = useActivityFeed();

  // Check if current user is admin
  const isAdmin = session.user?.role === 'admin';

  // Get current user's managed sites if they're a site manager
  const userSites = await db
    .select({
      id: sites.id,
      name: sites.name,
      address: sites.address,
      numberOfTenants: sites.numberOfTenants,
    })
    .from(sites)
    .where(eq(sites.userId, session.user.id))
    .limit(5);

  // Get overall statistics (for admins or general info)
  const [totalSites] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sites);

  const [totalGoals] = await db
    .select({ count: sql<number>`count(*)` })
    .from(programGoals);

  const [totalPartners] = await db
    .select({ count: sql<number>`count(*)` })
    .from(communityPartners);

  const [totalActivityTypes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityTypes);

  // Get sites with community partners
  const [sitesWithPartners] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sites)
    .where(eq(sites.hasCommunityPartner, true));

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user?.name || session.user?.email}!
        </p>
      </div>

      {/* Overview Statistics */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
              <MapPin className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSites.count}</div>
              <p className="text-xs text-muted-foreground">
                {sitesWithPartners.count} with community partners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Program Goals
              </CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Activity Types
              </CardTitle>
              <Activity className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalActivityTypes.count}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community Partners
              </CardTitle>
              <CommunityIcon className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPartners.count}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Sites Section (if user manages any sites) */}
      {userSites.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">My Sites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSites.map(site => (
              <Card key={site.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {site.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {site.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {site.numberOfTenants}{' '}
                      {site.numberOfTenants === 1 ? 'Tenant' : 'Tenants'}
                    </span>
                  </div>

                  <Link href={`/sites/${site.id}`}>
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {userSites.length >= 5 && (
            <div className="mt-4">
              <Link href="/sites">
                <Button variant="outline">View All Sites</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Browse Sites */}
          <Card>
            <CardHeader>
              <CardTitle>Browse Sites</CardTitle>
              <CardDescription>
                Explore all available sites and their details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/sites">
                <Button className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Browse Sites
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/settings">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard (only for admins) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Access administrative tools and system management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin">
                  <Button variant="secondary" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Stay updated with the latest happenings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Card for new users */}
          {userSites.length === 0 && !isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome!</CardTitle>
                <CardDescription>
                  Get started by exploring the available sites.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/sites">
                  <Button className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Explore Sites
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Admin-only Management Section */}
      {isAdmin && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Site Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/admin/sites">
                  <Button variant="outline" size="sm" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Manage Sites
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/admin/users">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Program Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/admin/program-goals">
                  <Button variant="outline" size="sm" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Manage Goals
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Community Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/admin/community-partners">
                  <Button variant="outline" size="sm" className="w-full">
                    <CommunityIcon className="h-4 w-4 mr-2" />
                    Manage Partners
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <div className="mt-8">
        <ActivityFeed />
      </div>
    </div>
  );
}
