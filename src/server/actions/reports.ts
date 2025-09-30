'use server';

import {
  db,
  events,
  activityTypes,
  programGoals,
  users,
  supplyDistributions,
  supplyDistributionItems,
  supplies,
} from '@/db';
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
  newParticipants: number;
  returningParticipants: number;
  totalAdminDuration: number;
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

interface MonthlyParticipantGrowth {
  region: string;
  currentMonthParticipants: number;
  previousMonthParticipants: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface MonthlyEventGrowth {
  region: string;
  currentMonthEvents: number;
  previousMonthEvents: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface MonthlyCostGrowth {
  currentMonthCost: number;
  previousMonthCost: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface RegionalCostGrowth {
  region: string;
  currentMonthCost: number;
  previousMonthCost: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface MonthlySupplyDistributionGrowth {
  currentMonthQuantity: number;
  previousMonthQuantity: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

interface SupplyDistributionSummary {
  supplyId: string;
  supplyName: string;
  totalQuantityDistributed: number;
  totalCost: number;
  distributionCount: number;
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
  monthlyParticipantGrowth: MonthlyParticipantGrowth[];
  monthlyEventGrowth: MonthlyEventGrowth[];
  monthlyCostGrowth: MonthlyCostGrowth;
  regionalCostGrowth: RegionalCostGrowth[];
  monthlySupplyDistributionGrowth: MonthlySupplyDistributionGrowth;
  supplyDistributions: SupplyDistributionSummary[];
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

// Updated generateMonthlyActivityReport function to include supply distributions
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

  // Get supply distribution data for the period
  const supplyDistributionData = await db
    .select({
      supplyId: supplies.id,
      supplyName: supplies.name,
      totalQuantityDistributed: sql<number>`coalesce(sum(${supplyDistributionItems.quantityDistributed}), 0)`,
      totalCost: sql<number>`coalesce(sum(${supplyDistributionItems.lineTotal}), 0)`,
      distributionCount: sql<number>`count(distinct ${supplyDistributions.id})`,
    })
    .from(supplyDistributions)
    .innerJoin(
      supplyDistributionItems,
      eq(supplyDistributions.id, supplyDistributionItems.distributionId)
    )
    .innerJoin(supplies, eq(supplyDistributionItems.supplyId, supplies.id))
    .leftJoin(users, eq(supplyDistributions.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(supplyDistributions.userId, session.user.id),
        gte(
          supplyDistributions.distributionDate,
          startOfPeriod.toISOString().split('T')[0]
        ),
        lt(
          supplyDistributions.distributionDate,
          endOfPeriod.toISOString().split('T')[0]
        )
      )
    )
    .groupBy(supplies.id, supplies.name)
    .orderBy(
      sql`coalesce(sum(${supplyDistributionItems.quantityDistributed}), 0) DESC`
    );

  // Get activity type breakdown by region - only activities with events
  const activityTypeByRegionData = await db
    .select({
      activityTypeId: activityTypes.id,
      activityTypeName: activityTypes.name,
      programGoalName: programGoals.name,
      region: users.region,
      eventCount: sql<number>`count(${events.id})`,
      participantsServed: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
      newParticipants: sql<number>`coalesce(sum(${events.newParticipants}), 0)`,
      returningParticipants: sql<number>`coalesce(sum(${events.returningParticipants}), 0)`,
      totalAdminDuration: sql<number>`coalesce(sum(${events.adminDuration}), 0)`,
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

  // Get month-over-month participant growth by region
  const currentPeriodStart = startOfPeriod;
  const currentPeriodEnd = endOfPeriod;

  // Calculate previous period (same duration as current period)
  const periodDurationMs =
    currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const previousPeriodEnd = new Date(currentPeriodStart.getTime());
  const previousPeriodStart = new Date(
    currentPeriodStart.getTime() - periodDurationMs
  );

  // Get current period participants by region
  const currentPeriodParticipantsData = await db
    .select({
      region: users.region,
      participants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, currentPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, currentPeriodEnd.toISOString().split('T')[0]),
        sql`${users.region} IS NOT NULL`
      )
    )
    .groupBy(users.region);

  // Get previous period participants by region
  const previousPeriodParticipantsData = await db
    .select({
      region: users.region,
      participants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, previousPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, previousPeriodEnd.toISOString().split('T')[0]),
        sql`${users.region} IS NOT NULL`
      )
    )
    .groupBy(users.region);

  // Get current period events by region
  const currentPeriodEventsData = await db
    .select({
      region: users.region,
      eventCount: sql<number>`count(${events.id})`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, currentPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, currentPeriodEnd.toISOString().split('T')[0]),
        sql`${users.region} IS NOT NULL`
      )
    )
    .groupBy(users.region);

  // Get previous period events by region
  const previousPeriodEventsData = await db
    .select({
      region: users.region,
      eventCount: sql<number>`count(${events.id})`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, previousPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, previousPeriodEnd.toISOString().split('T')[0]),
        sql`${users.region} IS NOT NULL`
      )
    )
    .groupBy(users.region);

  // Get current period total cost by region
  const currentPeriodRegionalCostData = await db
    .select({
      region: users.region,
      totalCost: sql<number>`coalesce(sum(${events.totalCost}), 0)`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, currentPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, currentPeriodEnd.toISOString().split('T')[0]),
        sql`${users.region} IS NOT NULL`
      )
    )
    .groupBy(users.region);

  // Get previous period total cost by region
  const previousPeriodRegionalCostData = await db
    .select({
      region: users.region,
      totalCost: sql<number>`coalesce(sum(${events.totalCost}), 0)`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(events.userId, session.user.id),
        gte(events.eventDate, previousPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, previousPeriodEnd.toISOString().split('T')[0]),
        sql`${users.region} IS NOT NULL`
      )
    )
    .groupBy(users.region);

  // Calculate overall cost growth
  const totalCurrentCost = currentPeriodRegionalCostData.reduce(
    (sum, item) => sum + Number(item.totalCost),
    0
  );
  const totalPreviousCost = previousPeriodRegionalCostData.reduce(
    (sum, item) => sum + Number(item.totalCost),
    0
  );

  let costGrowthRate = 0;
  let costGrowthType: 'growth' | 'decline' | 'stable' = 'stable';

  if (totalPreviousCost > 0) {
    costGrowthRate = Math.round(
      ((totalCurrentCost - totalPreviousCost) / totalPreviousCost) * 100
    );
  } else if (totalCurrentCost > 0) {
    costGrowthRate = 100; // 100% increase from 0
  }

  if (costGrowthRate > 2) costGrowthType = 'growth';
  else if (costGrowthRate < -2) costGrowthType = 'decline';
  else costGrowthType = 'stable';

  const monthlyCostGrowth: MonthlyCostGrowth = {
    currentMonthCost: totalCurrentCost,
    previousMonthCost: totalPreviousCost,
    growthRate: costGrowthRate,
    growthType: costGrowthType,
  };

  // Calculate regional cost growth
  const regionalCostGrowthData: RegionalCostGrowth[] = [];
  const currentPeriodRegionalCostMap = new Map(
    currentPeriodRegionalCostData.map(item => [
      item.region,
      Number(item.totalCost),
    ])
  );
  const previousPeriodRegionalCostMap = new Map(
    previousPeriodRegionalCostData.map(item => [
      item.region,
      Number(item.totalCost),
    ])
  );

  // Get all regions from both periods for costs
  const allCostRegions = new Set([
    ...currentPeriodRegionalCostMap.keys(),
    ...previousPeriodRegionalCostMap.keys(),
  ]);

  allCostRegions.forEach(region => {
    const currentCost = currentPeriodRegionalCostMap.get(region) || 0;
    const previousCost = previousPeriodRegionalCostMap.get(region) || 0;

    let growthRate = 0;
    let growthType: 'growth' | 'decline' | 'stable' = 'stable';

    if (previousCost > 0) {
      growthRate = Math.round(
        ((currentCost - previousCost) / previousCost) * 100
      );
    } else if (currentCost > 0) {
      growthRate = 100; // 100% growth from 0
    }

    if (growthRate > 2) growthType = 'growth';
    else if (growthRate < -2) growthType = 'decline';
    else growthType = 'stable';

    // Only include regions that have activity in current period
    if (currentCost > 0) {
      regionalCostGrowthData.push({
        region,
        currentMonthCost: currentCost,
        previousMonthCost: previousCost,
        growthRate,
        growthType,
      });
    }
  });

  // Sort by current cost (descending)
  regionalCostGrowthData.sort(
    (a, b) => b.currentMonthCost - a.currentMonthCost
  );

  // Calculate participant growth rates
  const monthlyParticipantGrowthData: MonthlyParticipantGrowth[] = [];
  const currentPeriodParticipantsMap = new Map(
    currentPeriodParticipantsData.map(item => [
      item.region,
      Number(item.participants),
    ])
  );
  const previousPeriodParticipantsMap = new Map(
    previousPeriodParticipantsData.map(item => [
      item.region,
      Number(item.participants),
    ])
  );

  // Calculate event growth rates
  const monthlyEventGrowthData: MonthlyEventGrowth[] = [];
  const currentPeriodEventsMap = new Map(
    currentPeriodEventsData.map(item => [item.region, Number(item.eventCount)])
  );
  const previousPeriodEventsMap = new Map(
    previousPeriodEventsData.map(item => [item.region, Number(item.eventCount)])
  );

  // Get all regions from both periods for participants
  const allParticipantRegions = new Set([
    ...currentPeriodParticipantsMap.keys(),
    ...previousPeriodParticipantsMap.keys(),
  ]);

  allParticipantRegions.forEach(region => {
    const currentParticipants = currentPeriodParticipantsMap.get(region) || 0;
    const previousParticipants = previousPeriodParticipantsMap.get(region) || 0;

    let growthRate = 0;
    let growthType: 'growth' | 'decline' | 'stable' = 'stable';

    if (previousParticipants > 0) {
      growthRate = Math.round(
        ((currentParticipants - previousParticipants) / previousParticipants) *
          100
      );
    } else if (currentParticipants > 0) {
      growthRate = 100; // 100% growth from 0
    }

    if (growthRate > 2) growthType = 'growth';
    else if (growthRate < -2) growthType = 'decline';
    else growthType = 'stable';

    // Only include regions that have activity in current period
    if (currentParticipants > 0) {
      monthlyParticipantGrowthData.push({
        region,
        currentMonthParticipants: currentParticipants,
        previousMonthParticipants: previousParticipants,
        growthRate,
        growthType,
      });
    }
  });

  // Get all regions from both periods for events
  const allEventRegions = new Set([
    ...currentPeriodEventsMap.keys(),
    ...previousPeriodEventsMap.keys(),
  ]);

  allEventRegions.forEach(region => {
    const currentEvents = currentPeriodEventsMap.get(region) || 0;
    const previousEvents = previousPeriodEventsMap.get(region) || 0;

    let growthRate = 0;
    let growthType: 'growth' | 'decline' | 'stable' = 'stable';

    if (previousEvents > 0) {
      growthRate = Math.round(
        ((currentEvents - previousEvents) / previousEvents) * 100
      );
    } else if (currentEvents > 0) {
      growthRate = 100; // 100% growth from 0
    }

    if (growthRate > 2) growthType = 'growth';
    else if (growthRate < -2) growthType = 'decline';
    else growthType = 'stable';

    // Only include regions that have activity in current period
    if (currentEvents > 0) {
      monthlyEventGrowthData.push({
        region,
        currentMonthEvents: currentEvents,
        previousMonthEvents: previousEvents,
        growthRate,
        growthType,
      });
    }
  });

  // Sort by current values (descending)
  monthlyParticipantGrowthData.sort(
    (a, b) => b.currentMonthParticipants - a.currentMonthParticipants
  );
  monthlyEventGrowthData.sort(
    (a, b) => b.currentMonthEvents - a.currentMonthEvents
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

  // Map supply distribution data
  const supplyDistributionsWithNumbers: SupplyDistributionSummary[] =
    supplyDistributionData.map(item => ({
      supplyId: item.supplyId,
      supplyName: item.supplyName,
      totalQuantityDistributed: Number(item.totalQuantityDistributed),
      totalCost: Number(item.totalCost),
      distributionCount: Number(item.distributionCount),
    }));

  // Get previous period supply distribution data for growth calculation
  const previousPeriodSupplyData = await db
    .select({
      totalQuantityDistributed: sql<number>`coalesce(sum(${supplyDistributionItems.quantityDistributed}), 0)`,
    })
    .from(supplyDistributions)
    .innerJoin(
      supplyDistributionItems,
      eq(supplyDistributions.id, supplyDistributionItems.distributionId)
    )
    .innerJoin(supplies, eq(supplyDistributionItems.supplyId, supplies.id))
    .leftJoin(users, eq(supplyDistributions.userId, users.id))
    .where(
      and(
        session.user.role === 'admin'
          ? sql`true`
          : eq(supplyDistributions.userId, session.user.id),
        gte(
          supplyDistributions.distributionDate,
          previousPeriodStart.toISOString().split('T')[0]
        ),
        lt(
          supplyDistributions.distributionDate,
          previousPeriodEnd.toISOString().split('T')[0]
        )
      )
    );

  // Calculate supply distribution growth
  const currentPeriodSupplyQuantity = supplyDistributionData.reduce(
    (sum, item) => sum + Number(item.totalQuantityDistributed),
    0
  );
  const previousPeriodSupplyQuantity = Number(
    previousPeriodSupplyData[0]?.totalQuantityDistributed || 0
  );

  let supplyGrowthRate = 0;
  let supplyGrowthType: 'growth' | 'decline' | 'stable' = 'stable';

  if (previousPeriodSupplyQuantity > 0) {
    supplyGrowthRate = Math.round(
      ((currentPeriodSupplyQuantity - previousPeriodSupplyQuantity) /
        previousPeriodSupplyQuantity) *
        100
    );
  } else if (currentPeriodSupplyQuantity > 0) {
    supplyGrowthRate = 100; // 100% growth from 0
  }

  if (supplyGrowthRate > 2) supplyGrowthType = 'growth';
  else if (supplyGrowthRate < -2) supplyGrowthType = 'decline';
  else supplyGrowthType = 'stable';

  const monthlySupplyDistributionGrowth: MonthlySupplyDistributionGrowth = {
    currentMonthQuantity: currentPeriodSupplyQuantity,
    previousMonthQuantity: previousPeriodSupplyQuantity,
    growthRate: supplyGrowthRate,
    growthType: supplyGrowthType,
  };

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
      newParticipants: Number(item.newParticipants),
      returningParticipants: Number(item.returningParticipants),
      totalAdminDuration: Number(item.totalAdminDuration),
      totalCost: Number(item.totalCost),
    })),
    programGoals: programGoalsWithColors,
    activityTypesParticipation: activityTypesParticipationWithColors,
    monthlyParticipantGrowth: monthlyParticipantGrowthData,
    monthlyEventGrowth: monthlyEventGrowthData,
    monthlyCostGrowth: monthlyCostGrowth,
    regionalCostGrowth: regionalCostGrowthData,
    supplyDistributions: supplyDistributionsWithNumbers,
    monthlySupplyDistributionGrowth: monthlySupplyDistributionGrowth,
    regions: activeRegions.map(r => r.region).filter(Boolean),
    availableDateRange: {
      minDate: dateRange[0]?.minDate || '',
      maxDate: dateRange[0]?.maxDate || '',
    },
  };
}
