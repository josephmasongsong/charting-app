import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  db,
  users,
  sites,
  events,
  supplies,
  siteSupplies,
  supplyDistributions,
  supplyDistributionItems,
} from '@/db';
import { eq, sql, desc, and } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists (any authenticated user can access options)
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    // Get sites that have supplies available
    const sitesWithSupplies = await db
      .select({
        id: sites.id,
        name: sites.name,
      })
      .from(sites)
      .innerJoin(siteSupplies, eq(sites.id, siteSupplies.siteId))
      .where(sql`${siteSupplies.quantity} > 0`)
      .groupBy(sites.id, sites.name)
      .orderBy(sites.name);

    // Get supplies available at specified site, or all supplies if no site specified
    let availableSupplies;

    if (siteId) {
      // Get supplies available at the specific site (only supplies with quantity > 0)
      availableSupplies = await db
        .select({
          id: supplies.id,
          name: supplies.name,
          costPerUnit: supplies.costPerUnit,
          availableQuantity: siteSupplies.quantity,
        })
        .from(siteSupplies)
        .innerJoin(supplies, eq(siteSupplies.supplyId, supplies.id))
        .where(
          and(
            eq(siteSupplies.siteId, siteId),
            sql`${siteSupplies.quantity} > 0`
          )
        )
        .orderBy(supplies.name);
    } else {
      // Get all supplies (for initial form load, but will be filtered when site is selected)
      availableSupplies = await db
        .select({
          id: supplies.id,
          name: supplies.name,
          costPerUnit: supplies.costPerUnit,
          availableQuantity: sql<number>`0`.as('availableQuantity'), // Will be updated when site is selected
        })
        .from(supplies)
        .orderBy(supplies.name);
    }

    // The caller's most recent distribution at the selected site, for the
    // form's "Repeat last log" prefill. Scoped to the session user's own
    // records; same session-only guard as the rest of this handler.
    let lastLog: Array<{ supplyId: string; quantity: number }> | null = null;
    if (siteId) {
      const [lastDistribution] = await db
        .select({ id: supplyDistributions.id })
        .from(supplyDistributions)
        .where(
          and(
            eq(supplyDistributions.userId, session.user.id),
            eq(supplyDistributions.siteId, siteId)
          )
        )
        .orderBy(
          desc(supplyDistributions.distributionDate),
          desc(supplyDistributions.createdAt)
        )
        .limit(1);

      if (lastDistribution) {
        lastLog = await db
          .select({
            supplyId: supplyDistributionItems.supplyId,
            quantity: supplyDistributionItems.quantityDistributed,
          })
          .from(supplyDistributionItems)
          .where(eq(supplyDistributionItems.distributionId, lastDistribution.id));
      }
    }

    // Events at the selected site, for linking an event_distribution to the
    // event it happened at. Most recent first.
    let siteEvents: Array<{ id: string; title: string; eventDate: string }> =
      [];
    if (siteId) {
      siteEvents = await db
        .select({
          id: events.id,
          title: events.title,
          eventDate: events.eventDate,
        })
        .from(events)
        .where(eq(events.siteId, siteId))
        .orderBy(desc(events.eventDate), desc(events.createdAt))
        .limit(50);
    }

    return NextResponse.json({
      sites: sitesWithSupplies,
      supplies: availableSupplies,
      lastLog,
      events: siteEvents,
    });
  } catch (error) {
    console.error('Supply distribution options fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}
