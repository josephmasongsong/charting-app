import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, supplies, siteSupplies, sites, users } from '@/db';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Get supply details
    const [supply] = await db
      .select({
        id: supplies.id,
        name: supplies.name,
        costPerUnit: supplies.costPerUnit,
        createdAt: supplies.createdAt,
        updatedAt: supplies.updatedAt,
      })
      .from(supplies)
      .where(eq(supplies.id, id))
      .limit(1);

    if (!supply) {
      return NextResponse.json({ error: 'Supply not found' }, { status: 404 });
    }

    // Get site distribution for this supply
    const siteDistribution = await db
      .select({
        siteId: sites.id,
        siteName: sites.name,
        quantity: siteSupplies.quantity,
      })
      .from(siteSupplies)
      .innerJoin(sites, eq(siteSupplies.siteId, sites.id))
      .where(eq(siteSupplies.supplyId, id))
      .orderBy(sites.name);

    // The supply's total IS the sum of its site rows — the same rows returned
    // as siteDistribution below, so the header can never disagree with the
    // per-site list under it.
    const quantity = siteDistribution.reduce(
      (sum, site) => sum + site.quantity,
      0
    );
    const totalValue = Number(supply.costPerUnit) * quantity;

    return NextResponse.json({
      supply: {
        ...supply,
        quantity,
        totalValue,
      },
      siteDistribution,
    });
  } catch (error) {
    console.error('Supply detail fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supply details' },
      { status: 500 }
    );
  }
}
