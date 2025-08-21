import {
  pgTable,
  uuid,
  integer,
  numeric,
  varchar,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
// import { events, siteSupplies, supplies } from '@/db';
import { events } from './events.schema';
import { siteSupplies } from './site-supplies.schema';
import { supplies } from './supplies.schema';

// Event Supply Distributions - Track what was given out at events
export const eventSupplyDistributions = pgTable(
  'event_supply_distributions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    supplyId: uuid('supply_id')
      .notNull()
      .references(() => supplies.id, { onDelete: 'restrict' }), // Restrict to preserve history
    quantityDistributed: integer('quantity_distributed').notNull(),
    costPerUnitAtDistribution: numeric('cost_per_unit_at_distribution', {
      precision: 12,
      scale: 2,
    }).notNull(), // Capture cost at time of distribution for accurate reporting
    totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull(), // quantityDistributed * costPerUnitAtDistribution
    notes: varchar('notes', { length: 500 }), // Optional notes about the distribution
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    // Indexes for efficient queries
    index('event_supply_distributions_event_idx').on(table.eventId),
    index('event_supply_distributions_supply_idx').on(table.supplyId),
    index('event_supply_distributions_date_idx').on(table.createdAt),
    index('event_supply_distributions_cost_idx').on(table.totalCost),

    // Ensure positive distribution quantities and valid costs
    check('quantity_distributed_check', sql`quantity_distributed > 0`),
    check(
      'cost_check',
      sql`cost_per_unit_at_distribution >= 0 AND total_cost >= 0`
    ),
  ]
);

// Relations for event supply distributions
export const eventSupplyDistributionsRelations = relations(
  eventSupplyDistributions,
  ({ one }) => ({
    event: one(events, {
      fields: [eventSupplyDistributions.eventId],
      references: [events.id],
    }),
    supply: one(supplies, {
      fields: [eventSupplyDistributions.supplyId],
      references: [supplies.id],
    }),
  })
);

// Update existing events relations to include supply distributions
export const updatedEventsRelations = relations(events, ({ one, many }) => ({
  // ... your existing event relations (user, site, communityPartner, activityType)
  supplyDistributions: many(eventSupplyDistributions),
}));

// Update existing supplies relations to include event distributions
export const updatedSuppliesRelationsWithDistributions = relations(
  supplies,
  ({ many }) => ({
    siteSupplies: many(siteSupplies), // From the site supplies schema
    eventDistributions: many(eventSupplyDistributions),
  })
);

// Types
export type EventSupplyDistribution =
  typeof eventSupplyDistributions.$inferSelect;
export type NewEventSupplyDistribution =
  typeof eventSupplyDistributions.$inferInsert;
