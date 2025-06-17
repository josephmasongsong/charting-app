import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users } from '@/db';
import { eq, ilike, or, sql, count, desc, asc } from 'drizzle-orm';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition = search
      ? or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(
            sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
            `%${search}%`
          )
        )
      : undefined;

    // Get total count for pagination
    const countQuery = db.select({ count: count() }).from(users);

    if (searchCondition) {
      countQuery.where(searchCondition);
    }

    const countResult = await countQuery;
    const totalCount = countResult[0]?.count || 0;

    // Determine sort column and order
    let sortColumn;
    switch (sortBy) {
      case 'name':
        sortColumn = sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`;
        break;
      case 'email':
        sortColumn = users.email;
        break;
      case 'role':
        sortColumn = users.role;
        break;
      case 'region':
        sortColumn = users.region;
        break;
      case 'jobTitle':
        sortColumn = users.jobTitle;
        break;
      case 'isActive':
        sortColumn = users.isActive;
        break;
      case 'createdAt':
        sortColumn = users.createdAt;
        break;
      case 'updatedAt':
        sortColumn = users.updatedAt;
        break;
      default:
        sortColumn = users.createdAt;
    }

    const sortFunction = sortOrder === 'asc' ? asc : desc;

    // Build main query
    let query = db
      .select({
        id: users.id,
        name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
          'name'
        ),
        email: users.email,
        role: users.role,
        region: users.region,
        jobTitle: users.jobTitle,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    // Add search filter if provided
    if (searchCondition) {
      query = query.where(searchCondition);
    }

    // Get paginated results with sorting
    const allUsers = await query
      .limit(limit)
      .offset(offset)
      .orderBy(sortFunction(sortColumn));

    return NextResponse.json({
      users: allUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
