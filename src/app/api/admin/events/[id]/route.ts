// app/api/admin/events/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import {
  db,
  users,
  events,
  sites,
  activityTypes,
  communityPartners,
} from '@/db';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

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
      .where(eq(events.id, id))
      .limit(1);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if event exists
    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete event
    await db.delete(events).where(eq(events.id, id));

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Event deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
