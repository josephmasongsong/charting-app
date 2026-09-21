'use server';

import {
  db,
  events,
  activityTypes,
  programGoals,
  users,
  sites,
  supplyDistributions,
  supplyDistributionItems,
  supplies,
  referrals,
} from '@/db';
import { or, sql, eq, and, gte, lt, inArray } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// The report contract lives in one place — the consuming module's types.ts.
import type {
  ActivityTypeByRegion,
  ProgramGoalSummary,
  ActivityTypeParticipation,
  MonthlyParticipantGrowth,
  MonthlyEventGrowth,
  MonthlyCostGrowth,
  RegionalCostGrowth,
  MonthlySupplyDistributionGrowth,
  SitePerformance,
  SupplyDistributionSummary,
  ReferralBreakdownItem,
  MonthlyActivityReportData,
} from '@/components/reports/monthly/types';
import {
  CHANNELS,
  REFERRED_TO,
  channelLabel,
  referredToLabel,
} from '@/lib/referral-options';

// Every taxonomy value appears (zero included) in form order, so a category's
// slot never shifts with the data; stored values outside the taxonomy trail.
function buildReferralBreakdown(
  taxonomy: readonly { value: string; label: string }[],
  counts: Map<string, number>,
  labelFor: (value: string) => string
): ReferralBreakdownItem[] {
  const known = new Set(taxonomy.map(t => t.value));
  return [
    ...taxonomy.map(t => ({
      value: t.value,
      label: t.label,
      count: counts.get(t.value) ?? 0,
    })),
    ...[...counts.entries()]
      .filter(([value]) => !known.has(value))
      .map(([value, count]) => ({ value, label: labelFor(value), count })),
  ];
}

// Builds the all-regions report plus one report per region that had events in
// the period, so the page can switch region tabs without another round trip.
export async function generateMonthlyActivityReport(
  startYear: number,
  startMonth: number,
  endYear?: number,
  endMonth?: number
): Promise<MonthlyActivityReportData> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  const user = { id: session.user.id, role: session.user.role };

  const overall = await buildMonthlyActivityReport(
    user,
    startYear,
    startMonth,
    endYear,
    endMonth
  );
  const regionEntries = await Promise.all(
    overall.regions.map(
      async region =>
        [
          region,
          await buildMonthlyActivityReport(
            user,
            startYear,
            startMonth,
            endYear,
            endMonth,
            region
          ),
        ] as const
    )
  );

  return { ...overall, regionReports: Object.fromEntries(regionEntries) };
}

type ReportUser = { id: string; role?: string | null };

