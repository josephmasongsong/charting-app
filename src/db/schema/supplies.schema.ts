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
    quantity: integer('quantity').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('supply_name_idx').on(table.name),
    index('supply_cost_idx').on(table.costPerUnit),
    index('supply_quantity_idx').on(table.quantity),
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
