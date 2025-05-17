import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';

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

// Export types for this model
export type CommunityPartner = typeof communityPartners.$inferSelect;
export type NewCommunityPartner = typeof communityPartners.$inferInsert;
