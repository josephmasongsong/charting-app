import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, sites, users, communityPartners } from '@/db';
import { eq, ilike, or, desc, sql } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users } from 'lucide-react';
import SitesSearch from './components/SitesSearch';
import SiteCard from './components/SiteCard';

interface SitesPageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

// Server function to fetch sites
async function getSites(search?: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  // Build where condition based on search
  const searchCondition = search
    ? or(
        ilike(sites.name, `%${search}%`),
        ilike(sites.address, `%${search}%`),
        // ilike(users.name, `%${search}%`),
        ilike(communityPartners.name, `%${search}%`)
      )
    : undefined;

  const sitesData = await db
    .select({
      id: sites.id,
      name: sites.name,
      address: sites.address,
      numberOfTenants: sites.numberOfTenants,
      hasCommunityPartner: sites.hasCommunityPartner,
      communityPartnerName: communityPartners.name,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(sites)
    .leftJoin(users, eq(sites.userId, users.id))
    .leftJoin(
      communityPartners,
      eq(sites.communityPartnerId, communityPartners.id)
    )
    .where(searchCondition)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(sites.createdAt));

  return sitesData;
}

export default async function SitesPage({ searchParams }: SitesPageProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1');

  // Fetch sites data on the server
  const sitesData = await getSites(search, page);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sites</h1>
        <p className="text-muted-foreground">Browse all available sites</p>
      </div>

      {/* Search Component (Client Component for interactivity) */}
      <SitesSearch initialSearch={search} />

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sitesData.map(site => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>

      {sitesData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {search ? `No sites found matching "${search}".` : 'No sites found.'}
        </div>
      )}
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: SitesPageProps) {
  const search = searchParams.search;

  return {
    title: search
      ? `Sites - Search results for "${search}"`
      : 'Sites - Browse All Locations',
    description: search
      ? `Search results for "${search}" in our sites directory`
      : 'Browse all available sites and locations in our directory',
  };
}
