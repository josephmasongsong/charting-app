// app/api/admin/supply-distributions/[id]/details/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  db,
  supplyDistributions,
  supplyDistributionItems,
  supplies,
  sites,
  users,
  events,
} from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Get distribution details with related data
    const [distribution] = await db
      .select({
        id: supplyDistributions.id,
        eventId: supplyDistributions.eventId,
        eventTitle: events.title,
        siteId: supplyDistributions.siteId,
        siteName: sites.name,
        userId: supplyDistributions.userId,
        userName: users.firstName,
        distributionDate: supplyDistributions.distributionDate,
        distributionType: supplyDistributions.distributionType,
        recipientNotes: supplyDistributions.recipientNotes,
        totalCost: supplyDistributions.totalCost,
        notes: supplyDistributions.notes,
        createdAt: supplyDistributions.createdAt,
        updatedAt: supplyDistributions.updatedAt,
      })
      .from(supplyDistributions)
      .leftJoin(sites, eq(supplyDistributions.siteId, sites.id))
      .leftJoin(users, eq(supplyDistributions.userId, users.id))
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
      })
      .from(supplyDistributionItems)
      .innerJoin(supplies, eq(supplyDistributionItems.supplyId, supplies.id))
      .where(eq(supplyDistributionItems.distributionId, id))
      .orderBy(supplies.name);

    return NextResponse.json({
      distribution: {
        ...distribution,
        userName: `${distribution.userName} ${users.lastName}`, // Full name
      },
      distributionItems,
    });
  } catch (error) {
    console.error('Distribution detail fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch distribution details' },
      { status: 500 }
    );
  }
}
