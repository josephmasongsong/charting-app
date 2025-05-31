import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, communityPartners, users } from '@/db';
import { eq, ilike, count, desc } from 'drizzle-orm';

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
    const offset = (page - 1) * limit;

    // Build where condition based on search
    const searchCondition = search
      ? ilike(communityPartners.name, `%${search}%`)
      : undefined;

    // Get total count for pagination
    const countResult = await db
      .select({ count: count() })
      .from(communityPartners)
      .where(searchCondition);

    const totalCount = countResult[0]?.count || 0;

    // Get paginated results
    let partnersQuery = db
      .select({
        id: communityPartners.id,
        name: communityPartners.name,
        createdAt: communityPartners.createdAt,
        updatedAt: communityPartners.updatedAt,
      })
      .from(communityPartners)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(communityPartners.createdAt));

    // Apply search condition if it exists
    const allPartners = searchCondition
      ? await partnersQuery.where(searchCondition)
      : await partnersQuery;

    return NextResponse.json({
      communityPartners: allPartners,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Community partners fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community partners' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const { name } = await req.json();

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate name length
    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: 'Name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Check if community partner with this name already exists
    const [existingPartner] = await db
      .select()
      .from(communityPartners)
      .where(eq(communityPartners.name, name.trim()))
      .limit(1);

    if (existingPartner) {
      return NextResponse.json(
        { error: 'A community partner with this name already exists' },
        { status: 400 }
      );
    }

    // Create community partner
    const [newPartner] = await db
      .insert(communityPartners)
      .values({
        name: name.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Community partner created successfully',
      communityPartner: newPartner,
    });
  } catch (error) {
    console.error('Community partner creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create community partner' },
      { status: 500 }
    );
  }
}
