export * from './activity-types.schema';
export * from './community-partners.schema';
export * from './events.schema';
export * from './program-goals.schema';
export * from './sites.schema';
export * from './supplies.schema';
export * from './users.schema';
export * from './site-supplies.schema';
export * from './supply-distributions.schema';
export * from './supply-distribution-items.schema';

import { activityTypes, activityTypesRelations } from './activity-types.schema';
import { communityPartners } from './community-partners.schema';
import { events, eventsRelations } from './events.schema';
import { programGoals, programGoalsRelations } from './program-goals.schema';
import { sites, sitesRelations } from './sites.schema';
import { users, usersRelations } from './users.schema';
import { supplies, suppliesRelations } from './supplies.schema';
import { siteSupplies, siteSuppliesRelations } from './site-supplies.schema';
import {
  supplyDistributions,
  supplyDistributionsRelations,
} from './supply-distributions.schema';
import {
  supplyDistributionItems,
  supplyDistributionItemsRelations,
} from './supply-distribution-items.schema';

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
  siteSupplies,
  siteSuppliesRelations,
  supplies,
  suppliesRelations,
  supplyDistributions,
  supplyDistributionsRelations,
  supplyDistributionItems,
  supplyDistributionItemsRelations,
  users,
  usersRelations,
};
