import {
  pgTable,
  uuid,
  varchar,
  date,
  text,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { events } from './events.schema';
import { sites } from './sites.schema';
import { users } from './users.schema';
import { supplyDistributionItems } from './supply-distribution-items.schema';

export const supplyDistributions = pgTable(
  'supply_distributions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id), // optional
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    distributionDate: date('distribution_date').notNull(),
    distributionType: varchar('distribution_type', { length: 50 })
      .notNull()
      .default('door_to_door'), // 'event_distribution', 'door_to_door', 'community_room_pickup', 'emergency_distribution'
    recipientNotes: text('recipient_notes').notNull(), // "Mrs. Johnson apt 3B, family of 4"
    totalCost: numeric('total_cost', { precision: 12, scale: 2 })
      .default('0.00')
      .notNull(),
    notes: text('notes'), // optional context
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('supply_dist_site_idx').on(table.siteId),
    index('supply_dist_user_idx').on(table.userId),
    index('supply_dist_event_idx').on(table.eventId),
    index('supply_dist_date_idx').on(table.distributionDate),
    index('supply_dist_type_idx').on(table.distributionType),
  ]
);

// Relations
export const supplyDistributionsRelations = relations(
  supplyDistributions,
  ({ one, many }) => ({
    event: one(events, {
      fields: [supplyDistributions.eventId],
      references: [events.id],
    }),
    site: one(sites, {
      fields: [supplyDistributions.siteId],
      references: [sites.id],
    }),
    user: one(users, {
      fields: [supplyDistributions.userId],
      references: [users.id],
    }),
    distributionItems: many(supplyDistributionItems),
  })
);

// Export types
export type SupplyDistribution = typeof supplyDistributions.$inferSelect;
export type NewSupplyDistribution = typeof supplyDistributions.$inferInsert;
