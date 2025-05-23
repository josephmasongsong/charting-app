import {
  pgTable,
  uuid,
  varchar,
  boolean,
  index,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { events } from './events.schema';
import { sites } from './sites.schema';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    isAdmin: boolean('is_admin').default(false).notNull(),
    hashedPassword: text('hashed_password'),
    resetToken: text('reset_token').unique(),
    resetTokenExpiry: timestamp('reset_token_expiry'),
    role: text('role').default('user'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    {
      nameIdx: index('name_idx').on(table.firstName, table.lastName),
      emailIdx: index('email_idx').on(table.email),
    },
  ]
);

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  sites: many(sites),
}));

// Type for user records
export type User = typeof users.$inferSelect;
// Type for inserting user records
export type NewUser = typeof users.$inferInsert;
