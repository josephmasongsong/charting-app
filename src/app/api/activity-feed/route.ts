import { NextRequest, NextResponse } from 'next/server';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';
import { getServerSession } from 'next-auth'; // or your auth method
import { formatTimeAgo } from '@/lib/utils/time.utils';

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

    // Transform for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.activityType,
      user: activity.actor,
      timestamp: formatTimeAgo(activity.createdAt),
      details: activity.metadata,
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
