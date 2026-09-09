import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, communityPartners, supplies } from '@/db';
import { and, eq, sql } from 'drizzle-orm';
import { PPH_JOB_TITLE, TEW_JOB_TITLE } from '@/lib/job-titles';

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
    // Each assignment field only offers active users holding that job title.
    const staffByJobTitle = (jobTitle: string) =>
      db
        .select({
          id: users.id,
          name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
            'name'
          ),
          email: users.email,
        })
        .from(users)
        .where(and(eq(users.jobTitle, jobTitle), eq(users.isActive, true)))
        .orderBy(sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`);

    const [tewUsers, pphUsers] = await Promise.all([
      staffByJobTitle(TEW_JOB_TITLE),
      staffByJobTitle(PPH_JOB_TITLE),
    ]);

    // Get all community partners for dropdown
    const partnersData = await db
      .select({
        id: communityPartners.id,
        name: communityPartners.name,
      })
      .from(communityPartners)
      .orderBy(communityPartners.name);

    // Get all supplies for site supply management
    const allSupplies = await db
      .select({
        id: supplies.id,
        name: supplies.name,
        costPerUnit: supplies.costPerUnit,
        quantity: supplies.quantity,
      })
      .from(supplies)
      .orderBy(supplies.name);

    return NextResponse.json({
      tewUsers,
      pphUsers,
      communityPartners: partnersData,
      supplies: allSupplies,
    });
  } catch (error) {
    console.error('Options fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}
