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
import { eq, sql, and } from 'drizzle-orm';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = params;

    // Get distribution details
    const [distribution] = await db
      .select({
        id: supplyDistributions.id,
        eventId: supplyDistributions.eventId,
        eventTitle: events.title,
        eventDate: events.eventDate,
        siteId: supplyDistributions.siteId,
        siteName: sites.name,
        userId: supplyDistributions.userId,
        userName:
          sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
            'userName'
          ),
        userEmail: users.email,
        distributionDate: supplyDistributions.distributionDate,
        distributionType: supplyDistributions.distributionType,
        recipientNotes: supplyDistributions.recipientNotes,
        totalCost: supplyDistributions.totalCost,
        notes: supplyDistributions.notes,
        createdAt: supplyDistributions.createdAt,
        updatedAt: supplyDistributions.updatedAt,
      })
      .from(supplyDistributions)
      .leftJoin(users, eq(supplyDistributions.userId, users.id))
      .leftJoin(sites, eq(supplyDistributions.siteId, sites.id))
      .leftJoin(events, eq(supplyDistributions.eventId, events.id))
      .where(eq(supplyDistributions.id, id))
      .limit(1);

    if (!distribution) {
      return NextResponse.json(
        { error: 'Distribution not found' },
        { status: 404 }
      );
    }

    // Get distribution items
    const distributionItems = await db
      .select({
        id: supplyDistributionItems.id,
        supplyId: supplyDistributionItems.supplyId,
        supplyName: supplies.name,
        quantityDistributed: supplyDistributionItems.quantityDistributed,
        unitCostAtTime: supplyDistributionItems.unitCostAtTime,
        lineTotal: supplyDistributionItems.lineTotal,
        createdAt: supplyDistributionItems.createdAt,
      })
      .from(supplyDistributionItems)
      .innerJoin(supplies, eq(supplyDistributionItems.supplyId, supplies.id))
      .where(eq(supplyDistributionItems.distributionId, id))
      .orderBy(supplies.name);

    return NextResponse.json({
      distribution,
      distributionItems,
    });
  } catch (error) {
    console.error('Supply distribution fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch distribution' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin access
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Get distribution details for logging before deletion
    const [existingDistribution] = await db
      .select({
        id: supplyDistributions.id,
        siteId: supplyDistributions.siteId,
        distributionType: supplyDistributions.distributionType,
        siteName: sites.name,
      })
      .from(supplyDistributions)
      .leftJoin(sites, eq(supplyDistributions.siteId, sites.id))
      .where(eq(supplyDistributions.id, id))
      .limit(1);

    if (!existingDistribution) {
      return NextResponse.json(
        { error: 'Distribution not found' },
        { status: 404 }
      );
    }

    // Get distribution items count for logging
    const distributionItems = await db
      .select({
        supplyId: supplyDistributionItems.supplyId,
        quantityDistributed: supplyDistributionItems.quantityDistributed,
      })
      .from(supplyDistributionItems)
      .where(eq(supplyDistributionItems.distributionId, id));

    // Use transaction to reverse the distribution
    await db.transaction(async tx => {
      // Restore inventory for each item
      for (const item of distributionItems) {
        await tx
          .update(siteSupplies)
          .set({
            quantity: sql`${siteSupplies.quantity} + ${item.quantityDistributed}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(siteSupplies.siteId, existingDistribution.siteId),
              eq(siteSupplies.supplyId, item.supplyId)
            )
          );
      }

      // Delete distribution items first (due to foreign key)
      await tx
        .delete(supplyDistributionItems)
        .where(eq(supplyDistributionItems.distributionId, id));

      // Delete distribution
      await tx
        .delete(supplyDistributions)
        .where(eq(supplyDistributions.id, id));
    });

    // Log the deletion
    await ActivityFeedService.logSupplyDistributionDeleted(currentUser.id, id, {
      siteName: existingDistribution.siteName || 'Unknown Site',
      distributionType: existingDistribution.distributionType,
      totalItems: distributionItems.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Distribution deleted and inventory restored',
    });
  } catch (error) {
    console.error('Distribution deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete distribution' },
      { status: 500 }
    );
  }
}
