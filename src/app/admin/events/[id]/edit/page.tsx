// app/admin/events/[id]/edit/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  db,
  users,
  events,
  sites,
  activityTypes,
  communityPartners,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import EventForm from '@/components/EventForm';

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getEventData(eventId: string) {
  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      eventDate: events.eventDate,
      description: events.description,
      eventDuration: events.eventDuration,
      adminDuration: events.adminDuration,
      newParticipants: events.newParticipants,
      returningParticipants: events.returningParticipants,
      eventIsYouthFocused: events.eventIsYouthFocused,
      hasCoHost: events.hasCoHost,
      totalCost: events.totalCost,
      activityTypeId: events.activityTypeId,
      activityTypeName: activityTypes.name,
      siteId: events.siteId,
      siteName: sites.name,
      userId: events.userId,
      userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      communityPartnerId: events.communityPartnerId,
      communityPartnerName: communityPartners.name,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .leftJoin(sites, eq(events.siteId, sites.id))
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .leftJoin(
      communityPartners,
      eq(events.communityPartnerId, communityPartners.id)
    )
    .where(eq(events.id, eventId))
    .limit(1);

  return event;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    redirect('/login');
  }

  // Check if user is admin
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser || currentUser.role !== 'admin') {
    redirect('/admin');
  }

  // Get event data
  const { id } = await params;
  const eventData = await getEventData(id);

  if (!eventData) {
    redirect('/admin/events');
  }

  return <EventForm mode="edit" eventId={id} initialData={eventData} />;
}

export async function generateMetadata({ params }: EditEventPageProps) {
  const { id } = await params;
  const eventData = await getEventData(id);

  return {
    title: eventData ? `Edit Event - ${eventData.title}` : 'Edit Event',
    description: 'Edit event details and information',
  };
}
