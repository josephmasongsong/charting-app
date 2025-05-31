import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db, users, sites, communityPartners } from '@/db';
import { eq, ilike, or, count, desc, sql } from 'drizzle-orm';
import { createSiteSchema } from '@/app/lib/validations/sites';

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
      ? or(
          ilike(sites.name, `%${search}%`),
          ilike(sites.address, `%${search}%`),
          // ilike(users.name, `%${search}%`),
          ilike(communityPartners.name, `%${search}%`)
        )
      : undefined;

    // Get total count for pagination with joins
    const countQuery = db
      .select({ count: count() })
      .from(sites)
      .leftJoin(users, eq(sites.userId, users.id))
      .leftJoin(
        communityPartners,
        eq(sites.communityPartnerId, communityPartners.id)
      );

    const countResult = searchCondition
      ? await countQuery.where(searchCondition)
      : await countQuery;

    const totalCount = countResult[0]?.count || 0;

    // Get paginated results with related data
    let sitesQuery = db
      .select({
        id: sites.id,
        name: sites.name,
        latitude: sites.latitude,
        longitude: sites.longitude,
        address: sites.address,
        numberOfTenants: sites.numberOfTenants,
        hasCommunityRoom: sites.hasCommunityRoom,
        hasCommunityPartner: sites.hasCommunityPartner,
        communityPartnerId: sites.communityPartnerId,
        communityPartnerName: communityPartners.name,
        isSingleSeniorOnly: sites.isSingleSeniorOnly,
        userId: sites.userId,
        userName:
          sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
            'userName'
          ),
        createdAt: sites.createdAt,
        updatedAt: sites.updatedAt,
      })
      .from(sites)
      .leftJoin(users, eq(sites.userId, users.id))
      .leftJoin(
        communityPartners,
        eq(sites.communityPartnerId, communityPartners.id)
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(sites.createdAt));

    // Apply search condition if it exists
    const allSites = searchCondition
      ? await sitesQuery.where(searchCondition)
      : await sitesQuery;

    return NextResponse.json({
      sites: allSites,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Sites fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
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

    const body = await req.json();

    // Validate with Zod
    const validation = createSiteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Selected user does not exist' },
        { status: 400 }
      );
    }

    // Check community partner if specified
    if (data.hasCommunityPartner && data.communityPartnerId) {
      const [communityPartner] = await db
        .select()
        .from(communityPartners)
        .where(eq(communityPartners.id, data.communityPartnerId))
        .limit(1);

      if (!communityPartner) {
        return NextResponse.json(
          { error: 'Selected community partner does not exist' },
          { status: 400 }
        );
      }
    }

    // Check if site with this name already exists
    const [existingSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.name, data.name))
      .limit(1);

    if (existingSite) {
      return NextResponse.json(
        { error: 'A site with this name already exists' },
        { status: 400 }
      );
    }

    // Create site
    const [newSite] = await db
      .insert(sites)
      .values({
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        numberOfTenants: Number(data.numberOfTenants),
        hasCommunityRoom: data.hasCommunityRoom,
        hasCommunityPartner: data.hasCommunityPartner,
        communityPartnerId: data.hasCommunityPartner
          ? data.communityPartnerId
          : null,
        isSingleSeniorOnly: data.isSingleSeniorOnly,
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Site created successfully',
      site: newSite,
    });
  } catch (error) {
    console.error('Site creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
}
