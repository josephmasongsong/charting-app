import { NextRequest, NextResponse } from 'next/server';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';
import { getServerSession } from 'next-auth'; // or your auth method
import { formatTimeAgo } from '@/lib/utils/time.utils';
import { db, supplyDistributions, sites, events } from '@/db';
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

    // Feed rows outlive their targets (e.g. a distribution later deleted);
    // flag whether each linkable target still exists so the client only
    // renders links that resolve.
    const liveTargets = new Set<string>();
    const idsOf = (type: string) => [
      ...new Set(
        activities.filter(a => a.targetType === type).map(a => a.targetId)
      ),
    ];
    const distIds = idsOf('supply_distribution');
    if (distIds.length) {
      (
        await db
          .select({ id: supplyDistributions.id })
          .from(supplyDistributions)
          .where(inArray(supplyDistributions.id, distIds))
      ).forEach(r => liveTargets.add(r.id));
    }
    const siteIds = idsOf('site');
    if (siteIds.length) {
      (
        await db
          .select({ id: sites.id })
          .from(sites)
          .where(inArray(sites.id, siteIds))
      ).forEach(r => liveTargets.add(r.id));
    }
    const eventIds = idsOf('event');
    if (eventIds.length) {
      (
        await db
          .select({ id: events.id })
          .from(events)
          .where(inArray(events.id, eventIds))
      ).forEach(r => liveTargets.add(r.id));
    }
    const linkableTypes = ['supply_distribution', 'site', 'event'];

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
