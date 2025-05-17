import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { activityTypes } from './activity-types.schema';

export const programGoals = pgTable(
  'program_goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [index('name_idx').on(table.name)]
);

// Define relations
export const programGoalsRelations = relations(programGoals, ({ many }) => ({
  activityTypes: many(activityTypes),
}));
