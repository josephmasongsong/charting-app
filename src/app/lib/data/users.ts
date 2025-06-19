import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users } from '@/db';
import { eq, count } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'partner';
  region?: string;
  jobTitle?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
}

export interface UserSession {
  id: string;
  role: 'admin' | 'user' | 'partner';
  email: string;
  name: string;
}

/**
 * Server function to check if user has admin access and return session
 */
async function checkAdminAccess(): Promise<UserSession> {
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

  return {
    id: currentUser.id,
    role: currentUser.role,
    email: currentUser.email,
    name: currentUser.firstName + ' ' + currentUser.lastName,
  };
}

/**
 * Get initial users count and current user session for RSC
 */
export async function getUsersData(): Promise<{
  count: number;
  currentUser: UserSession;
}> {
  try {
    const currentUser = await checkAdminAccess();

    const result = await db.select({ count: count() }).from(users);

    return {
      count: result[0]?.count || 0,
      currentUser,
    };
  } catch (error) {
    console.error('Users data error:', error);
    return {
      count: 0,
      currentUser: {
        id: '',
        role: 'user',
        email: '',
        name: '',
      },
    };
  }
}
