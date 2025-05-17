export * from './community-partners.schema';
export * from './sites.schema';
export * from './users.schema';
import { activityTypes, activityTypesRelations } from './activity-types.schema';
import { communityPartners } from './community-partners.schema';
import { programGoals, programGoalsRelations } from './program-goals.schema';
import { sites, sitesRelations } from './sites.schema';
import { users, usersRelations } from './users.schema';

export const schema = {
  activityTypes,
  activityTypesRelations,
  communityPartners,
  programGoals,
  programGoalsRelations,
  sites,
  sitesRelations,
  users,
  usersRelations,
};
