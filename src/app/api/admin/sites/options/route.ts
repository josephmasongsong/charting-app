import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, communityPartners } from '@/db';
import { eq, sql } from 'drizzle-orm';

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

    // Get all users for dropdown
    const usersData = await db
      .select({
        id: users.id,
        name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
          'name'
        ),
        email: users.email,
      })
      .from(users)
      // .orderBy(users.name)
      .orderBy(sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`);

    // Get all community partners for dropdown
    const partnersData = await db
      .select({
        id: communityPartners.id,
        name: communityPartners.name,
      })
      .from(communityPartners)
      .orderBy(communityPartners.name);

    return NextResponse.json({
      users: usersData,
      communityPartners: partnersData,
    });
  } catch (error) {
    console.error('Options fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}
