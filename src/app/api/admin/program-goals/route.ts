import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, programGoals, users } from '@/db';
import { eq, ilike, count, desc, asc } from 'drizzle-orm';
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
      ? ilike(programGoals.name, `%${search}%`)
      : undefined;

    // Get total count for pagination
    const countResult = await db
      .select({ count: count() })
      .from(programGoals)
      .where(searchCondition);

    const totalCount = countResult[0]?.count || 0;

    // Determine sort column and order
    let sortColumn;
    switch (sortBy) {
      case 'name':
        sortColumn = programGoals.name;
        break;
      case 'createdAt':
        sortColumn = programGoals.createdAt;
        break;
      case 'updatedAt':
        sortColumn = programGoals.updatedAt;
        break;
      default:
        sortColumn = programGoals.createdAt;
    }

    const sortFunction = sortOrder === 'asc' ? asc : desc;

    // Get paginated results
    let goalsQuery = db
      .select({
        id: programGoals.id,
        name: programGoals.name,
        createdAt: programGoals.createdAt,
        updatedAt: programGoals.updatedAt,
      })
      .from(programGoals)
      .limit(limit)
      .offset(offset)
      .orderBy(sortFunction(sortColumn));

    // Apply search condition if it exists
    const allGoals = searchCondition
      ? await goalsQuery.where(searchCondition)
      : await goalsQuery;

    return NextResponse.json({
      programGoals: allGoals,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Program goals fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program goals' },
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

    const { name } = await req.json();

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

    // Check if program goal with this name already exists
    const [existingGoal] = await db
      .select()
      .from(programGoals)
      .where(eq(programGoals.name, name.trim()))
      .limit(1);

    if (existingGoal) {
      return NextResponse.json(
        { error: 'A program goal with this name already exists' },
        { status: 400 }
      );
    }

    // Create program goal
    const [newGoal] = await db
      .insert(programGoals)
      .values({
        name: name.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Log the activity
    await ActivityFeedService.logProgramGoalCreated(
      currentUser.id,
      newGoal.id,
      {
        name: newGoal.name,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Program goal created successfully',
      programGoal: newGoal,
    });
  } catch (error) {
    console.error('Program goal creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create program goal' },
      { status: 500 }
    );
  }
}
