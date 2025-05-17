export * from './activity-types.schema';
export * from './community-partners.schema';
export * from './events.schema';
export * from './program-goals.schema';
export * from './sites.schema';
export * from './users.schema';
import { activityTypes, activityTypesRelations } from './activity-types.schema';
import { communityPartners } from './community-partners.schema';
import { events, eventsRelations } from './events.schema';
import { programGoals, programGoalsRelations } from './program-goals.schema';
import { sites, sitesRelations } from './sites.schema';
import { users, usersRelations } from './users.schema';

export const schema = {
  activityTypes,
  activityTypesRelations,
  communityPartners,
  events,
  eventsRelations,
  programGoals,
  programGoalsRelations,
  sites,
  sitesRelations,
  users,
  usersRelations,
};
