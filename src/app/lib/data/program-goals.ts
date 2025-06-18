import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users, programGoals } from '@/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface ProgramGoal {
  id: string;
  name: string;
}

/**
 * Server function to fetch program goals for admin users
 * This runs on the server and can be called directly from RSCs
 */
export async function getProgramGoals(): Promise<ProgramGoal[]> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect('/login'); // or wherever your login page is
    }

    // Check if user is admin
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || currentUser.role !== 'admin') {
      redirect('/unauthorized'); // or throw an error
    }

    // Get all program goals for dropdown
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
    // In a server function, you can either:
    // 1. Return empty array as fallback
    // 2. Throw error to be caught by error boundary
    // 3. Redirect to error page

    // Option 1: Graceful fallback
    return [];

    // Option 2: Let error bubble up
    // throw new Error('Failed to fetch program goals');
  }
}

/**
 * Lightweight version that just returns the data without auth checks
 * Use this if auth is handled at a higher level (e.g., middleware)
 */
export async function getProgramGoalsUnchecked(): Promise<ProgramGoal[]> {
  try {
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
