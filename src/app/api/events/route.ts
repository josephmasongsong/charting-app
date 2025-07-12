import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { eq } from 'drizzle-orm';
import { authOptions } from '@/app/lib/auth';
import { db, events, sites } from '@/db';
import { createEventSchema } from '@/app/lib/validations/events';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

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
