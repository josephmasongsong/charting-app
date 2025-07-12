import { eq, desc } from 'drizzle-orm';
import { db, users } from '@/db';
import { activityFeed } from '@/db/schema/activity-feed.schema';
import { ActivityFeedItem } from '../types/activity-feed.types';

export class ActivityFeedService {
  // Create activity when user is invited
  static async logUserInvited(
    actorId: string,
    invitedEmail: string,
    role: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'user_invited',
      actorId,
      targetType: 'user_invitation',
      targetId: crypto.randomUUID(), // Generate a temp ID for invitations
      metadata: {
        invitedEmail,
        role,
      },
    });
  }

  // Create activity when event is created
  static async logEventCreated(
    actorId: string,
    eventId: string,
    eventData: {
      title: string;
      siteName: string;
      totalParticipants: number;
      isYouthFocused: boolean;
      hasCoHost: boolean;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'event_created',
      actorId,
      targetType: 'event',
      targetId: eventId,
      metadata: {
        eventTitle: eventData.title,
        siteName: eventData.siteName,
        totalParticipants: eventData.totalParticipants,
        isYouthFocused: eventData.isYouthFocused,
        hasCoHost: eventData.hasCoHost,
      },
    });
  }

  // Create activity when activity type is created
  static async logActivityTypeCreated(
    actorId: string,
    activityTypeId: string,
    activityTypeData: {
      name: string;
      programGoalName: string;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'activity_type_created',
      actorId,
      targetType: 'activity_type',
      targetId: activityTypeId,
      metadata: {
        activityTypeName: activityTypeData.name,
        programGoal: activityTypeData.programGoalName,
      },
    });
  }

  // Create activity when site is created
  static async logSiteCreated(
    actorId: string,
    siteId: string,
    siteData: {
      name: string;
      tenantCount: number;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'site_created',
      actorId,
      targetType: 'site',
      targetId: siteId,
      metadata: {
        siteName: siteData.name,
        tenantCount: siteData.tenantCount,
      },
    });
  }

  // Create activity when community partner is added
  static async logCommunityPartnerAdded(
    actorId: string,
    partnerId: string,
    partnerData: {
      name: string;
      siteName: string;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'community_partner_added',
      actorId,
      targetType: 'community_partner',
      targetId: partnerId,
      metadata: {
        partnerName: partnerData.name,
        siteName: partnerData.siteName,
      },
    });
  }

  // Create activity when program goal is created
  static async logProgramGoalCreated(
    actorId: string,
    programGoalId: string,
    programGoalData: {
      name: string;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'program_goal_created',
      actorId,
      targetType: 'program_goal',
      targetId: programGoalId,
      metadata: {
        programGoalName: programGoalData.name,
      },
    });
  }

  // Get recent activity feed
  static async getRecentActivity(
    limit: number = 20
  ): Promise<ActivityFeedItem[]> {
    const activities = await db
      .select({
        id: activityFeed.id,
        activityType: activityFeed.activityType,
        actorId: activityFeed.actorId,
        targetType: activityFeed.targetType,
        targetId: activityFeed.targetId,
        metadata: activityFeed.metadata,
        createdAt: activityFeed.createdAt,
        actor: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(activityFeed)
      .innerJoin(users, eq(activityFeed.actorId, users.id))
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit);

    return activities as ActivityFeedItem[];
  }
}
