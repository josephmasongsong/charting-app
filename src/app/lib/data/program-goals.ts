import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users, programGoals } from '@/db';
import { eq, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface ProgramGoal {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Server function to check if user has admin access
 */
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser || currentUser.role !== 'admin') {
    redirect('/unauthorized');
  }

  return currentUser;
}

/**
 * Get program goals for dropdown (RSC optimized)
 */
export async function getProgramGoals(): Promise<ProgramGoal[]> {
  try {
    await checkAdminAccess();

    const goals = await db
      .select({
        id: programGoals.id,
        name: programGoals.name,
      })
      .from(programGoals)
      .orderBy(programGoals.name);

    return goals;
  } catch (error) {
    console.error('Program goals fetch error:', error);
    return [];
  }
}

/**
 * Get initial program goals count for display
 */
export async function getProgramGoalsCount(): Promise<number> {
  try {
    await checkAdminAccess();

    const result = await db.select({ count: count() }).from(programGoals);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Program goals count error:', error);
    return 0;
  }
}
