import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, activityTypes, programGoals } from '@/db';
import { eq, ilike, or, count, desc, asc } from 'drizzle-orm';
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
      ? or(
          ilike(activityTypes.name, `%${search}%`),
          ilike(programGoals.name, `%${search}%`)
        )
      : undefined;

    // Get total count for pagination with join
    const countQuery = db
      .select({ count: count() })
      .from(activityTypes)
      .leftJoin(programGoals, eq(activityTypes.programGoalId, programGoals.id));

    const countResult = searchCondition
      ? await countQuery.where(searchCondition)
      : await countQuery;

    const totalCount = countResult[0]?.count || 0;

    // Determine sort column and order
    let sortColumn;
    switch (sortBy) {
      case 'name':
        sortColumn = activityTypes.name;
        break;
      case 'programGoal':
        sortColumn = programGoals.name;
        break;
      case 'createdAt':
        sortColumn = activityTypes.createdAt;
        break;
      case 'updatedAt':
        sortColumn = activityTypes.updatedAt;
        break;
      default:
        sortColumn = activityTypes.createdAt;
    }

    const sortFunction = sortOrder === 'asc' ? asc : desc;

    // Get paginated results with program goal data
    let typesQuery = db
      .select({
        id: activityTypes.id,
        name: activityTypes.name,
        programGoalId: activityTypes.programGoalId,
        programGoalName: programGoals.name,
        createdAt: activityTypes.createdAt,
        updatedAt: activityTypes.updatedAt,
      })
      .from(activityTypes)
      .leftJoin(programGoals, eq(activityTypes.programGoalId, programGoals.id))
      .limit(limit)
      .offset(offset)
      .orderBy(sortFunction(sortColumn));

    // Apply search condition if it exists
    const allTypes = searchCondition
      ? await typesQuery.where(searchCondition)
      : await typesQuery;

    return NextResponse.json({
      activityTypes: allTypes,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Activity types fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity types' },
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

    const { name, programGoalId } = await req.json();

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!programGoalId || typeof programGoalId !== 'string') {
      return NextResponse.json(
        { error: 'Program Goal is required' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: 'Name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Check if program goal exists
    const [programGoal] = await db
      .select()
      .from(programGoals)
      .where(eq(programGoals.id, programGoalId))
      .limit(1);

    if (!programGoal) {
      return NextResponse.json(
        { error: 'Selected program goal does not exist' },
        { status: 400 }
      );
    }

    // Check if activity type with this exact name already exists (regardless of program goal)
    // This prevents duplicate activity type names globally
    const [existingType] = await db
      .select()
      .from(activityTypes)
      .where(eq(activityTypes.name, name.trim()))
      .limit(1);

    if (existingType) {
      return NextResponse.json(
        { error: 'An activity type with this name already exists' },
        { status: 400 }
      );
    }

    // Create activity type
    const [newType] = await db
      .insert(activityTypes)
      .values({
        name: name.trim(),
        programGoalId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await ActivityFeedService.logActivityTypeCreated(
      currentUser.id,
      newType.id,
      {
        name: newType.name,
        programGoalName: programGoal.name,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Activity type created successfully',
      activityType: newType,
    });
  } catch (error) {
    console.error('Activity type creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity type' },
      { status: 500 }
    );
  }
}
