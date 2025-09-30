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
import { eq, ilike, or, count, desc, asc, sql, and } from 'drizzle-orm';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists (any authenticated user can view distributions)
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'distributionDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const siteId = searchParams.get('siteId');
    const distributionType = searchParams.get('distributionType');
    const userId = searchParams.get('userId');
    const offset = (page - 1) * limit;

    // Build base conditions
    let conditions = [];

    // Filter by site if provided
    if (siteId) {
      conditions.push(eq(supplyDistributions.siteId, siteId));
    }

    // Filter by distribution type if provided
    if (distributionType) {
      conditions.push(
        eq(supplyDistributions.distributionType, distributionType)
      );
    }

    // Filter by user if provided (useful for "my distributions" view)
    if (userId) {
      conditions.push(eq(supplyDistributions.userId, userId));
    }

    // Non-admin users can only see their own distributions
    if (currentUser.role !== 'admin') {
      conditions.push(eq(supplyDistributions.userId, currentUser.id));
    }

    // Search condition
    if (search) {
      conditions.push(
        or(
          ilike(sites.name, `%${search}%`),
          ilike(supplyDistributions.recipientNotes, `%${search}%`),
          ilike(supplyDistributions.notes, `%${search}%`),
          ilike(
            sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
            `%${search}%`
          )
        )
      );
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const countQuery = db
      .select({ count: count() })
      .from(supplyDistributions)
      .leftJoin(users, eq(supplyDistributions.userId, users.id))
      .leftJoin(sites, eq(supplyDistributions.siteId, sites.id));

    const countResult = whereCondition
      ? await countQuery.where(whereCondition)
      : await countQuery;

    const totalCount = countResult[0]?.count || 0;

    // Determine sort column
    let sortColumn;
    switch (sortBy) {
      case 'distributionDate':
        sortColumn = supplyDistributions.distributionDate;
        break;
      case 'distributionType':
        sortColumn = supplyDistributions.distributionType;
        break;
      case 'totalCost':
        sortColumn = supplyDistributions.totalCost;
        break;
      case 'siteName':
        sortColumn = sites.name;
        break;
      case 'userName':
        sortColumn = sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`;
        break;
      case 'createdAt':
        sortColumn = supplyDistributions.createdAt;
        break;
      default:
        sortColumn = supplyDistributions.distributionDate;
    }

    const sortFunction = sortOrder === 'asc' ? asc : desc;

    // Get paginated results
    const distributionsQuery = db
      .select({
        id: supplyDistributions.id,
        eventId: supplyDistributions.eventId,
        eventTitle: events.title,
        siteId: supplyDistributions.siteId,
        siteName: sites.name,
        userId: supplyDistributions.userId,
        userName:
          sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
            'userName'
          ),
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
      .limit(limit)
      .offset(offset)
      .orderBy(sortFunction(sortColumn));

    const allDistributions = whereCondition
      ? await distributionsQuery.where(whereCondition)
      : await distributionsQuery;

    return NextResponse.json({
      distributions: allDistributions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Supply distributions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supply distributions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists (any authenticated user can create distributions)
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { distributionItems, ...distributionData } = body;

    // Validate required fields
    if (
      !distributionData.siteId ||
      !distributionData.recipientNotes ||
      !distributionItems ||
      !Array.isArray(distributionItems) ||
      distributionItems.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Site ID, recipient notes, and distribution items are required',
        },
        { status: 400 }
      );
    }

    // Validate site exists
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, distributionData.siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 400 });
    }

    // Validate event exists if provided
    if (distributionData.eventId) {
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, distributionData.eventId))
        .limit(1);

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 400 });
      }
    }

    // Validate distribution items and check inventory
    let totalCost = 0;
    const validatedItems = [];

    for (const item of distributionItems) {
      if (!item.supplyId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            error:
              'All distribution items must have valid supply ID and positive quantity',
          },
          { status: 400 }
        );
      }

      // Check supply exists
      const [supply] = await db
        .select()
        .from(supplies)
        .where(eq(supplies.id, item.supplyId))
        .limit(1);

      if (!supply) {
        return NextResponse.json(
          { error: `Supply with ID ${item.supplyId} not found` },
          { status: 400 }
        );
      }

      // Check site inventory
      const [siteSupply] = await db
        .select()
        .from(siteSupplies)
        .where(
          and(
            eq(siteSupplies.siteId, distributionData.siteId),
            eq(siteSupplies.supplyId, item.supplyId)
          )
        )
        .limit(1);

      if (!siteSupply || siteSupply.quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient inventory for ${supply.name}. Available: ${siteSupply?.quantity || 0}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      const lineTotal = parseFloat(supply.costPerUnit) * item.quantity;
      totalCost += lineTotal;

      validatedItems.push({
        supplyId: item.supplyId,
        supplyName: supply.name,
        quantity: item.quantity,
        unitCostAtTime: supply.costPerUnit,
        lineTotal: lineTotal.toFixed(2),
      });
    }

    // Use transaction to create distribution and update inventory
    const result = await db.transaction(async tx => {
      // Create distribution
      const [newDistribution] = await tx
        .insert(supplyDistributions)
        .values({
          eventId: distributionData.eventId || null,
          siteId: distributionData.siteId,
          userId: session.user.id,
          distributionDate: distributionData.distributionDate,
          distributionType: distributionData.distributionType || 'door_to_door',
          recipientNotes: distributionData.recipientNotes,
          totalCost: totalCost.toFixed(2),
          notes: distributionData.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create distribution items and update inventory
      for (const item of validatedItems) {
        // Create distribution item
        await tx.insert(supplyDistributionItems).values({
          distributionId: newDistribution.id,
          supplyId: item.supplyId,
          quantityDistributed: item.quantity,
          unitCostAtTime: item.unitCostAtTime,
          lineTotal: item.lineTotal,
          createdAt: new Date(),
        });

        // Reduce site inventory
        await tx
          .update(siteSupplies)
          .set({
            quantity: sql`${siteSupplies.quantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(siteSupplies.siteId, distributionData.siteId),
              eq(siteSupplies.supplyId, item.supplyId)
            )
          );
      }

      return newDistribution;
    });

    // Log activity
    await ActivityFeedService.logSupplyDistribution(currentUser.id, result.id, {
      siteName: site.name,
      distributionType: distributionData.distributionType || 'door_to_door',
      recipientNotes: distributionData.recipientNotes,
      totalCost: totalCost,
      supplies: validatedItems,
    });

    return NextResponse.json({
      success: true,
      message: 'Supply distribution logged successfully',
      distribution: result,
    });
  } catch (error) {
    console.error('Supply distribution creation error:', error);
    return NextResponse.json(
      { error: 'Failed to log supply distribution' },
      { status: 500 }
    );
  }
}
