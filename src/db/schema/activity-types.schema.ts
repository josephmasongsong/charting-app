import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { programGoals } from './program-goals.schema';

export const activityTypes = pgTable(
  'activity_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    programGoalId: uuid('program_goal_id')
      .notNull()
      .references(() => programGoals.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    {
      nameIdx: index('site_name_idx').on(table.name),
    },
  ]
);

// Define relations
export const activityTypesRelations = relations(activityTypes, ({ one }) => ({
  programGoal: one(programGoals, {
    fields: [activityTypes.programGoalId],
    references: [programGoals.id],
  }),
}));

// Export types for this model
export type ActivityType = typeof activityTypes.$inferSelect;
export type NewActivityType = typeof activityTypes.$inferInsert;
