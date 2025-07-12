export type ActivityType =
  | 'user_invited'
  | 'event_created'
  | 'activity_type_created'
  | 'site_created'
  | 'community_partner_added'
  | 'program_goal_created';

export type ActivityFeedItem = {
  id: string;
  activityType: ActivityType;
  actorId: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  actor: {
    firstName: string;
    lastName: string;
  };
};
