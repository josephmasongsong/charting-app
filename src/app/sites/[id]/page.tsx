import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, sites, users, communityPartners } from '@/db';
import { eq, sql } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Users,
  Home,
  Check,
  X,
  Mail,
  Calendar,
  Building,
  UserCheck,
  XCircle,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import EditButton from './components/EditButton';
import GoogleMapsButton from './components/GoogleMapsButton';
import { notFound } from 'next/navigation';

interface SitePageProps {
  params: {
    id: string;
  };
}

// Server function to fetch site data
async function getSite(siteId: string) {
  const [site] = await db
    .select({
      id: sites.id,
      name: sites.name,
      latitude: sites.latitude,
      longitude: sites.longitude,
      address: sites.address,
      numberOfTenants: sites.numberOfTenants,
      hasCommunityRoom: sites.hasCommunityRoom,
      hasCommunityPartner: sites.hasCommunityPartner,
      communityPartnerId: sites.communityPartnerId,
      communityPartnerName: communityPartners.name,
      isSingleSeniorOnly: sites.isSingleSeniorOnly,
      userId: sites.userId,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      userEmail: users.email,
      createdAt: sites.createdAt,
      updatedAt: sites.updatedAt,
    })
    .from(sites)
    .leftJoin(users, eq(sites.userId, users.id))
    .leftJoin(
      communityPartners,
      eq(sites.communityPartnerId, communityPartners.id)
    )
    .where(eq(sites.id, siteId))
    .limit(1);

  return site;
}

// Server Component for boolean display
function BooleanDisplay({
  value,
  trueText,
  falseText,
  icon: Icon,
}: {
  value: boolean;
  trueText: string;
  falseText: string;
  icon: any;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <Badge
        variant={value ? 'default' : 'secondary'}
        className="flex items-center gap-1"
      >
        {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        {value ? trueText : falseText}
      </Badge>
    </div>
  );
}

export default async function SitePage({ params }: SitePageProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  // Fetch site data on the server
  const { id } = await params;
  const site = await getSite(id);

  // Return 404 if site not found
  if (!site) {
    notFound();
  }

  // Check if current user is admin
  const isAdmin = session.user?.role === 'admin';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">{site.name}</h1>
            <p className="text-muted-foreground">Site Information</p>
          </div>
        </div>

        {isAdmin && <EditButton siteId={site.id} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Site Name
                </h3>
                <p className="text-lg font-medium">{site.name}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Address
                </h3>
                <p className="text-sm leading-relaxed">{site.address}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Number of Tenants
                </h3>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {site.numberOfTenants}{' '}
                    {site.numberOfTenants === 1 ? 'Tenant' : 'Tenants'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">
                    Latitude
                  </h3>
                  <p className="font-mono text-sm">{site.latitude}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">
                    Longitude
                  </h3>
                  <p className="font-mono text-sm">{site.longitude}</p>
                </div>
              </div>

              <Separator />

              <GoogleMapsButton
                latitude={site.latitude}
                longitude={site.longitude}
              />
            </CardContent>
          </Card>

          {/* Site Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Site Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BooleanDisplay
                  value={site.hasCommunityRoom}
                  trueText="Has Community Room"
                  falseText="No Community Room"
                  icon={Home}
                />

                <BooleanDisplay
                  value={site.isSingleSeniorOnly}
                  trueText="Single Senior Only"
                  falseText="Not Single Senior Only"
                  icon={UserCheck}
                />
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Community Partnership
                </h3>
                {site.hasCommunityPartner && site.communityPartnerName ? (
                  <Badge variant="default" className="text-sm px-3 py-1">
                    {site.communityPartnerName}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    No Community Partner
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Site Manager */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Site Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Name
                </h3>
                <p className="font-medium">{site.userName}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Email
                </h3>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${site.userEmail}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {site.userEmail}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Created
                </h3>
                <p className="text-sm">
                  {new Date(site.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Last Updated
                </h3>
                <p className="text-sm">
                  {new Date(site.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <EditButton
                  siteId={site.id}
                  variant="outline"
                  className="w-full justify-start"
                />
                <BackButton
                  href="/admin/sites"
                  variant="outline"
                  className="w-full justify-start"
                  text="Back to Admin"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SitePageProps) {
  const { id } = await params;
  const site = await getSite(id);

  if (!site) {
    return {
      title: 'Site Not Found',
    };
  }

  return {
    title: `${site.name} - Site Details`,
    description: `View details for ${site.name} located at ${site.address}`,
  };
}
