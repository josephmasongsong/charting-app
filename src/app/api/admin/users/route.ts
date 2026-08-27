import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users } from '@/db';
import { eq, ilike, or, and, isNull, isNotNull, sql, count, desc, asc } from 'drizzle-orm';

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

    // status=pending -> invited accounts that have never signed in.
    const status = searchParams.get('status');
    const pendingCondition =
      status === 'pending'
        ? and(isNotNull(users.invitedAt), isNull(users.inviteAcceptedAt))
        : undefined;

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

    const whereCondition =
      searchCondition && pendingCondition
        ? and(searchCondition, pendingCondition)
        : (searchCondition ?? pendingCondition);

    // Get total count for pagination
    const countQuery = db.select({ count: count() }).from(users);

    if (whereCondition) {
      countQuery.where(whereCondition);
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
    const baseQuery = db
      .select({
        id: users.id,
        name: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
          'name'
        ),
        email: users.email,
        role: users.role,
        region: users.region,
        emailVerified: users.emailVerified,
        invitedAt: users.invitedAt,
        inviteAcceptedAt: users.inviteAcceptedAt,
        jobTitle: users.jobTitle,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    // Add search filter if provided and apply sorting and pagination
    const query = whereCondition ? baseQuery.where(whereCondition) : baseQuery;
    const orderedQuery = query.orderBy(sortFunction(sortColumn));
    const allUsers = await orderedQuery.limit(limit).offset(offset);

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
