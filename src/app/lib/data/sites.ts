import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users, sites } from '@/db';
import { eq, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface Site {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  numberOfTenants: number;
  hasCommunityRoom: boolean;
  hasCommunityPartner: boolean;
  communityPartnerId: string | null;
  communityPartnerName: string | null;
  isSingleSeniorOnly: boolean;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
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
 * Get initial sites count for display
 * This is lightweight data that's good for RSC
 */
export async function getSitesCount(): Promise<number> {
  try {
    await checkAdminAccess();

    const result = await db.select({ count: count() }).from(sites);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Sites count error:', error);
    return 0;
  }
}
