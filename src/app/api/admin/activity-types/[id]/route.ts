// app/api/admin/activity-types/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, programGoals, activityTypes } from '@/db';
import { eq } from 'drizzle-orm';
import { ActivityFeedService } from '@/lib/services/activity-feed.service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const [activityType] = await db
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
      .where(eq(activityTypes.id, id))
      .limit(1);

    if (!activityType) {
      return NextResponse.json(
        { error: 'Activity type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ activityType });
  } catch (error) {
    console.error('Activity type fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity type' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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

    // Check if activity type exists
    const [existingType] = await db
      .select()
      .from(activityTypes)
      .where(eq(activityTypes.id, id))
      .limit(1);

    if (!existingType) {
      return NextResponse.json(
        { error: 'Activity type not found' },
        { status: 404 }
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

    // Check if another activity type with this name already exists (globally, not per program goal)
    const [duplicateType] = await db
      .select()
      .from(activityTypes)
      .where(eq(activityTypes.name, name.trim()))
      .limit(1);

    if (duplicateType && duplicateType.id !== id) {
      return NextResponse.json(
        { error: 'An activity type with this name already exists' },
        { status: 400 }
      );
    }

    // Track changes
    const changes: any = {};
    if (name.trim() !== existingType.name) {
      changes.name = { old: existingType.name, new: name.trim() };
    }
    if (programGoalId !== existingType.programGoalId) {
      // Get old program goal name
      const [oldGoal] = await db
        .select()
        .from(programGoals)
        .where(eq(programGoals.id, existingType.programGoalId))
        .limit(1);
      changes.programGoalName = {
        old: oldGoal?.name || 'Unknown',
        new: programGoal.name,
      };
    }

    // Update activity type
    const [updatedType] = await db
      .update(activityTypes)
      .set({
        name: name.trim(),
        programGoalId,
        updatedAt: new Date(),
      })
      .where(eq(activityTypes.id, id))
      .returning();

    // Log update if there are changes
    if (Object.keys(changes).length > 0) {
      await ActivityFeedService.logActivityTypeUpdated(
        currentUser.id,
        id,
        changes
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity type updated successfully',
      activityType: updatedType,
    });
  } catch (error) {
    console.error('Activity type update error:', error);
    return NextResponse.json(
      { error: 'Failed to update activity type' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if activity type exists
    const [existingType] = await db
      .select()
      .from(activityTypes)
      .where(eq(activityTypes.id, id))
      .limit(1);

    if (!existingType) {
      return NextResponse.json(
        { error: 'Activity type not found' },
        { status: 404 }
      );
    }

    // Delete activity type
    await db.delete(activityTypes).where(eq(activityTypes.id, id));

    // Log deletion
    await ActivityFeedService.logActivityTypeDeleted(
      currentUser.id,
      id,
      existingType.name
    );

    return NextResponse.json({
      success: true,
      message: 'Activity type deleted successfully',
    });
  } catch (error) {
    console.error('Activity type deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity type' },
      { status: 500 }
    );
  }
}
