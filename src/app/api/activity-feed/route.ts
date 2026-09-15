import { NextRequest, NextResponse } from 'next/server';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';
import { getServerSession } from 'next-auth'; // or your auth method
import { formatTimeAgo } from '@/lib/utils/time.utils';
import { db, events } from '@/db';
import { inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    // Fetch activity feed
    const activities = await ActivityFeedService.getRecentActivity(limit);

    // Feed rows outlive their targets (an event later deleted), and the event
    // title is the only thing the feed links. So only events need checking —
    // sites, distributions and referrals are named in plain text now, and
    // looking them up would be three queries nothing reads.
    const liveTargets = new Set<string>();
    const eventIds = [
      ...new Set(
        activities.filter(a => a.targetType === 'event').map(a => a.targetId)
      ),
    ];
    if (eventIds.length) {
      (
        await db
          .select({ id: events.id })
          .from(events)
          .where(inArray(events.id, eventIds))
      ).forEach(r => liveTargets.add(r.id));
    }
    const linkableTypes = ['event'];

    // Transform for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.activityType,
      user: activity.actor,
      userId: activity.actorId,
      timestamp: formatTimeAgo(activity.createdAt),
      createdAt: activity.createdAt,
      details: activity.metadata,
      targetId: activity.targetId, // ← Add this line!
      targetExists: linkableTypes.includes(activity.targetType)
        ? liveTargets.has(activity.targetId)
        : true,
    }));

    return NextResponse.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
