// app/api/admin/events/route.ts
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
import { eq, ilike, or, count, desc, asc, sql } from 'drizzle-orm';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'eventDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Build where condition based on search
    const searchCondition = search
      ? or(
          ilike(events.title, `%${search}%`),
          ilike(events.description, `%${search}%`),
          ilike(sites.name, `%${search}%`),
          ilike(activityTypes.name, `%${search}%`),
          ilike(communityPartners.name, `%${search}%`)
        )
      : undefined;

    // Get total count for pagination with joins
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

    const countResult = searchCondition
      ? await countQuery.where(searchCondition)
      : await countQuery;

    const totalCount = countResult[0]?.count || 0;

    // Determine sort order
    const orderBy =
      sortOrder === 'asc'
        ? sortField === 'title'
          ? asc(events.title)
          : asc(events.eventDate)
        : sortField === 'title'
          ? desc(events.title)
          : desc(events.eventDate);

    // Get paginated results with related data
    let eventsQuery = db
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
        activityTypeName: activityTypes.name,
        siteName: sites.name,
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
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
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy);

    // Apply search condition if it exists
    const allEvents = searchCondition
      ? await eventsQuery.where(searchCondition)
      : await eventsQuery;

    return NextResponse.json({
      events: allEvents,
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
