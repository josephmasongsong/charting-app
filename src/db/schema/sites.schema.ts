import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  boolean,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { events } from './events.schema';
import { users } from './users.schema';
import { communityPartners } from './community-partners.schema';

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
    communityPartnerId: uuid('community_partner_id').references(
      () => communityPartners.id
    ),
    isSingleSeniorOnly: boolean('is_single_senior_only')
      .default(true)
      .notNull(),
    region: text('region').default('LMDM').notNull(),
    // A site is staffed by a Tenant Engagement Worker (required) and,
    // optionally, a People Plants & Homes programmer. Job-title correctness is
    // enforced in the API — users.job_title is plain text with no DB enum.
    tewId: uuid('tew_id')
      .notNull()
      .references(() => users.id),
    pphId: uuid('pph_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    {
      nameIdx: index('site_name_idx').on(table.name),
      tewIdx: index('site_tew_idx').on(table.tewId),
      pphIdx: index('site_pph_idx').on(table.pphId),
      locationIdx: index('site_location_idx').on(
        table.latitude,
        table.longitude
      ),
    },
  ]
);

// Define relations
export const sitesRelations = relations(sites, ({ one, many }) => ({
  tew: one(users, {
    fields: [sites.tewId],
    references: [users.id],
    relationName: 'siteTew',
  }),
  pph: one(users, {
    fields: [sites.pphId],
    references: [users.id],
    relationName: 'sitePph',
  }),
  communityPartner: one(communityPartners, {
    fields: [sites.communityPartnerId],
    references: [communityPartners.id],
  }),
  events: many(events),
}));

// Export types for this model
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
