import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Check if user account is active
  if (session.user.isActive === false) {
    redirect('/login?error=account_deactivated');
  }

  return session;
}

export async function getSession() {
  return await getServerSession(authOptions);
}
