import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { db, events, sites, users, activityTypes, communityPartners } from '@/db';
import { createEventSchema } from '@/lib/validations/events';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

/**
 * The events list for both /events and /admin/events. Session-only: the list
 * has never been scoped to the current user, and the admin screen's extra
 * powers live on the /api/admin/events/[id] mutation routes, not here.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const site = searchParams.get('site');
    const organizer = searchParams.get('organizer');
    const offset = (page - 1) * limit;

    // One condition list, shared by the count and the page query, so the two
    // can never disagree and report a pagination total the rows contradict.
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(events.title, `%${search}%`),
          ilike(events.successes, `%${search}%`),
          ilike(events.challenges, `%${search}%`),
          ilike(sites.name, `%${search}%`),
          ilike(activityTypes.name, `%${search}%`),
          ilike(communityPartners.name, `%${search}%`)
        )
      );
    }

    if (site && site !== 'all') {
      conditions.push(eq(events.siteId, site));
    }

    if (organizer && organizer !== 'all') {
      conditions.push(eq(events.userId, organizer));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = db
      .select({ count: count() })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .leftJoin(sites, eq(events.siteId, sites.id))
      .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
      .leftJoin(
        communityPartners,
        eq(events.communityPartnerId, communityPartners.id)
      );

    const countResult = whereCondition
      ? await countQuery.where(whereCondition)
      : await countQuery;

    const totalCount = countResult[0]?.count || 0;

    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const orderBy =
      sortOrder === 'asc' ? asc(events.eventDate) : desc(events.eventDate);

    const eventsQuery = db
      .select({
        id: events.id,
        title: events.title,
        eventDate: events.eventDate,
        eventIsYouthFocused: events.eventIsYouthFocused,
        activityTypeName: activityTypes.name,
        siteName: sites.name,
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
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
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy);

    const eventsData = whereCondition
      ? await eventsQuery.where(whereCondition)
      : await eventsQuery;

    return NextResponse.json({
      events: eventsData,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // ❌ Remove this line - it's causing the validation error!
    // if (body.eventDate) {
    //   body.eventDate = new Date(body.eventDate);
    // }

    // Validate with Zod - body.eventDate is already a string which is what createEventSchema expects
    const validation = createEventSchema.safeParse(body);

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

    // Create event
    const [newEvent] = await db
      .insert(events)
      .values({
        ...data,
        userId: session.user.id,
        eventDate: new Date(data.eventDate).toISOString().split('T')[0], // Convert string to Date then to YYYY-MM-DD
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Get site name for activity logging
    const site = await db
      .select({ name: sites.name })
      .from(sites)
      .where(eq(sites.id, data.siteId))
      .limit(1);

    // Log the activity
    await ActivityFeedService.logEventCreated(session.user.id, newEvent.id, {
      title: data.title,
      siteName: site[0]?.name || 'Unknown Site',
      totalParticipants: data.newParticipants + data.returningParticipants,
      isYouthFocused: data.eventIsYouthFocused,
      hasCoHost: data.hasCoHost,
    });

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: newEvent,
    });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
