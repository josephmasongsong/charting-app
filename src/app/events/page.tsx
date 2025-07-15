import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, events, users, sites, activityTypes } from '@/db';
import { eq, ilike, or, desc, sql } from 'drizzle-orm';
import EventsSearch from './components/EventsSearch';
import EventCard from './components/EventCard';

interface EventsPageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

// Server function to fetch events
async function getEvents(search?: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  // Build where condition based on search
  const searchCondition = search
    ? or(
        ilike(events.title, `%${search}%`),
        ilike(activityTypes.name, `%${search}%`),
        ilike(sites.name, `%${search}%`)
      )
    : undefined;

  const eventsData = await db
    .select({
      id: events.id,
      title: events.title,
      eventDate: events.eventDate,
      activityTypeName: activityTypes.name,
      siteName: sites.name,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .leftJoin(sites, eq(events.siteId, sites.id))
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .where(searchCondition)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.eventDate), desc(events.createdAt));

  return eventsData;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1');

  // Fetch events data on the server
  const eventsData = await getEvents(search, page);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Events</h1>
        <p className="text-muted-foreground">
          Browse all community events and activities
        </p>
      </div>

      {/* Search Component (Client Component for interactivity) */}
      <EventsSearch initialSearch={search} />

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsData.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {eventsData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {search
            ? `No events found matching "${search}".`
            : 'No events found.'}
        </div>
      )}
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: EventsPageProps) {
  const search = searchParams.search;

  return {
    title: search
      ? `Events - Search results for "${search}"`
      : 'Events - Browse All Community Activities',
    description: search
      ? `Search results for "${search}" in our events directory`
      : 'Browse all available community events and activities in our directory',
  };
}
