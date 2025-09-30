// lib/services/activity-feed.service.ts
import { eq, desc } from 'drizzle-orm';
import { db, users } from '@/db';
import { activityFeed } from '@/db/schema/activity-feed.schema';
import { ActivityFeedItem } from '../types/activity-feed.types';

export class ActivityFeedService {
  // ============= EXISTING METHODS =============

  static async logSupplyDistribution(
    actorId: string,
    distributionId: string,
    distributionData: {
      siteName: string;
      distributionType: string;
      recipientNotes: string;
      totalCost: number;
      supplies: Array<{
        supplyName: string;
        quantity: number;
        unitCostAtTime: string;
        lineTotal: string;
      }>;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'supply_distribution_logged',
      actorId,
      targetType: 'supply_distribution',
      targetId: distributionId,
      metadata: {
        siteName: distributionData.siteName,
        distributionType: distributionData.distributionType,
        recipientNotes: distributionData.recipientNotes,
        totalCost: distributionData.totalCost,
        supplies: distributionData.supplies,
        totalItems: distributionData.supplies.length,
        totalQuantity: distributionData.supplies.reduce(
          (sum, supply) => sum + supply.quantity,
          0
        ),
      },
    });
  }

  static async logUserInvited(
    actorId: string,
    invitedEmail: string,
    title: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'user_invited',
      actorId,
      targetType: 'user_invitation',
      targetId: crypto.randomUUID(),
      metadata: {
        invitedEmail,
        title,
      },
    });
  }

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

  static async logSupplyCreated(
    actorId: string,
    supplyId: string,
    supplyData: {
      name: string;
      costPerUnit: string;
      quantity: number;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'supply_created',
      actorId,
      targetType: 'supply',
      targetId: supplyId,
      metadata: {
        supplyName: supplyData.name,
        costPerUnit: supplyData.costPerUnit,
        quantity: supplyData.quantity,
      },
    });
  }

  static async logSuppliesAddedToSite(
    actorId: string,
    siteId: string,
    siteSupplyData: {
      siteName: string;
      supplies: Array<{
        name: string;
        quantity: number;
        costPerUnit: string;
      }>;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'supplies_added_to_site',
      actorId,
      targetType: 'site',
      targetId: siteId,
      metadata: {
        siteName: siteSupplyData.siteName,
        supplies: siteSupplyData.supplies,
        totalItems: siteSupplyData.supplies.length,
      },
    });
  }

  static async logSuppliesRemovedFromSite(
    actorId: string,
    siteId: string,
    siteSupplyData: {
      siteName: string;
      supplies: Array<{
        name: string;
        quantity: number;
        costPerUnit: string;
      }>;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'supplies_removed_from_site',
      actorId,
      targetType: 'site',
      targetId: siteId,
      metadata: {
        siteName: siteSupplyData.siteName,
        supplies: siteSupplyData.supplies,
        totalItems: siteSupplyData.supplies.length,
      },
    });
  }

  static async logSiteSupplyUpdated(
    actorId: string,
    siteId: string,
    updateData: {
      siteName: string;
      supplyName: string;
      oldQuantity: number;
      newQuantity: number;
      costPerUnit: string;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'site_supply_updated',
      actorId,
      targetType: 'site',
      targetId: siteId,
      metadata: {
        siteName: updateData.siteName,
        supplyName: updateData.supplyName,
        oldQuantity: updateData.oldQuantity,
        newQuantity: updateData.newQuantity,
        quantityChange: updateData.newQuantity - updateData.oldQuantity,
        costPerUnit: updateData.costPerUnit,
      },
    });
  }

  // ============= NEW UPDATE METHODS =============

  static async logEventUpdated(
    actorId: string,
    eventId: string,
    changes: {
      title?: { old: string; new: string };
      eventDate?: { old: string; new: string };
      siteName?: { old: string; new: string };
      totalParticipants?: { old: number; new: number };
      totalCost?: { old: string; new: string };
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'event_updated',
      actorId,
      targetType: 'event',
      targetId: eventId,
      metadata: {
        changes,
      },
    });
  }

  static async logSiteUpdated(
    actorId: string,
    siteId: string,
    changes: {
      name?: { old: string; new: string };
      address?: { old: string; new: string };
      numberOfTenants?: { old: number; new: number };
      hasCommunityRoom?: { old: boolean; new: boolean };
      communityPartnerName?: { old: string | null; new: string | null };
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'site_updated',
      actorId,
      targetType: 'site',
      targetId: siteId,
      metadata: {
        changes,
      },
    });
  }

  static async logProgramGoalUpdated(
    actorId: string,
    programGoalId: string,
    oldName: string,
    newName: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'program_goal_updated',
      actorId,
      targetType: 'program_goal',
      targetId: programGoalId,
      metadata: {
        oldName,
        newName,
      },
    });
  }

  static async logActivityTypeUpdated(
    actorId: string,
    activityTypeId: string,
    changes: {
      name?: { old: string; new: string };
      programGoalName?: { old: string; new: string };
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'activity_type_updated',
      actorId,
      targetType: 'activity_type',
      targetId: activityTypeId,
      metadata: {
        changes,
      },
    });
  }

  static async logCommunityPartnerUpdated(
    actorId: string,
    partnerId: string,
    oldName: string,
    newName: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'community_partner_updated',
      actorId,
      targetType: 'community_partner',
      targetId: partnerId,
      metadata: {
        oldName,
        newName,
      },
    });
  }

  static async logSupplyUpdated(
    actorId: string,
    supplyId: string,
    changes: {
      name?: { old: string; new: string };
      costPerUnit?: { old: string; new: string };
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'supply_updated',
      actorId,
      targetType: 'supply',
      targetId: supplyId,
      metadata: {
        changes,
      },
    });
  }

  static async logUserUpdated(
    actorId: string,
    targetUserId: string,
    changes: {
      name?: { old: string; new: string };
      email?: { old: string; new: string };
      role?: { old: string; new: string };
      jobTitle?: { old: string | null; new: string | null };
      region?: { old: string; new: string };
      isActive?: { old: boolean; new: boolean };
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'user_updated',
      actorId,
      targetType: 'user',
      targetId: targetUserId,
      metadata: {
        changes,
      },
    });
  }

  // ============= NEW DELETE METHODS =============

  static async logEventDeleted(
    actorId: string,
    eventId: string,
    eventData: {
      title: string;
      siteName: string;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'event_deleted',
      actorId,
      targetType: 'event',
      targetId: eventId,
      metadata: {
        eventTitle: eventData.title,
        siteName: eventData.siteName,
      },
    });
  }

  static async logSiteDeleted(
    actorId: string,
    siteId: string,
    siteName: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'site_deleted',
      actorId,
      targetType: 'site',
      targetId: siteId,
      metadata: {
        siteName,
      },
    });
  }

  static async logProgramGoalDeleted(
    actorId: string,
    programGoalId: string,
    programGoalName: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'program_goal_deleted',
      actorId,
      targetType: 'program_goal',
      targetId: programGoalId,
      metadata: {
        programGoalName,
      },
    });
  }

  static async logActivityTypeDeleted(
    actorId: string,
    activityTypeId: string,
    activityTypeName: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'activity_type_deleted',
      actorId,
      targetType: 'activity_type',
      targetId: activityTypeId,
      metadata: {
        activityTypeName,
      },
    });
  }

  static async logCommunityPartnerDeleted(
    actorId: string,
    partnerId: string,
    partnerName: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'community_partner_deleted',
      actorId,
      targetType: 'community_partner',
      targetId: partnerId,
      metadata: {
        partnerName,
      },
    });
  }

  static async logSupplyDeleted(
    actorId: string,
    supplyId: string,
    supplyName: string
  ) {
    await db.insert(activityFeed).values({
      activityType: 'supply_deleted',
      actorId,
      targetType: 'supply',
      targetId: supplyId,
      metadata: {
        supplyName,
      },
    });
  }

  static async logSupplyDistributionDeleted(
    actorId: string,
    distributionId: string,
    distributionData: {
      siteName: string;
      distributionType: string;
      totalItems: number;
    }
  ) {
    await db.insert(activityFeed).values({
      activityType: 'supply_distribution_deleted',
      actorId,
      targetType: 'supply_distribution',
      targetId: distributionId,
      metadata: {
        siteName: distributionData.siteName,
        distributionType: distributionData.distributionType,
        totalItems: distributionData.totalItems,
      },
    });
  }

  // ============= HELPER METHOD =============

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
