// app/sites/[id]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  db,
  sites,
  users,
  communityPartners,
  siteSupplies,
  supplies,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Users,
  Home,
  Building,
  UserCheck,
  Package,
  ArrowLeft,
  Edit,
  Trash2,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import EditButton from './components/EditButton';
import GoogleMapsButton from './components/GoogleMapsButton';

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

// Server function to fetch site supplies
async function getSiteSupplies(siteId: string) {
  const siteSuppliesData = await db
    .select({
      id: siteSupplies.id,
      supplyId: siteSupplies.supplyId,
      supplyName: supplies.name,
      quantity: siteSupplies.quantity,
      costPerUnit: supplies.costPerUnit,
      totalValue: sql<number>`${siteSupplies.quantity} * ${supplies.costPerUnit}`,
      lastUpdated: siteSupplies.updatedAt,
    })
    .from(siteSupplies)
    .innerJoin(supplies, eq(siteSupplies.supplyId, supplies.id))
    .where(eq(siteSupplies.siteId, siteId))
    .orderBy(supplies.name);

  return siteSuppliesData;
}

// Server function to count events at site
async function getSiteEventsCount(siteId: string) {
  const { events } = await import('@/db');
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(eq(events.siteId, siteId));

  return result[0]?.count || 0;
}

export default async function SitePage({ params }: SitePageProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  // Fetch site data and supplies on the server
  const { id } = await params;
  const site = await getSite(id);
  const siteSuppliesData = await getSiteSupplies(id);
  const eventsCount = await getSiteEventsCount(id);

  // Return 404 if site not found
  if (!site) {
    notFound();
  }

  // Check if current user is admin
  const isAdmin = session.user?.role === 'admin';

  // Calculate supply totals
  const totalSupplyValue = siteSuppliesData.reduce(
    (sum, supply) => sum + Number(supply.totalValue),
    0
  );
  const totalSupplyItems = siteSuppliesData.reduce(
    (sum, supply) => sum + supply.quantity,
    0
  );

  const formatDateTime = (dateStr: Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
              <p className="text-muted-foreground">
                Site details and information
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <EditButton siteId={site.id} />
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {site.numberOfTenants}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Tenants
                  </div>
                </div>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">{eventsCount}</div>
                  <div className="text-xs text-muted-foreground">
                    Events Held
                  </div>
                </div>
                <Package className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {site.isSingleSeniorOnly ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Senior Only
                  </div>
                </div>
                <UserCheck className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {site.hasCommunityRoom ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Community Room
                  </div>
                </div>
                <Home className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assigned Staff */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Assigned Staff
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {site.userName
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{site.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {site.userEmail}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Partner */}
            {site.hasCommunityPartner && site.communityPartnerName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Community Partner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-sm">
                    {site.communityPartnerName}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Supply Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Supply Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {siteSuppliesData.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold">
                          {totalSupplyItems}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Items
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <div className="text-2xl font-bold text-green-600">
                          ${totalSupplyValue.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Value
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {siteSuppliesData.slice(0, 5).map(supply => (
                        <div
                          key={supply.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {supply.supplyName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${supply.costPerUnit} per unit
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{supply.quantity}</Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              ${Number(supply.totalValue).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {siteSuppliesData.length > 5 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm">
                          View All {siteSuppliesData.length} Supplies
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <div className="text-sm text-muted-foreground">
                      No supplies at this site
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Secondary Info */}
          <div className="space-y-6">
            {/* Location Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Address
                  </div>
                  <div className="text-sm">{site.address}</div>
                </div>
                <div className="pt-2">
                  <GoogleMapsButton
                    latitude={site.latitude}
                    longitude={site.longitude}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDateTime(site.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDateTime(site.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
