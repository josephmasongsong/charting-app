import {
  pgTable,
  uuid,
  integer,
  numeric,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { supplyDistributions } from './supply-distributions.schema';
import { supplies } from './supplies.schema';

export const supplyDistributionItems = pgTable(
  'supply_distribution_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    distributionId: uuid('distribution_id')
      .notNull()
      .references(() => supplyDistributions.id, { onDelete: 'cascade' }),
    supplyId: uuid('supply_id')
      .notNull()
      .references(() => supplies.id),
    quantityDistributed: integer('quantity_distributed').notNull(),
    unitCostAtTime: numeric('unit_cost_at_time', {
      precision: 12,
      scale: 2,
    }).notNull(), // snapshot of cost when distributed
    lineTotal: numeric('line_total', { precision: 12, scale: 2 }).notNull(), // calculated: quantity * unit_cost
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    index('supply_dist_items_dist_idx').on(table.distributionId),
    index('supply_dist_items_supply_idx').on(table.supplyId),
    index('supply_dist_items_quantity_idx').on(table.quantityDistributed),

    // Ensure quantity is positive
    check('supply_dist_items_quantity_check', sql`quantity_distributed > 0`),
    // Ensure costs are non-negative
    check('supply_dist_items_unit_cost_check', sql`unit_cost_at_time >= 0`),
    check('supply_dist_items_line_total_check', sql`line_total >= 0`),
  ]
);

// Relations
export const supplyDistributionItemsRelations = relations(
  supplyDistributionItems,
  ({ one }) => ({
    distribution: one(supplyDistributions, {
      fields: [supplyDistributionItems.distributionId],
      references: [supplyDistributions.id],
    }),
    supply: one(supplies, {
      fields: [supplyDistributionItems.supplyId],
      references: [supplies.id],
    }),
  })
);

// Export types
export type SupplyDistributionItem =
  typeof supplyDistributionItems.$inferSelect;
export type NewSupplyDistributionItem =
  typeof supplyDistributionItems.$inferInsert;