async function buildMonthlyActivityReport(
  user: ReportUser,
  startYear: number,
  startMonth: number,
  endYear?: number,
  endMonth?: number,
  region?: string
): Promise<MonthlyActivityReportData> {
  // Restricts a query to sites in the region; a no-op for the all-regions report.
  const regionScope = (siteIdColumn: AnyPgColumn) =>
    region
      ? inArray(
          siteIdColumn,
          db.select({ id: sites.id }).from(sites).where(eq(sites.region, region))
        )
      : sql`true`;


  // Get available date range from actual events
  const dateRange = await db
    .select({
      minDate: sql<string>`min(${events.eventDate})`,
      maxDate: sql<string>`max(${events.eventDate})`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      user.role === 'admin'
        ? sql`true`
        : eq(events.userId, user.id)
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
        user.role === 'admin'
          ? sql`true`
          : eq(supplyDistributions.userId, user.id),
        regionScope(supplyDistributions.siteId),
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
      region: sites.region,
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
    .leftJoin(sites, eq(events.siteId, sites.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, startOfPeriod.toISOString().split('T')[0]),
        lt(events.eventDate, endOfPeriod.toISOString().split('T')[0]),
        sql`${activityTypes.id} IS NOT NULL`,
        sql`${sites.region} IS NOT NULL`
      )
    )
    .groupBy(
      activityTypes.id,
      activityTypes.name,
      programGoals.name,
      sites.region
    )
    .having(sql`count(${events.id}) > 0`)
    .orderBy(sites.region, activityTypes.name);

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
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
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
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
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
      totalTagEvents: sql<number>`count(*) filter (where ${events.usedTenantActivityGrant})`,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
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
      region: sites.region,
      participants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
    })
    .from(events)
    .leftJoin(sites, eq(events.siteId, sites.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, currentPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, currentPeriodEnd.toISOString().split('T')[0]),
        sql`${sites.region} IS NOT NULL`
      )
    )
    .groupBy(sites.region);

  // Get previous period participants by region
  const previousPeriodParticipantsData = await db
    .select({
      region: sites.region,
      participants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
      newParticipants: sql<number>`coalesce(sum(${events.newParticipants}), 0)`,
    })
    .from(events)
    .leftJoin(sites, eq(events.siteId, sites.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, previousPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, previousPeriodEnd.toISOString().split('T')[0]),
        sql`${sites.region} IS NOT NULL`
      )
    )
    .groupBy(sites.region);

  // Get current period events by region
  const currentPeriodEventsData = await db
    .select({
      region: sites.region,
      eventCount: sql<number>`count(${events.id})`,
    })
    .from(events)
    .leftJoin(sites, eq(events.siteId, sites.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, currentPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, currentPeriodEnd.toISOString().split('T')[0]),
        sql`${sites.region} IS NOT NULL`
      )
    )
    .groupBy(sites.region);

  // Get previous period events by region
  const previousPeriodEventsData = await db
    .select({
      region: sites.region,
      eventCount: sql<number>`count(${events.id})`,
    })
    .from(events)
    .leftJoin(sites, eq(events.siteId, sites.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, previousPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, previousPeriodEnd.toISOString().split('T')[0]),
        sql`${sites.region} IS NOT NULL`
      )
    )
    .groupBy(sites.region);

  // Get current period total cost by region
  const currentPeriodRegionalCostData = await db
    .select({
      region: sites.region,
      totalCost: sql<number>`coalesce(sum(${events.totalCost}), 0)`,
    })
    .from(events)
    .leftJoin(sites, eq(events.siteId, sites.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, currentPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, currentPeriodEnd.toISOString().split('T')[0]),
        sql`${sites.region} IS NOT NULL`
      )
    )
    .groupBy(sites.region);

  // Get previous period total cost by region
  const previousPeriodRegionalCostData = await db
    .select({
      region: sites.region,
      totalCost: sql<number>`coalesce(sum(${events.totalCost}), 0)`,
    })
    .from(events)
    .leftJoin(sites, eq(events.siteId, sites.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, previousPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, previousPeriodEnd.toISOString().split('T')[0]),
        sql`${sites.region} IS NOT NULL`
      )
    )
    .groupBy(sites.region);

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
    // Skip null regions
    if (!region) return;

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
    // Skip null regions
    if (!region) return;

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
    // Skip null regions
    if (!region) return;

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
    .selectDistinct({ region: sites.region })
    .from(events)
    .leftJoin(sites, eq(events.siteId, sites.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, startOfPeriod.toISOString().split('T')[0]),
        lt(events.eventDate, endOfPeriod.toISOString().split('T')[0]),
        sql`${sites.region} IS NOT NULL`
      )
    )
    .orderBy(sites.region);

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

  // Map program goals, filtering out nulls
  const programGoalsWithColors: ProgramGoalSummary[] = programGoalsData
    .filter(goal => goal.programGoalId && goal.programGoalName)
    .map(goal => ({
      id: goal.programGoalId!,
      name: goal.programGoalName!,
      activityCount: Number(goal.activityCount),
    }));

  // Map activity types participation, filtering out nulls
  const activityTypesParticipationWithColors: ActivityTypeParticipation[] =
    activityTypesParticipationData
      .filter(activity => activity.activityTypeId && activity.activityTypeName)
      .map(activity => ({
        id: activity.activityTypeId!,
        name: activity.activityTypeName!,
        participantCount: Number(activity.participantCount),
        eventCount: Number(activity.eventCount),
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
        user.role === 'admin'
          ? sql`true`
          : eq(supplyDistributions.userId, user.id),
        regionScope(supplyDistributions.siteId),
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

  // Get site performance data
  const sitePerformanceData = await db
    .select({
      siteName: sites.name,
      eventCount: sql<number>`count(${events.id})`,
      participantCount: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
    })
    .from(events)
    .leftJoin(sites, eq(events.siteId, sites.id))
    .leftJoin(users, eq(events.userId, users.id))
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, startOfPeriod.toISOString().split('T')[0]),
        lt(events.eventDate, endOfPeriod.toISOString().split('T')[0]),
        sql`${sites.name} IS NOT NULL`
      )
    )
    .groupBy(sites.name)
    .orderBy(sql`count(${events.id}) DESC`);

  // Calculate utilization rates (assuming 100 events = 100% utilization)
  const maxPossibleEvents = 100;
  const sitePerformanceWithUtilization: SitePerformance[] = sitePerformanceData
    .filter(site => site.siteName)
    .map(site => ({
      siteName: site.siteName!,
      eventCount: Number(site.eventCount),
      participantCount: Number(site.participantCount),
      utilizationRate: Math.min(
        Math.round((Number(site.eventCount) / maxPossibleEvents) * 100),
        100
      ),
    }));

  // Role-scoped eligible-site denominator for the coverage line: admins see
  // all sites; workers see only the sites they manage — matching the
  // event-scoping used by the site performance query above.
  const [siteCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sites)
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : or(eq(sites.tewId, user.id), eq(sites.pphId, user.id)),
        region ? eq(sites.region, region) : sql`true`
      )
    );
  const totalSiteCount = Number(siteCountRow?.count || 0);

  const [previousTagRow] = await db
    .select({
      count: sql<number>`count(*) filter (where ${events.usedTenantActivityGrant})`,
    })
    .from(events)
    .where(
      and(
        user.role === 'admin'
          ? sql`true`
          : eq(events.userId, user.id),
        regionScope(events.siteId),
        gte(events.eventDate, previousPeriodStart.toISOString().split('T')[0]),
        lt(events.eventDate, previousPeriodEnd.toISOString().split('T')[0])
      )
    );

  // Referrals follow the same role scoping as events: admins see all, workers
  // only the ones they logged.
  const referralScope = and(
    user.role === 'admin' ? sql`true` : eq(referrals.userId, user.id),
    regionScope(referrals.siteId)
  );

  const referralRows = await db
    .select({
      referredTo: referrals.referredTo,
      channel: referrals.channel,
      count: sql<number>`count(*)`,
    })
    .from(referrals)
    .where(
      and(
        referralScope,
        gte(referrals.referralDate, startOfPeriod.toISOString().split('T')[0]),
        lt(referrals.referralDate, endOfPeriod.toISOString().split('T')[0])
      )
    )
    .groupBy(referrals.referredTo, referrals.channel);

  const [previousReferralRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(referrals)
    .where(
      and(
        referralScope,
        gte(
          referrals.referralDate,
          previousPeriodStart.toISOString().split('T')[0]
        ),
        lt(
          referrals.referralDate,
          previousPeriodEnd.toISOString().split('T')[0]
        )
      )
    );

  const referredToCounts = new Map<string, number>();
  const channelCounts = new Map<string, number>();
  for (const row of referralRows) {
    const count = Number(row.count);
    referredToCounts.set(
      row.referredTo,
      (referredToCounts.get(row.referredTo) ?? 0) + count
    );
    channelCounts.set(
      row.channel,
      (channelCounts.get(row.channel) ?? 0) + count
    );
  }

  const referralSummary = {
    total: referralRows.reduce((sum, row) => sum + Number(row.count), 0),
    previousTotal: Number(previousReferralRow?.count || 0),
    byReferredTo: buildReferralBreakdown(
      REFERRED_TO,
      referredToCounts,
      referredToLabel
    ),
    byChannel: buildReferralBreakdown(CHANNELS, channelCounts, channelLabel),
  };

  return {
    reportMonth,
    totalEvents: totalMetrics[0]?.totalEvents || 0,
    totalParticipants: totalMetrics[0]?.totalParticipants || 0,
    totalNewParticipants: totalMetrics[0]?.totalNewParticipants || 0,
    totalReturningParticipants:
      totalMetrics[0]?.totalReturningParticipants || 0,
    totalPreviousNewParticipants: previousPeriodParticipantsData.reduce(
      (sum, row) => sum + Number(row.newParticipants),
      0
    ),
    totalTagEvents: Number(totalMetrics[0]?.totalTagEvents || 0),
    totalPreviousTagEvents: Number(previousTagRow?.count || 0),
    totalCost: Number(totalMetrics[0]?.totalCost || 0),
    totalEventDuration: Number(totalMetrics[0]?.totalEventDuration || 0),
    totalAdminDuration: Number(totalMetrics[0]?.totalAdminDuration || 0),
    activityTypesByRegion: activityTypeByRegionData
      .filter(
        item =>
          item.activityTypeId &&
          item.activityTypeName &&
          item.programGoalName &&
          item.region
      )
      .map(item => ({
        activityTypeId: item.activityTypeId!,
        activityTypeName: item.activityTypeName!,
        programGoalName: item.programGoalName!,
        region: item.region!,
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
    sitePerformance: sitePerformanceWithUtilization,
    referrals: referralSummary,
    totalSiteCount,
    regions: activeRegions
      .map(r => r.region)
      .filter((r): r is string => Boolean(r)),
    availableDateRange: {
      minDate: dateRange[0]?.minDate || '',
      maxDate: dateRange[0]?.maxDate || '',
    },
  };
}
