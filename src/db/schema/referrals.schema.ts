import {
  pgTable,
  uuid,
  varchar,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sites } from './sites.schema';
import { users } from './users.schema';

export const referrals = pgTable(
  'referrals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    referralDate: date('referral_date').notNull(),
    // See CHANNELS / REFERRED_TO in src/lib/referral-options.ts. Plain varchar
    // with no database enum, matching supply_distributions.distribution_type.
    channel: varchar('channel', { length: 50 }).notNull(),
    referredTo: varchar('referred_to', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  // Postgres index names are database-global and `events` already holds the
  // generic site_idx / user_idx / date_idx, so every name is prefixed.
  table => [
    index('referral_site_idx').on(table.siteId),
    index('referral_user_idx').on(table.userId),
    index('referral_date_idx').on(table.referralDate),
  ]
);

// Relations
export const referralsRelations = relations(referrals, ({ one }) => ({
  site: one(sites, {
    fields: [referrals.siteId],
    references: [sites.id],
  }),
  user: one(users, {
    fields: [referrals.userId],
    references: [users.id],
  }),
}));

// Export types
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
