import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users, programGoals } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
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

    // Get all program goals for dropdown
    const goals = await db
      .select({
        id: programGoals.id,
        name: programGoals.name,
      })
      .from(programGoals)
      .orderBy(programGoals.name);

    return NextResponse.json({ programGoals: goals });
  } catch (error) {
    console.error('Program goals options fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program goals' },
      { status: 500 }
    );
  }
}
