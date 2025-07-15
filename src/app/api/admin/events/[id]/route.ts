// app/api/admin/events/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  db,
  users,
  events,
  sites,
  activityTypes,
  communityPartners,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import { updateEventSchema } from '@/lib/validations/events';

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

export async function PATCH(
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
    const body = await req.json();

    // Validate with Zod
    const validation = updateEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if event exists
    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if activity type exists
    const [activityType] = await db
      .select()
      .from(activityTypes)
      .where(eq(activityTypes.id, data.activityTypeId))
      .limit(1);

    if (!activityType) {
      return NextResponse.json(
        { error: 'Selected activity type does not exist' },
        { status: 400 }
      );
    }

    // Check if site exists
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, data.siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json(
        { error: 'Selected site does not exist' },
        { status: 400 }
      );
    }

    // Check community partner if specified
    if (data.communityPartnerId) {
      const [communityPartner] = await db
        .select()
        .from(communityPartners)
        .where(eq(communityPartners.id, data.communityPartnerId))
        .limit(1);

      if (!communityPartner) {
        return NextResponse.json(
          { error: 'Selected community partner does not exist' },
          { status: 400 }
        );
      }
    }

    // Update event
    const [updatedEvent] = await db
      .update(events)
      .set({
        title: data.title,
        eventDate: new Date(data.eventDate),
        description: data.description,
        eventDuration: data.eventDuration,
        adminDuration: data.adminDuration,
        newParticipants: data.newParticipants,
        returningParticipants: data.returningParticipants,
        eventIsYouthFocused: data.eventIsYouthFocused,
        hasCoHost: data.hasCoHost,
        totalCost: data.totalCost,
        activityTypeId: data.activityTypeId,
        siteId: data.siteId,
        communityPartnerId: data.communityPartnerId,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}
