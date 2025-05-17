import { pgTable, uuid, varchar, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    isAdmin: boolean('is_admin').default(false).notNull(),
  },
  table => [
    {
      nameIdx: index('name_idx').on(table.firstName, table.lastName),
      emailIdx: index('email_idx').on(table.email),
    },
  ]
);

// Type for user records
export type User = typeof users.$inferSelect;
// Type for inserting user records
export type NewUser = typeof users.$inferInsert;
