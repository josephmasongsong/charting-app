import { requireAdmin } from '@/app/lib/role-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  Shield,
  Activity,
  Target,
  Users as CommunityIcon,
  MapPin,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import {
  db,
  users,
  programGoals,
  communityPartners,
  activityTypes,
  sites,
} from '@/db';
import { eq, sql } from 'drizzle-orm';

export default async function AdminDashboard() {
  await requireAdmin();

  // Get user statistics
  const [totalUsers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const [adminCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'admin'));

  const [partnerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'partner'));

  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'user'));

  // Get other model statistics
  const [goalCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(programGoals);

  const [communityPartnerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(communityPartners);

  const [activityTypeCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(activityTypes);

  const [siteCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sites);

  // Get sites with community partners
  const [sitesWithPartners] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sites)
    .where(eq(sites.hasCommunityPartner, true));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your application's data and system status.
        </p>
      </div>

      {/* User Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">User Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partners</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerCount.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Regular Users
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount.count}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Content Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sites</CardTitle>
              <MapPin className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteCount.count}</div>
              <p className="text-xs text-muted-foreground">
                {sitesWithPartners.count} with partners
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
              <div className="text-2xl font-bold">{goalCount.count}</div>
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
                {activityTypeCount.count}
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
              <div className="text-2xl font-bold">
                {communityPartnerCount.count}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Management Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions across your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/users">
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site Management</CardTitle>
              <CardDescription>
                Manage sites, locations, and their community partnerships.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/sites">
                <Button className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Sites
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Goals</CardTitle>
              <CardDescription>
                Manage program goals and objectives for your application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/program-goals">
                <Button className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Manage Program Goals
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Types</CardTitle>
              <CardDescription>
                Manage activity types and their relationships to program goals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/activity-types">
                <Button className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Manage Activity Types
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Partners</CardTitle>
              <CardDescription>
                Manage community partners and organizations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/community-partners">
                <Button className="w-full">
                  <CommunityIcon className="h-4 w-4 mr-2" />
                  Manage Community Partners
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks and system management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite New User
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
