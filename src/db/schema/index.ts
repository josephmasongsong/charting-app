export * from './activity-types.schema';
export * from './community-partners.schema';
export * from './events.schema';
export * from './program-goals.schema';
export * from './sites.schema';
export * from './supplies.schema';
export * from './users.schema';
export * from './site-supplies.schema';
export * from './event-supply-distributions.schema';

import { activityTypes, activityTypesRelations } from './activity-types.schema';
import { communityPartners } from './community-partners.schema';
import { events, eventsRelations } from './events.schema';
import {
  eventSupplyDistributions,
  eventSupplyDistributionsRelations,
} from './event-supply-distributions.schema';
import { programGoals, programGoalsRelations } from './program-goals.schema';
import { sites, sitesRelations } from './sites.schema';
import { users, usersRelations } from './users.schema';
import { supplies, suppliesRelations } from './supplies.schema';
import { siteSupplies, siteSuppliesRelations } from './site-supplies.schema';

export const schema = {
  activityTypes,
  activityTypesRelations,
  communityPartners,
  events,
  eventsRelations,
  eventSupplyDistributions,
  eventSupplyDistributionsRelations,
  programGoals,
  programGoalsRelations,
  sites,
  sitesRelations,
  siteSupplies,
  siteSuppliesRelations,
  supplies,
  suppliesRelations,
  users,
  usersRelations,
};
