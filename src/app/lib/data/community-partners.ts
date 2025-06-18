import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users, communityPartners } from '@/db';
import { eq, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface CommunityPartner {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Server function to check if user has admin access
 * Returns null if unauthorized, otherwise returns user data
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
 * Get initial community partners count for display
 * This is lightweight data that's good for RSC
 */
export async function getCommunityPartnersCount(): Promise<number> {
  try {
    await checkAdminAccess();

    const result = await db.select({ count: count() }).from(communityPartners);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Community partners count error:', error);
    return 0;
  }
}
