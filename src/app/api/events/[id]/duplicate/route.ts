// app/api/events/[id]/duplicate/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { db, events } from '@/db';

export async function POST(
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

    // Fetch the original event
    const [originalEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!originalEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Create a duplicate event with modified title, today's date, and current user
    const [duplicatedEvent] = await db
      .insert(events)
      .values({
        title: `${originalEvent.title} (Copy)`,
        eventDate: today, // Set to today's date
        description: originalEvent.description,
        eventDuration: originalEvent.eventDuration,
        adminDuration: originalEvent.adminDuration,
        newParticipants: originalEvent.newParticipants,
        returningParticipants: originalEvent.returningParticipants,
        eventIsYouthFocused: originalEvent.eventIsYouthFocused,
        hasCoHost: originalEvent.hasCoHost,
        communityPartnerId: originalEvent.communityPartnerId,
        totalCost: originalEvent.totalCost,
        activityTypeId: originalEvent.activityTypeId,
        siteId: originalEvent.siteId,
        userId: session.user.id, // Use current user, not original creator
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // NOTE: We intentionally do NOT log this to activity feed
    // Activity will be logged when user saves the edited duplicate

    return NextResponse.json({
      success: true,
      message: 'Event duplicated successfully',
      event: duplicatedEvent,
    });
  } catch (error) {
    console.error('Event duplication error:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate event' },
      { status: 500 }
    );
  }
}
