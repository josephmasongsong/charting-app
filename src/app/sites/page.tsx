// app/sites/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, sites, users, communityPartners } from '@/db';
import { eq, ilike, or, and, desc, sql } from 'drizzle-orm';
import SitesListClient from './components/SitesListClient';

interface SitesPageProps {
  searchParams: {
    search?: string;
    page?: string;
    isSingleSeniorOnly?: 'true' | 'false' | 'all';
    hasCommunityRoom?: 'true' | 'false' | 'all';
    userId?: string; // user id or 'all'
  };
}

async function getFilterOptions() {
  // Only users who actually own at least one site (inner join ensures ownership)
  const organizers = await db
    .selectDistinct({
      id: users.id,
      name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(users)
    .innerJoin(sites, eq(sites.userId, users.id))
    .orderBy(sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`);

  return { organizers };
}

async function getSites(params: {
  search?: string;
  page?: number;
  limit?: number;
  isSingleSeniorOnly?: 'true' | 'false' | 'all';
  hasCommunityRoom?: 'true' | 'false' | 'all';
  userId?: string; // concrete id or 'all'
}) {
  const {
    search = '',
    page = 1,
    limit = 10,
    isSingleSeniorOnly = 'all',
    hasCommunityRoom = 'all',
    userId = 'all',
  } = params;

  const offset = (page - 1) * limit;

  const conditions: any[] = [];

  if (search) {
    conditions.push(
      or(
        ilike(sites.name, `%${search}%`),
        ilike(sites.address, `%${search}%`),
        ilike(communityPartners.name, `%${search}%`)
      )
    );
  }

  if (isSingleSeniorOnly && isSingleSeniorOnly !== 'all') {
    conditions.push(
      eq(sites.isSingleSeniorOnly, isSingleSeniorOnly === 'true')
    );
  }

  if (hasCommunityRoom && hasCommunityRoom !== 'all') {
    conditions.push(eq(sites.hasCommunityRoom, hasCommunityRoom === 'true'));
  }

  if (userId && userId !== 'all') {
    conditions.push(eq(sites.userId, userId));
  }

  const whereCond = conditions.length ? and(...conditions) : undefined;

  const data = await db
    .select({
      id: sites.id,
      name: sites.name,
      address: sites.address,
      numberOfTenants: sites.numberOfTenants,
      hasCommunityPartner: sites.hasCommunityPartner,
      communityPartnerName: communityPartners.name,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      isSingleSeniorOnly: sites.isSingleSeniorOnly,
      hasCommunityRoom: sites.hasCommunityRoom,
      userId: sites.userId,
    })
    .from(sites)
    .leftJoin(users, eq(sites.userId, users.id))
    .leftJoin(
      communityPartners,
      eq(sites.communityPartnerId, communityPartners.id)
    )
    .where(whereCond)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(sites.createdAt));

  const totalCountRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(sites)
    .leftJoin(users, eq(sites.userId, users.id))
    .leftJoin(
      communityPartners,
      eq(sites.communityPartnerId, communityPartners.id)
    )
    .where(whereCond);

  const totalCount = Number(totalCountRes[0]?.count || 0);

  return { data, totalCount };
}

export default async function SitesPage({ searchParams }: SitesPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const isSingleSeniorOnly =
    (searchParams.isSingleSeniorOnly as 'true' | 'false' | 'all') || 'all';
  const hasCommunityRoom =
    (searchParams.hasCommunityRoom as 'true' | 'false' | 'all') || 'all';
  const userId = searchParams.userId || 'all';

  const { data, totalCount } = await getSites({
    search,
    page,
    isSingleSeniorOnly,
    hasCommunityRoom,
    userId,
  });

  const { organizers } = await getFilterOptions();
  const isAdmin = (session as any).user.role === 'admin';

  return (
    <SitesListClient
      initialSites={data as any}
      initialFilters={{
        search,
        page,
        isSingleSeniorOnly,
        hasCommunityRoom,
        userId,
      }}
      filterOptions={{ organizers }}
      totalCount={totalCount}
      isAdmin={isAdmin}
    />
  );
}

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
