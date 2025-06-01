import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sites } from './sites.schema';
import { events } from './events.schema';

export const communityPartners = pgTable(
  'community_partners',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    {
      nameIdx: index('site_name_idx').on(table.name),
    },
  ]
);

export const communityPartnersRelations = relations(
  communityPartners,
  ({ many }) => ({
    sites: many(sites),
    events: many(events),
  })
);

// Export types for this model
export type CommunityPartner = typeof communityPartners.$inferSelect;
export type NewCommunityPartner = typeof communityPartners.$inferInsert;
