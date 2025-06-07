import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type UserRole = 'admin' | 'user' | 'partner';

export async function requireRole(role: UserRole) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Get user with role from database
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user || user.role !== role) {
    redirect('/unauthorized');
  }

  return { session, user };
}

export async function requireAdmin() {
  return await requireRole('admin');
}
