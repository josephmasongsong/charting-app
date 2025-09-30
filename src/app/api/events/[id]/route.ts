import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  db,
  events,
  users,
  sites,
  communityPartners,
  activityTypes,
  programGoals,
} from '@/db';
import { eq, sql } from 'drizzle-orm';
import { updateEventSchema } from '@/lib/validations/events';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Require authentication but not admin access
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        // Related data
        userId: events.userId,
        userName:
          sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
            'userName'
          ),
        userEmail: users.email,
        siteId: events.siteId,
        siteName: sites.name,
        siteAddress: sites.address,
        activityTypeId: events.activityTypeId,
        activityTypeName: activityTypes.name,
        programGoalName: programGoals.name,
        communityPartnerId: events.communityPartnerId,
        communityPartnerName: communityPartners.name,
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .leftJoin(sites, eq(events.siteId, sites.id))
      .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
      .leftJoin(programGoals, eq(activityTypes.programGoalId, programGoals.id))
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

// PATCH - Update event (for non-admins editing duplicated events only)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const eventId = params.id;
    const body = await req.json();
    const { isFirstSaveAfterDuplication, ...eventData } = body;

    // Validate with Zod
    const validation = updateEventSchema.safeParse(eventData);

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
      .where(eq(events.id, eventId))
      .limit(1);

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Non-admins can only edit their own events
    if (existingEvent.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own events' },
        { status: 403 }
      );
    }

    // Validate related entities exist
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

    // ===== TRACK CHANGES BEFORE UPDATE =====
    const changes: any = {};
    if (data.title !== existingEvent.title) {
      changes.title = { old: existingEvent.title, new: data.title };
    }

    // Handle eventDate - it might be a Date object or string depending on the database driver
    const existingEventDateStr =
      existingEvent.eventDate instanceof Date
        ? existingEvent.eventDate.toISOString().split('T')[0]
        : String(existingEvent.eventDate).split('T')[0];

    if (data.eventDate !== existingEventDateStr) {
      changes.eventDate = {
        old: existingEventDateStr,
        new: data.eventDate,
      };
    }
    if (data.siteId !== existingEvent.siteId) {
      const [oldSite] = await db
        .select()
        .from(sites)
        .where(eq(sites.id, existingEvent.siteId))
        .limit(1);
      changes.siteName = { old: oldSite?.name || 'Unknown', new: site.name };
    }
    const oldTotal =
      existingEvent.newParticipants + existingEvent.returningParticipants;
    const newTotal = data.newParticipants + data.returningParticipants;
    if (oldTotal !== newTotal) {
      changes.totalParticipants = { old: oldTotal, new: newTotal };
    }
    if (data.totalCost !== existingEvent.totalCost) {
      changes.totalCost = { old: existingEvent.totalCost, new: data.totalCost };
    }

    // ===== NOW DO THE UPDATE =====
    const [updatedEvent] = await db
      .update(events)
      .set({
        title: data.title,
        eventDate: new Date(data.eventDate).toISOString().split('T')[0],
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
      .where(eq(events.id, eventId))
      .returning();

    // Log activity ONLY if this is the first save after duplication
    if (isFirstSaveAfterDuplication) {
      await ActivityFeedService.logEventCreated(
        session.user.id,
        updatedEvent.id,
        {
          title: data.title,
          siteName: site.name,
          totalParticipants: data.newParticipants + data.returningParticipants,
          isYouthFocused: data.eventIsYouthFocused,
          hasCoHost: data.hasCoHost,
        }
      );
    } else if (Object.keys(changes).length > 0) {
      // Only log updates if there are actual changes and it's not first save after duplication
      await ActivityFeedService.logEventUpdated(
        session.user.id,
        updatedEvent.id,
        changes
      );
    }

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

// DELETE - Delete event (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can delete
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await db.delete(events).where(eq(events.id, params.id));

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
