// app/api/admin/supply-distributions/options/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, sites, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and is active
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser || !currentUser.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 403 }
      );
    }

    // Get all sites for the filter dropdown
    const allSites = await db
      .select({
        id: sites.id,
        name: sites.name,
      })
      .from(sites)
      .orderBy(sites.name);

    return NextResponse.json({
      sites: allSites,
    });
  } catch (error) {
    console.error('Supply distributions options fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}
