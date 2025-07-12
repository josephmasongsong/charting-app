import {
  pgTable,
  jsonb,
  uuid,
  varchar,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

export const activityFeed = pgTable(
  'activity_feed',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    activityType: varchar('activity_type', { length: 50 }).notNull(), // 'event_created', 'site_created', etc.
    actorId: uuid('actor_id')
      .notNull()
      .references(() => users.id), // Who performed the action
    targetType: varchar('target_type', { length: 50 }).notNull(), // 'event', 'site', 'activity_type', etc.
    targetId: uuid('target_id').notNull(), // ID of the thing that was created/modified
    metadata: jsonb('metadata'), // Store additional data like event title, site name, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    index('activity_actor_idx').on(table.actorId),
    // index('activity_type_idx').on(table.activityType),
    index('activity_created_at_idx').on(table.createdAt),
  ]
);

// Relations
export const activityFeedRelations = relations(activityFeed, ({ one }) => ({
  actor: one(users, {
    fields: [activityFeed.actorId],
    references: [users.id],
  }),
}));
