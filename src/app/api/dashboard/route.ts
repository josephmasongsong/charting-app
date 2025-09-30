// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, sites, events, supplyDistributions } from '@/db';
import { eq, sql, gte, and } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and is active
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || !currentUser.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 403 }
      );
    }

    // Get current user's managed sites
    const userSites = await db
      .select({
        id: sites.id,
        name: sites.name,
        address: sites.address,
        isSingleSeniorOnly: sites.isSingleSeniorOnly,
      })
      .from(sites)
      .where(eq(sites.userId, session.user.id));

    // Calculate date for "this month"
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Monthly Metrics
    const [monthlyEvents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(
        and(
          eq(events.userId, session.user.id),
          gte(events.eventDate, startOfMonth.toISOString().split('T')[0])
        )
      );

    const [monthlyParticipants] = await db
      .select({
        totalParticipants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
      })
      .from(events)
      .where(
        and(
          eq(events.userId, session.user.id),
          gte(events.eventDate, startOfMonth.toISOString().split('T')[0])
        )
      );

    const [monthlyDistributions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(supplyDistributions)
      .where(
        and(
          eq(supplyDistributions.userId, session.user.id),
          gte(
            supplyDistributions.distributionDate,
            startOfMonth.toISOString().split('T')[0]
          )
        )
      );

    const [monthlyAdminTime] = await db
      .select({
        totalMinutes: sql<number>`coalesce(sum(${events.adminDuration}), 0)`,
      })
      .from(events)
      .where(
        and(
          eq(events.userId, session.user.id),
          gte(events.eventDate, startOfMonth.toISOString().split('T')[0])
        )
      );

    // All-Time Metrics
    const [allTimeEvents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(eq(events.userId, session.user.id));

    const [allTimeParticipants] = await db
      .select({
        totalParticipants: sql<number>`coalesce(sum(${events.newParticipants} + ${events.returningParticipants}), 0)`,
      })
      .from(events)
      .where(eq(events.userId, session.user.id));

    const [allTimeDistributions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(supplyDistributions)
      .where(eq(supplyDistributions.userId, session.user.id));

    const [allTimeAdminTime] = await db
      .select({
        totalMinutes: sql<number>`coalesce(sum(${events.adminDuration}), 0)`,
      })
      .from(events)
      .where(eq(events.userId, session.user.id));

    // Convert minutes to hours
    const monthlyAdminHours = Math.round(
      (monthlyAdminTime?.totalMinutes || 0) / 60
    );
    const allTimeAdminHours = Math.round(
      (allTimeAdminTime?.totalMinutes || 0) / 60
    );

    const dashboardData = {
      userSites,
      monthlyMetrics: {
        events: monthlyEvents?.count || 0,
        participants: monthlyParticipants?.totalParticipants || 0,
        distributions: monthlyDistributions?.count || 0,
        adminHours: monthlyAdminHours,
      },
      allTimeMetrics: {
        events: allTimeEvents?.count || 0,
        participants: allTimeParticipants?.totalParticipants || 0,
        distributions: allTimeDistributions?.count || 0,
        adminHours: allTimeAdminHours,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
