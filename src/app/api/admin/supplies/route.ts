// app/api/admin/supplies/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, supplies, users, siteSupplies } from '@/db';
import { eq, ilike, count, desc, asc, sql } from 'drizzle-orm';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Build where condition based on search
    const searchCondition = search
      ? ilike(supplies.name, `%${search}%`)
      : undefined;

    // Get total count for pagination
    const countResult = await db
      .select({ count: count() })
      .from(supplies)
      .where(searchCondition);

    const totalCount = countResult[0]?.count || 0;

    // Determine sort column and order
    let sortColumn;
    switch (sortBy) {
      case 'name':
        sortColumn = supplies.name;
        break;
      case 'costPerUnit':
        sortColumn = supplies.costPerUnit;
        break;
      case 'quantity':
        // Calculate total quantity from site supplies
        sortColumn = sql`COALESCE(SUM(${siteSupplies.quantity}), 0)`;
        break;
      case 'createdAt':
        sortColumn = supplies.createdAt;
        break;
      case 'updatedAt':
        sortColumn = supplies.updatedAt;
        break;
      default:
        sortColumn = supplies.createdAt;
    }

    const sortFunction = sortOrder === 'asc' ? asc : desc;

    // Build base query
    let suppliesQuery = db
      .select({
        id: supplies.id,
        name: supplies.name,
        costPerUnit: supplies.costPerUnit,
        quantity: sql<number>`COALESCE(SUM(${siteSupplies.quantity}), 0)`.as(
          'quantity'
        ),
        createdAt: supplies.createdAt,
        updatedAt: supplies.updatedAt,
      })
      .from(supplies)
      .leftJoin(siteSupplies, eq(supplies.id, siteSupplies.supplyId))
      .groupBy(
        supplies.id,
        supplies.name,
        supplies.costPerUnit,
        supplies.createdAt,
        supplies.updatedAt
      );

    // Handle different sort scenarios and apply pagination
    let orderedQuery;
    if (sortBy === 'quantity') {
      orderedQuery = suppliesQuery.orderBy(
        sortFunction(sql`COALESCE(SUM(${siteSupplies.quantity}), 0)`)
      );
    } else {
      orderedQuery = suppliesQuery.orderBy(sortFunction(sortColumn));
    }

    // Apply pagination
    const paginatedQuery = orderedQuery.limit(limit).offset(offset);

    // Apply search condition if it exists
    const allSupplies = searchCondition
      ? await paginatedQuery.where(searchCondition)
      : await paginatedQuery;

    return NextResponse.json({
      supplies: allSupplies,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Supplies fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplies' },
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

    // Check if user is admin
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

    const { name, costPerUnit } = await req.json();

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate name length
    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: 'Name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Validate cost per unit
    if (
      costPerUnit !== undefined &&
      (isNaN(parseFloat(costPerUnit)) || parseFloat(costPerUnit) < 0)
    ) {
      return NextResponse.json(
        { error: 'Cost per unit must be a valid non-negative number' },
        { status: 400 }
      );
    }

    // Check if supply with this name already exists
    const [existingSupply] = await db
      .select()
      .from(supplies)
      .where(eq(supplies.name, name.trim()))
      .limit(1);

    if (existingSupply) {
      return NextResponse.json(
        { error: 'A supply with this name already exists' },
        { status: 400 }
      );
    }

    // Create supply
    const [newSupply] = await db
      .insert(supplies)
      .values({
        name: name.trim(),
        costPerUnit: costPerUnit ? parseFloat(costPerUnit).toFixed(2) : '0.00',
        quantity: 0, // Always 0 since quantities are managed through site assignments
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Log the activity
    await ActivityFeedService.logSupplyCreated(currentUser.id, newSupply.id, {
      name: newSupply.name,
      costPerUnit: newSupply.costPerUnit,
      quantity: newSupply.quantity,
    });

    return NextResponse.json({
      success: true,
      message: 'Supply created successfully',
      supply: newSupply,
    });
  } catch (error) {
    console.error('Supply creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create supply' },
      { status: 500 }
    );
  }
}
