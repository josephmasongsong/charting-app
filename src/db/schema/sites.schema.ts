// src/db/schema/sites.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

export const sites = pgTable(
  'sites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
    longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
    address: varchar('address', { length: 500 }).notNull(),
    numberOfTenants: integer('number_of_tenants').notNull(),
    hasCommunityRoom: boolean('has_community_room').default(true).notNull(),
    hasCommunityPartner: boolean('has_community_partner')
      .default(false)
      .notNull(),
    isSingleSeniorOnly: boolean('is_single_senior_only')
      .default(true)
      .notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    {
      nameIdx: index('site_name_idx').on(table.name),
      userIdx: index('site_user_idx').on(table.userId),
      locationIdx: index('site_location_idx').on(
        table.latitude,
        table.longitude
      ),
    },
  ]
);

// Define relations
export const sitesRelations = relations(sites, ({ one }) => ({
  user: one(users, {
    fields: [sites.userId],
    references: [users.id],
  }),
}));

// Export types for this model
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
