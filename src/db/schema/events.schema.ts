import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
  text,
  numeric
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { activityTypes } from './activity-types.schema';
import { sites } from './sites.schema';
import { users } from './users.schema';

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    eventDate: timestamp('event_date').notNull(),
    description: text('description').notNull(),
    eventDuration: integer('event_duration').default(0).notNull(),
    adminDuration: integer('admin_duration').default(0).notNull(),
    newParticipants: integer('new_participants').default(0).notNull(),
    returningParticipants: integer('returning_participants')
      .default(0)
      .notNull(),
    eventIsYouthFocused: boolean('event_is_youth_focused')
      .notNull()
      .default(false),
    hasCoSponsor: boolean('has_co_sponsor').default(false).notNull(),
    totalSpend: numeric('amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
    activityTypeId: uuid('activity_type_id')
      .notNull()
      .references(() => activityTypes.id),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    index('user_idx').on(table.userId),
    index('activity_type_idx').on(table.activityTypeId),
    index('site_idx').on(table.siteId),
    index('date_idx').on(table.eventDate),
  ]
);

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  site: one(sites, {
    fields: [events.siteId],
    references: [sites.id],
  }),
  activityType: one(activityTypes, {
    fields: [events.activityTypeId],
    references: [activityTypes.id],
  }),
}));

// Export types for this model
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

