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

    // Get current user's managed sites, with each site's most recent event
    // date (by anyone — a colleague's event means the site isn't neglected).
    const userSites = await db
      .select({
        id: sites.id,
        name: sites.name,
        address: sites.address,
        isSingleSeniorOnly: sites.isSingleSeniorOnly,
        lastEventDate: sql<string | null>`max(${events.eventDate})`,
      })
      .from(sites)
      .leftJoin(events, eq(events.siteId, sites.id))
      .where(eq(sites.userId, session.user.id))
      .groupBy(sites.id, sites.name, sites.address, sites.isSingleSeniorOnly);

    // Sites with no event in the last STALE_SITE_DAYS days (or ever).
    const STALE_SITE_DAYS = 30;
    const msPerDay = 24 * 60 * 60 * 1000;
    const todayUtc = Date.now();
    const needsAttention = userSites
      .map(site => {
        let daysSince: number | null = null;
        if (site.lastEventDate) {
          // event_date is a DATE column serialised as YYYY-MM-DD; parse the
          // parts to avoid the UTC shift.
          const [y, m, d] = site.lastEventDate
            .slice(0, 10)
            .split('-')
            .map(Number);
          daysSince = Math.floor(
            (todayUtc - Date.UTC(y, m - 1, d)) / msPerDay
          );
        }
        return {
          siteId: site.id,
          siteName: site.name,
          lastEventDate: site.lastEventDate,
          daysSince,
        };
      })
      .filter(
        site => site.daysSince === null || site.daysSince > STALE_SITE_DAYS
      )
      .sort(
        (a, b) => (b.daysSince ?? Number.MAX_SAFE_INTEGER) -
          (a.daysSince ?? Number.MAX_SAFE_INTEGER)
      );

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
      needsAttention,
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
