'use server';

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

interface MonthlyActivityReportData {
  reportMonth: string;
  totalEvents: number;
  totalParticipants: number;
  totalCost: number;
  totalEventDuration: number; // Add this
  activityTypesByRegion: ActivityTypeByRegion[];
  regions: string[];
  availableDateRange: {
    minDate: string;
    maxDate: string;
  };
}

// Updated generateMonthlyActivityReport function to include date range info
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

  // Get total metrics
  const totalMetrics = await db
    .select({
      totalEvents: sql<number>`count(*)`,
      totalParticipants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
      totalCost: sql<number>`coalesce(sum(${events.totalCost}), 0)`,
      totalEventDuration: sql<number>`coalesce(sum(${events.eventDuration}), 0)`, // Add this
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

  return {
    reportMonth,
    totalEvents: totalMetrics[0]?.totalEvents || 0,
    totalParticipants: totalMetrics[0]?.totalParticipants || 0,
    totalCost: Number(totalMetrics[0]?.totalCost || 0),
    totalEventDuration: Number(totalMetrics[0]?.totalEventDuration || 0), // Add this
    activityTypesByRegion: activityTypeByRegionData.map(item => ({
      activityTypeId: item.activityTypeId,
      activityTypeName: item.activityTypeName,
      programGoalName: item.programGoalName,
      region: item.region,
      eventCount: Number(item.eventCount),
      participantsServed: Number(item.participantsServed),
      totalCost: Number(item.totalCost),
    })),
    regions: activeRegions.map(r => r.region).filter(Boolean),
    availableDateRange: {
      minDate: dateRange[0]?.minDate || '',
      maxDate: dateRange[0]?.maxDate || '',
    },
  };
}
