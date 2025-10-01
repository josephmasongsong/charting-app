// app/events/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, events, users, sites, activityTypes } from '@/db';
import { eq, ilike, and, desc, sql } from 'drizzle-orm';
import EventsListClient from './components/EventsListClient';

interface EventsPageProps {
  searchParams: Promise<{
    search?: string;
    activityType?: string;
    site?: string;
    organizer?: string;
    page?: string;
  }>;
}

async function getEvents(
  search?: string,
  activityTypeFilter?: string,
  siteFilter?: string,
  organizerFilter?: string,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  const conditions = [];

  if (search) {
    conditions.push(ilike(events.title, `%${search}%`));
  }

  if (activityTypeFilter && activityTypeFilter !== 'all') {
    conditions.push(eq(events.activityTypeId, activityTypeFilter));
  }

  if (siteFilter && siteFilter !== 'all') {
    conditions.push(eq(events.siteId, siteFilter));
  }

  if (organizerFilter && organizerFilter !== 'all') {
    conditions.push(eq(events.userId, organizerFilter));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const eventsData = await db
    .select({
      id: events.id,
      title: events.title,
      eventDate: events.eventDate,
      activityTypeName: activityTypes.name,
      siteName: sites.name,
      organizerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      totalParticipants: sql<number>`${events.newParticipants} + ${events.returningParticipants}`,
      eventIsYouthFocused: events.eventIsYouthFocused,
      activityTypeId: events.activityTypeId,
      siteId: events.siteId,
      userId: events.userId,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .leftJoin(sites, eq(events.siteId, sites.id))
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .where(whereCondition)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.eventDate), desc(events.createdAt));

  // Get total count for pagination
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .leftJoin(sites, eq(events.siteId, sites.id))
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .where(whereCondition);

  const totalCount = Number(totalCountResult[0]?.count || 0);

  return { events: eventsData, totalCount };
}

async function getFilterOptions() {
  // Get unique activity types
  const activityTypesData = await db
    .select({
      id: activityTypes.id,
      name: activityTypes.name,
    })
    .from(activityTypes)
    .orderBy(activityTypes.name);

  // Get unique sites
  const sitesData = await db
    .select({
      id: sites.id,
      name: sites.name,
    })
    .from(sites)
    .orderBy(sites.name);

  // Get unique organizers
  const organizersData = await db
    .selectDistinct({
      id: users.id,
      name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(users)
    .innerJoin(events, eq(events.userId, users.id))
    .orderBy(sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`);

  return {
    activityTypes: activityTypesData,
    sites: sitesData,
    organizers: organizersData,
  };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const search = params.search || '';
  const activityType = params.activityType || 'all';
  const site = params.site || 'all';
  const organizer = params.organizer || 'all';
  const page = parseInt(params.page || '1');

  const { events: eventsData, totalCount } = await getEvents(
    search,
    activityType,
    site,
    organizer,
    page
  );

  const filterOptions = await getFilterOptions();

  const isAdmin = session.user.role === 'admin';

  return (
    <EventsListClient
      initialEvents={eventsData}
      filterOptions={filterOptions}
      initialFilters={{
        search,
        activityType,
        site,
        organizer,
        page,
      }}
      totalCount={totalCount}
      isAdmin={isAdmin}
    />
  );
}

export async function generateMetadata({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const search = params.search;

  return {
    title: search
      ? `Events - Search results for "${search}"`
      : 'Events - Browse All Community Activities',
    description: search
      ? `Search results for "${search}" in our events directory`
      : 'Browse all available community events and activities in our directory',
  };
}
