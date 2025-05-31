import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, programGoals, users } from '@/db';
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

    const { id } = params;

    const [goal] = await db
      .select()
      .from(programGoals)
      .where(eq(programGoals.id, id))
      .limit(1);

    if (!goal) {
      return NextResponse.json(
        { error: 'Program goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ programGoal: goal });
  } catch (error) {
    console.error('Program goal fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program goal' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
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

    const { id } = params;
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

    // Check if program goal exists
    const [existingGoal] = await db
      .select()
      .from(programGoals)
      .where(eq(programGoals.id, id))
      .limit(1);

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Program goal not found' },
        { status: 404 }
      );
    }

    // Check if another goal with this name already exists
    const [duplicateGoal] = await db
      .select()
      .from(programGoals)
      .where(eq(programGoals.name, name.trim()))
      .limit(1);

    if (duplicateGoal && duplicateGoal.id !== id) {
      return NextResponse.json(
        { error: 'A program goal with this name already exists' },
        { status: 400 }
      );
    }

    // Update program goal
    const [updatedGoal] = await db
      .update(programGoals)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(programGoals.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Program goal updated successfully',
      programGoal: updatedGoal,
    });
  } catch (error) {
    console.error('Program goal update error:', error);
    return NextResponse.json(
      { error: 'Failed to update program goal' },
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

    const { id } = params;

    // Check if program goal exists
    const [existingGoal] = await db
      .select()
      .from(programGoals)
      .where(eq(programGoals.id, id))
      .limit(1);

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Program goal not found' },
        { status: 404 }
      );
    }

    // Delete program goal
    await db.delete(programGoals).where(eq(programGoals.id, id));

    return NextResponse.json({
      success: true,
      message: 'Program goal deleted successfully',
    });
  } catch (error) {
    console.error('Program goal deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete program goal' },
      { status: 500 }
    );
  }
}
