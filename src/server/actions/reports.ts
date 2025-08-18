// Get program goals summary - only program goals with activities in the date range'use server';

import { db, events, activityTypes, programGoals, users } from '@/db';
import { sql, eq, and, gte, lt } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

interface ActivityTypeByRegion {
  activityTypeId: string;
  activityTypeName: string;
  programGoalName: string;
  region: string;
  eventCount: number;
  participantsServed: number;
  totalCost: number;
}

interface ProgramGoalSummary {
  id: string;
  name: string;
  activityCount: number;
  color: string;
}

interface ActivityTypeParticipation {
  id: string;
  name: string;
  participantCount: number;
  eventCount: number;
  color: string;
}

interface MonthlyActivityReportData {
  reportMonth: string;
  totalEvents: number;
  totalParticipants: number;
  totalNewParticipants: number;
  totalReturningParticipants: number;
  totalCost: number;
  totalEventDuration: number;
  totalAdminDuration: number;
  activityTypesByRegion: ActivityTypeByRegion[];
  programGoals: ProgramGoalSummary[];
  activityTypesParticipation: ActivityTypeParticipation[];
  regions: string[];
  availableDateRange: {
    minDate: string;
    maxDate: string;
  };
}

// Color palette for program goals
const PROGRAM_GOAL_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6366f1', // indigo
];

