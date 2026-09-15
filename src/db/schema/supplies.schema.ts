import {
  pgTable,
  uuid,
  varchar,
  numeric,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const supplies = pgTable(
  'supplies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    costPerUnit: numeric('cost_per_unit', { precision: 12, scale: 2 })
      .default('0.00')
      .notNull(),
    // There is deliberately no `quantity` column. How many units a supply has
    // is the sum of its site_supplies rows and nothing else — a stored rollup
    // drifted from that sum every time anything moved stock without adjusting
    // it (see migration 0030).
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('supply_name_idx').on(table.name),
    index('supply_cost_idx').on(table.costPerUnit),
  ]
);

// Define relations (placeholder for future relationships)
export const suppliesRelations = relations(supplies, ({ many }) => ({
  // Future relations can be added here:
  // siteSupplies: many(siteSupplies),
  // eventDistributions: many(eventSupplyDistributions),
}));

// Type for supply records
export type Supply = typeof supplies.$inferSelect;
// Type for inserting supply records
export type NewSupply = typeof supplies.$inferInsert;
