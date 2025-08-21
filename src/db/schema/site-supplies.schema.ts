import {
  pgTable,
  uuid,
  integer,
  timestamp,
  index,
  check,
  unique,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { sites, supplies } from '@/db';

// Site Supplies - Inventory at each site
export const siteSupplies = pgTable(
  'site_supplies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    supplyId: uuid('supply_id')
      .notNull()
      .references(() => supplies.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    // Indexes for efficient queries
    index('site_supplies_site_idx').on(table.siteId),
    index('site_supplies_supply_idx').on(table.supplyId),
    index('site_supplies_quantity_idx').on(table.quantity),

    // Unique constraint: one record per site-supply combination
    unique('site_supplies_unique_constraint').on(table.siteId, table.supplyId),

    // Ensure quantity is never negative
    check('site_supplies_quantity_check', sql`quantity >= 0`),
  ]
);

// Relations for site supplies
export const siteSuppliesRelations = relations(siteSupplies, ({ one }) => ({
  site: one(sites, {
    fields: [siteSupplies.siteId],
    references: [sites.id],
  }),
  supply: one(supplies, {
    fields: [siteSupplies.supplyId],
    references: [supplies.id],
  }),
}));

// Update existing sites relations to include site supplies
export const updatedSitesRelations = relations(sites, ({ one, many }) => ({
  // ... your existing site relations (user, communityPartner, events)
  siteSupplies: many(siteSupplies),
}));

// Update existing supplies relations to include site supplies
export const updatedSuppliesRelations = relations(supplies, ({ many }) => ({
  siteSupplies: many(siteSupplies),
  // eventDistributions: many(eventSupplyDistributions), // Add this when you create that table
}));

// Types
export type SiteSupply = typeof siteSupplies.$inferSelect;
export type NewSiteSupply = typeof siteSupplies.$inferInsert;