// Updated generateMonthlyActivityReport function to include program goals
export async function generateMonthlyActivityReport(
  startYear: number,
  startMonth: number,
  endYear?: number,
  endMonth?: number
): Promise<
  MonthlyActivityReportData & {
    availableDateRange: { minDate: string; maxDate: string };
  }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Get available date range from actual events
  const dateRange = await db
    .select({
      minDate: sql<string>`min(${events.eventDate})`,
      maxDate: sql<string>`max(${events.eventDate})`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      session.user.role === 'admin'
        ? sql`true`
        : eq(events.userId, session.user.id)
    );

  const startOfPeriod = new Date(startYear, startMonth - 1, 1);
  let endOfPeriod: Date;

  if (endYear && endMonth) {
    endOfPeriod = new Date(endYear, endMonth, 1);
  } else {
    endOfPeriod = new Date(startYear, startMonth, 1);
  }

  // Get activity type breakdown by region - only activities with events
  const activityTypeByRegionData = await db
    .select({
      activityTypeId: activityTypes.id,
      activityTypeName: activityTypes.name,
      programGoalName: programGoals.name,
      region: users.region,
      eventCount: sql<number>`count(${events.id})`,
      participantsServed: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
      totalCost: sql<number>`coalesce(sum(${events.totalCost}), 0)`,
    })
    .from(events)
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .leftJoin(programGoals, eq(activityTypes.programGoalId, programGoals.id))
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, startOfPeriod.toISOString().split('T')[0]),
        lt(events.eventDate, endOfPeriod.toISOString().split('T')[0]),
        sql`${activityTypes.id} IS NOT NULL`,
        sql`${users.region} IS NOT NULL`
      )
    )
    .groupBy(
      activityTypes.id,
      activityTypes.name,
      programGoals.name,
      users.region
    )
    .having(sql`count(${events.id}) > 0`)
    .orderBy(users.region, activityTypes.name);

  // Get activity types participation summary - only activity types with events in the date range
  const activityTypesParticipationData = await db
    .select({
      activityTypeId: activityTypes.id,
      activityTypeName: activityTypes.name,
      participantCount: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
      eventCount: sql<number>`count(${events.id})`,
    })
    .from(events)
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, startOfPeriod.toISOString().split('T')[0]),
        lt(events.eventDate, endOfPeriod.toISOString().split('T')[0]),
        sql`${activityTypes.id} IS NOT NULL`
      )
    )
    .groupBy(activityTypes.id, activityTypes.name)
    .having(sql`count(${events.id}) > 0`)
    .orderBy(
      sql`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0) DESC`
    ); // Order by participant count descending
  const programGoalsData = await db
    .select({
      programGoalId: programGoals.id,
      programGoalName: programGoals.name,
      activityCount: sql<number>`count(${events.id})`,
    })
    .from(events)
    .leftJoin(activityTypes, eq(events.activityTypeId, activityTypes.id))
    .leftJoin(programGoals, eq(activityTypes.programGoalId, programGoals.id))
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, startOfPeriod.toISOString().split('T')[0]),
        lt(events.eventDate, endOfPeriod.toISOString().split('T')[0]),
        sql`${programGoals.id} IS NOT NULL`
      )
    )
    .groupBy(programGoals.id, programGoals.name)
    .having(sql`count(${events.id}) > 0`)
    .orderBy(sql`count(${events.id}) DESC`); // Order by activity count descending

  // Get total metrics - including admin duration and participant breakdown
  const totalMetrics = await db
    .select({
      totalEvents: sql<number>`count(*)`,
      totalParticipants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
      totalNewParticipants: sql<number>`coalesce(sum(${events.newParticipants}), 0)`,
      totalReturningParticipants: sql<number>`coalesce(sum(${events.returningParticipants}), 0)`,
      totalCost: sql<number>`coalesce(sum(${events.totalCost}), 0)`,
      totalEventDuration: sql<number>`coalesce(sum(${events.eventDuration}), 0)`,
      totalAdminDuration: sql<number>`coalesce(sum(${events.adminDuration}), 0)`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, startOfPeriod.toISOString().split('T')[0]),
        lt(events.eventDate, endOfPeriod.toISOString().split('T')[0])
      )
    );

  // Get active regions
  const activeRegions = await db
    .selectDistinct({ region: users.region })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, startOfPeriod.toISOString().split('T')[0]),
        lt(events.eventDate, endOfPeriod.toISOString().split('T')[0]),
        sql`${users.region} IS NOT NULL`
      )
    )
    .orderBy(users.region);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let reportMonth: string;
  if (
    endYear &&
    endMonth &&
    (endYear !== startYear || endMonth !== startMonth)
  ) {
    reportMonth = `${monthNames[startMonth - 1]} ${startYear} - ${monthNames[endMonth - 1]} ${endYear}`;
  } else {
    reportMonth = `${monthNames[startMonth - 1]} ${startYear}`;
  }

  // Map program goals with colors
  const programGoalsWithColors: ProgramGoalSummary[] = programGoalsData.map(
    (goal, index) => ({
      id: goal.programGoalId,
      name: goal.programGoalName,
      activityCount: Number(goal.activityCount),
      color: PROGRAM_GOAL_COLORS[index % PROGRAM_GOAL_COLORS.length],
    })
  );

  // Map activity types participation with colors (different palette to avoid conflicts)
  const activityTypesParticipationWithColors: ActivityTypeParticipation[] =
    activityTypesParticipationData.map((activity, index) => ({
      id: activity.activityTypeId,
      name: activity.activityTypeName,
      participantCount: Number(activity.participantCount),
      eventCount: Number(activity.eventCount),
      color: PROGRAM_GOAL_COLORS[(index + 3) % PROGRAM_GOAL_COLORS.length], // Offset by 3 to avoid exact same colors as program goals
    }));

  return {
    reportMonth,
    totalEvents: totalMetrics[0]?.totalEvents || 0,
    totalParticipants: totalMetrics[0]?.totalParticipants || 0,
    totalNewParticipants: totalMetrics[0]?.totalNewParticipants || 0,
    totalReturningParticipants:
      totalMetrics[0]?.totalReturningParticipants || 0,
    totalCost: Number(totalMetrics[0]?.totalCost || 0),
    totalEventDuration: Number(totalMetrics[0]?.totalEventDuration || 0),
    totalAdminDuration: Number(totalMetrics[0]?.totalAdminDuration || 0),
    activityTypesByRegion: activityTypeByRegionData.map(item => ({
      activityTypeId: item.activityTypeId,
      activityTypeName: item.activityTypeName,
      programGoalName: item.programGoalName,
      region: item.region,
      eventCount: Number(item.eventCount),
      participantsServed: Number(item.participantsServed),
      totalCost: Number(item.totalCost),
    })),
    programGoals: programGoalsWithColors,
    activityTypesParticipation: activityTypesParticipationWithColors,
    regions: activeRegions.map(r => r.region).filter(Boolean),
    availableDateRange: {
      minDate: dateRange[0]?.minDate || '',
      maxDate: dateRange[0]?.maxDate || '',
    },
  };
}
